# Production Codebase Audit

Scope: recursive audit of `app`, `components`, `lib`, `database`, `constants`, configuration, and package state for the Next.js App Router application in this workspace.

Verification run:

- `npm run lint`: passed with 10 warnings.
- `npx tsc --noEmit`: failed on `app/api/users/email/route.ts` route-handler return typing.
- `npm run build`: first blocked by sandbox font fetch; rerun with network allowed compiled, then failed on the same TypeScript route-handler issue.
- `npm audit --omit=dev`: 0 production dependency advisories.
- `rg --files -g "*test*" -g "*spec*"`: no tests found.
- Local Next.js 16 docs were consulted under `node_modules/next/dist/docs/`, especially App Router route handlers, caching, streaming, and production checklist guidance.

## 1. Executive Summary

Overall quality: useful early App Router prototype, not production-ready. The app has a reasonable feature split (`app`, `components`, `lib/actions`, `database`) and uses Server Components for many routes, but the security boundary is porous, the data layer is inconsistent, and the production build currently fails.

Biggest weaknesses:

- Critical build blocker in a route handler return type.
- Public API endpoints can mutate users and expose account records.
- OAuth account creation is implemented as a public internal endpoint instead of a trusted data-access function.
- User-generated MDX is rendered through `next-mdx-remote/rsc`, a package that explicitly warns against passing user input.
- Database schemas lack the compound indexes required by the actual query patterns.
- Root layout and navigation call `auth()` repeatedly, blocking static shell rendering and weakening App Router caching/streaming benefits.
- There is no test coverage around auth, authorization, server actions, or route handlers.

## 2. Performance Audit

### P1. Root layout blocks every route on `auth()`

Severity: High. Affects: performance, scalability, UX.

Why: `app/layout.tsx` awaits session data before returning the HTML shell. In App Router, request-time APIs should be pushed as low as possible so public shell content can prerender/stream.

Real impact: every public page waits on auth/session IO before first byte. This makes the whole app dynamic even for pages like `/`, `/tags`, `/jobs`, and `/community`.

Principle: keep static shell static; isolate dynamic request data behind leaf Server Components or Suspense.

Snippet:

```tsx
// app/layout.tsx:25-39
const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  return (
    <html ...>
      ...
      <SessionProvider session={session}>
```

Best fix: make the root layout static where possible. Move session loading into a small `AuthSessionBoundary` around interactive auth UI, or fetch it once in the root route layout and pass it to nav/sidebar components. Add `loading.tsx` and Suspense boundaries for dynamic leaves.

### P2. Session is fetched four times in the same route tree

Severity: Medium. Affects: performance, scalability, maintainability.

Why: `auth()` is called in root layout, navbar, mobile nav, and left sidebar.

Real impact: repeated cookie/JWT/session work per request. Under load, this becomes wasted CPU and DB/session-store pressure.

Principle: request-scoped data should be fetched once and passed down, or memoized at the data-access layer.

Snippet:

```tsx
// app/layout.tsx:25
const session = await auth();
// components/navigation/navbar/Navbar.tsx:9
const session = await auth();
// components/navigation/navbar/Mobile.tsx:16
const session = await auth();
// components/LeftSideBar.tsx:9
const session = await auth();
```

Best fix: fetch the session once in a server wrapper and pass `userId`, `name`, and `image` as props to `Navbar`, `Mobile`, and `LeftSideBar`. If keeping local reads, wrap a DAL function with React `cache()`.

### P3. Server code calls its own HTTP API instead of the data layer

Severity: High. Affects: performance, scalability, reliability, maintainability.

Why: auth callbacks call `fetchHandler` against `http://localhost:3000/api` by default.

Real impact: extra HTTP serialization, dependency on a configured public base URL, missing same-request transaction context, and production failures if `NEXT_PUBLIC_API_BASE_URL` is wrong. Auth becomes coupled to route handler availability.

Principle: server-side business logic should use a data-access/service layer directly; route handlers should be adapters, not the internal API for the app itself.

Snippet:

```ts
// lib/api.ts:7-8
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

// auth.ts:29-31
const { data: existingAccount } = (await api.accounts.getByProvider(
  email
)) as ActionResponse<IAccountDoc>;
```

Best fix: create `lib/dal/accounts.ts` and `lib/dal/users.ts` with direct Mongoose queries. Use those from `auth.ts`, server actions, and route handlers.

### P4. Count and list queries run sequentially

Severity: Medium. Affects: performance, scalability.

Why: `countDocuments` and `find` are independent but awaited one after another.

Real impact: list pages pay `count latency + query latency` instead of the slower of the two.

Principle: parallelize independent IO.

Snippet:

```ts
// lib/actions/question.action.ts:284-285
const totalQuestions = await Question.countDocuments(filterQuery);
const questions = await Question.find(filterQuery)

// lib/actions/tag.action.ts:63-64
const totalTags = await Tag.countDocuments(filterQuery);
const tags = await Tag.find(filterQuery)
```

Best fix: use `const [totalQuestions, questions] = await Promise.all([...])`. For deep pagination, consider cursor pagination or `limit + 1` instead of a separate count.

### P5. Search uses unbounded regex over large text fields

Severity: High. Affects: performance, scalability, UX.

Why: user-provided `query` becomes an unanchored case-insensitive regex on `title` and `content`.

Real impact: MongoDB scans large portions of the collection, especially `content`. This will become slow and expensive as questions grow.

Principle: query shape must match indexes; free-text search needs text/search indexes, not ad hoc regex scans.

Snippet:

```ts
// lib/actions/question.action.ts:258-262
if (query) {
  filterQuery.$or = [
    { title: { $regex: new RegExp(query, "i") } },
    { content: { $regex: new RegExp(query, "i") } },
  ];
}
```

Best fix: add a MongoDB text index or Atlas Search index for `title/content`; escape regex if regex remains; cap query length; search `title` for cards and defer content search to a dedicated search route.

### P6. Question cards overfetch content and full populated tags

Severity: Medium. Affects: performance, scalability.

Why: the home list does not select fields, so it fetches `content` for every card even though cards never render it. It also populates all tag fields.

Real impact: larger DB payloads, slower serialization, larger RSC payloads.

Principle: read models should fetch the minimal shape required by the view.

Snippet:

```ts
// lib/actions/question.action.ts:285-288
const questions = await Question.find(filterQuery)
  .populate("tags")
  .populate("author", "name image")
  .lean()
```

Best fix: add `.select("_id title tags author views answers upvotes downvotes createdAt")` and `.populate("tags", "name")`.

### P7. `getTagQuestion` returns hydrated Mongoose documents

Severity: Medium. Affects: performance, memory, scalability.

Why: list data is serialized immediately but the query lacks `.lean()`.

Real impact: unnecessary Mongoose document hydration and memory use on every tag page.

Principle: use `.lean()` for read-only API/page queries.

Snippet:

```ts
// lib/actions/tag.action.ts:113-119
const questions = await Question.find(filterQuery)
  .select("_id title views answers upvotes downvotes author createdAt")
  .populate([
    { path: "author", select: "name image" },
    { path: "tags", select: "name" },
  ])
```

Best fix: append `.lean().exec()`.

### P8. View increments are non-atomic and raced against the read

Severity: Medium. Affects: correctness, performance, UX.

Why: the page runs increment and read in `Promise.all`, while the increment action does read-modify-save.

Real impact: the displayed view count may not include the just-recorded view, and concurrent requests can lose increments.

Principle: counters should use atomic database updates.

Snippet:

```tsx
// app/(root)/question/[id]/page.tsx:16-19
const [_, { success, data: question }] = await Promise.all([
  getIncrementViews({ questionId: id }),
  getQuestion({ questionId: id }),
]);

// lib/actions/question.action.ts:316-324
const question = await Question.findById(questionId);
question.views += 1;
await question.save();
```

Best fix: use `Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } }, { new: true, projection: { views: 1 } })`. If the detail page needs the incremented value, make the detail query do the atomic increment and populate in one operation or render the incremented counter separately.

### P9. `fetchHandler` can leave abort timers alive after fetch errors

Severity: Low. Affects: performance, memory.

Why: `clearTimeout(id)` runs only after `fetch` resolves successfully. If `fetch` throws before that line, the timer stays until timeout.

Real impact: small but unnecessary timer retention during network failures; the default timeout is also 100 seconds, so failed bursts can leave many timers waiting.

Principle: resource cleanup belongs in `finally`.

Snippet:

```ts
// lib/handlers/fetch.ts:25-48
const id = setTimeout(() => controller.abort(), timeout);
try {
  const response = await fetch(url, config);
  clearTimeout(id);
  ...
  return await response.json();
} catch (err) {
```

Best fix: put `clearTimeout(id)` in `finally`; reduce timeout defaults; preserve response body details for observability.

## 3. Database Audit

### D1. Required compound indexes are missing

Severity: High. Affects: performance, scalability, correctness.

Why: schemas define only a few single-field unique indexes. Actual access patterns query compound keys like provider/providerAccountId, userId/provider/providerAccountId, tag/question, author/question, and vote tuples.

Real impact: slow lookups, duplicate relationship rows under race, and expensive authorization checks.

Principle: indexes are part of the data model, not an afterthought.

Snippet:

```ts
// database/account.model.ts:15-20
userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
provider: { type: String, required: true },
providerAccountId: { type: String, required: true },

// database/tag-question.model.ts:11-12
tag: { type: Schema.Types.ObjectId, ref: "Tag", required: true },
question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
```

Best fix: add indexes such as:

```ts
AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });
AccountSchema.index({ userId: 1, provider: 1 });
TagQuestionSchema.index({ tag: 1, question: 1 }, { unique: true });
CollectionSchema.index({ author: 1, question: 1 }, { unique: true });
VoteSchema.index({ author: 1, actionType: 1, actionId: 1 }, { unique: true });
QuestionSchema.index({ createdAt: -1 });
QuestionSchema.index({ answers: 1, createdAt: -1 });
QuestionSchema.index({ upvotes: -1 });
```

### D2. Tag upsert uses case-insensitive regex instead of normalized indexed key

Severity: Medium. Affects: performance, correctness, scalability.

Why: the query cannot use the plain unique `name` index reliably for case-insensitive matching and can race under concurrent creation.

Real impact: duplicate key errors, inconsistent tag casing, collection scans for tag creation/editing.

Principle: normalize write keys and enforce uniqueness in the database.

Snippet:

```ts
// lib/actions/question.action.ts:61-68
const existingTag = await Tag.findOneAndUpdate(
  {
    name: { $regex: new RegExp(`^${safeTag}$`, "i") },
  },
  { $setOnInsert: { name: tag.toLowerCase() }, $inc: { questions: 1 } },
  { upsert: true, new: true, session }
);
```

Best fix: store `nameNormalized`, query exact normalized value, add a unique index on it, and catch duplicate-key races.

### D3. Edit path fails to escape tag regex

Severity: Medium. Affects: security, reliability.

Why: create escapes regex metacharacters, but edit does not.

Real impact: tags like `c++` can throw regex errors or match unintended tags; crafted input can produce expensive regex work.

Principle: all user input used in a regex must be escaped, consistently.

Snippet:

```ts
// lib/actions/question.action.ts:146-148
const existingTag = await Tag.findOneAndUpdate(
  { name: { $regex: new RegExp(`^${tag}$`, "i") } },
  { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
```

Best fix: reuse a shared `normalizeTag()` helper and never build regex from raw input.

### D4. `createQuestion` returns stale question data

Severity: Low. Affects: developer experience, maintainability.

Why: the action updates tags with `Question.findByIdAndUpdate`, but returns the original `question` document created before tags were pushed.

Real impact: any caller that trusts `result.data.tags` sees an empty tag list. Today the caller only uses `_id`, but the return type promises a full `QuestionProps`.

Principle: mutation return values should match the committed state or return only what callers need.

Snippet:

```ts
// lib/actions/question.action.ts:78-87
await Question.findByIdAndUpdate(
  question._id,
  { $push: { tags: { $each: tagIds } } },
  { session }
);
...
data: JSON.parse(JSON.stringify(question)),
```

Best fix: return `{ _id: question._id }`, or fetch the committed question after the update with selected/populated fields.

### D5. Transaction session is not awaited in one path

Severity: Low. Affects: scalability, reliability.

Why: `session.endSession()` is called without `await` in `createQuestion`.

Real impact: session cleanup can lag behind action completion under load.

Principle: async resource cleanup should be awaited in `finally`.

Snippet:

```ts
// lib/actions/question.action.ts:89-94
} finally {
  session.endSession();
}
```

Best fix: `await session.endSession();`

## 4. React/Next.js Audit

### N1. Production build currently fails

Severity: Critical. Affects: developer experience, production-readiness.

Why: `handleError(error, "api")` is typed as possibly returning a plain server action object, not always a `Response`. Next 16 route handler validation rejects that.

Real impact: cannot ship a production build.

Principle: route handlers must return `Response`/`NextResponse`; server-action result objects are not valid route responses.

Snippet:

```ts
// app/api/users/email/route.ts:39-42
} catch (error) {
  return handleError(error, "api");
}

// lib/handlers/error.ts:23-26
return responseType === "api"
  ? NextResponse.json(responseContent, { status })
  : { status, ...responseContent };
```

Best fix: add typed overloads to `handleError`, or split `handleApiError()` and `handleServerActionError()`. Then return `handleApiError(error)` from all route handlers.

### N2. No loading or error route boundaries

Severity: Medium. Affects: UX, resilience, performance.

Why: async pages fetch DB data directly but there are no `loading.tsx` or `error.tsx` files.

Real impact: users see a blank wait until the whole route is ready; thrown errors fall into generic framework handling.

Principle: App Router should stream useful shells and isolate failures with segment boundaries.

Snippet:

```tsx
// app/(root)/page.tsx:15-22
const { page, pageSize, query, filter } = await searchParams;
const { success, data, error } = await getQuestions({
  page: Number(page) || 1,
  pageSize: Number(pageSize) || 10,
  query: query || "",
  filter: filter || "",
});
```

Best fix: add `app/(root)/loading.tsx`, route-level `error.tsx`, and Suspense around data-heavy sections.

### N3. Sign-in and sign-up pages are unnecessary Client Components

Severity: Low. Affects: bundle size, maintainability.

Why: the pages only compose a client form and pass server action references; the page modules themselves do not need state/effects/browser APIs.

Real impact: extra client boundary and bundle work.

Principle: prefer Server Components by default; put `"use client"` only where interactivity is needed.

Snippet:

```tsx
// app/(auth)/sign-in/page.tsx:1-8
"use client";

import AuthForm from "@/components/forms/AuthForm";
...
const SignIn = () => {
  return (
    <AuthForm
```

Best fix: remove `"use client"` from page files and keep `AuthForm` as the client component.

### N4. `NavLinks` mutates imported route constants

Severity: Medium. Affects: UX, maintainability.

Why: the component modifies `item.route` from the shared `sidebarLinks` array.

Real impact: profile links can become stale or incorrect after login/logout/user changes; mutable module state is hard to reason about.

Principle: render data should be derived immutably.

Snippet:

```tsx
// components/NavLinks.tsx:20-31
{sidebarLinks.map((item) => {
  ...
  if (item.route === "/profile") {
    if (userId) item.route = `${item.route}/${userId}`;
    else return null;
  }
  ...
  href={item.route}
```

Best fix: compute `const href = item.route === "/profile" ? ROUTES.PROFILE(userId) : item.route;` without mutating `item`.

### N5. Auth form never enters submitting state

Severity: Medium. Affects: UX, correctness.

Why: `setSubmitting` is declared but never called.

Real impact: users can double-submit sign-in/sign-up; slow auth has no loading feedback.

Principle: mutation UI must represent pending state and prevent duplicate submissions.

Snippet:

```tsx
// components/forms/AuthForm.tsx:47
const [submitting, setSubmitting] = useState(false);
```

Best fix: wrap submit in `try/finally`, set `submitting` true/false, and call `router.refresh()` after successful sign-in if server session UI is visible.

### N6. Local search state can drift from the URL

Severity: Low. Affects: UX, maintainability.

Why: `searchQuery` initializes from `searchParams`, but never syncs when the user navigates back/forward or another control changes query params.

Real impact: input text can disagree with rendered results.

Principle: URL state should have one source of truth.

Snippet:

```tsx
// components/search/LocalSearch.tsx:24-29
const query = searchParams.get("query") || "";
...
const [searchQuery, setSearchQuery] = useState(query);

useEffect(() => {
```

Best fix: add an effect to update local state when `query` changes, or make the input controlled by URL state with a debounced pending value.

### N7. Wrong asset path casing breaks on Linux

Severity: Medium. Affects: UX, production-readiness.

Why: the code uses `/images/site-Logo.svg`, but the actual file is `public/images/site-logo.svg`.

Real impact: works on case-insensitive Windows, 404s on Linux deployments.

Principle: asset paths must match exact production filesystem casing.

Snippet:

```tsx
// app/(auth)/layout.tsx:19
src="/images/site-Logo.svg"
```

Best fix: change to `/images/site-logo.svg`.

### N8. `ROUTES.COLLECTION` is relative

Severity: Low. Affects: UX, maintainability.

Why: one route constant lacks a leading slash.

Real impact: links using it from nested routes resolve relative to the current path.

Principle: central route constants should be canonical absolute app paths.

Snippet:

```ts
// constants/routes.ts:5
COLLECTION: "collection",

// constants/states.ts:47
href: ROUTES.COLLECTION,
```

Best fix: `COLLECTION: "/collection"`.

### N9. Detail page uses `redirect("/404")` instead of `notFound()`

Severity: Low. Affects: UX, SEO, maintainability.

Why: App Router has a built-in `notFound()` control flow.

Real impact: wrong status/metadata semantics if `/404` is not implemented as expected.

Principle: use framework primitives for route semantics.

Snippet:

```tsx
// app/(root)/question/[id]/page.tsx:21
if (!success || !question) return redirect("/404");
```

Best fix: import and call `notFound()`.

## 5. Security Audit

### S1. Public user mutation endpoints have no auth or ownership check

Severity: Critical. Affects: security, privacy, maintainability.

Why: `PUT` and `DELETE` under `/api/users/[id]` mutate arbitrary users without calling `auth()`.

Real impact: anyone who knows or guesses a user id can update or delete that user. `GET /api/users` also exposes the full user list.

Principle: authentication proves identity; authorization checks whether that identity can act on a resource.

Snippet:

```ts
// app/api/users/[id]/route.ts:66-76
export async function PUT(request: Request, context: UserRouteContext) {
  try {
    const id = await getUserId(context);
    const body = await parseJsonBody(request);
    const updateData = UserUpdateSchema.parse(body);
    ...
    await connectToDatabase();

// app/api/users/[id]/route.ts:129-135
export async function DELETE(_request: Request, context: UserRouteContext) {
  try {
    const id = await getUserId(context);
    await connectToDatabase();
```

Best fix: require `auth()` in all mutating user routes, enforce `session.user.id === id` or admin role, and avoid exposing list endpoints unless explicitly public and paginated.

### S2. Account lookup endpoint leaks account records and password hashes

Severity: Critical. Affects: security, privacy.

Why: `/api/accounts/provider` is unauthenticated and returns the whole account document for a supplied `providerAccountId`. Credential accounts store password hashes on the same model.

Real impact: a POST with an email/provider id can retrieve account metadata and password hashes. Hashes are not plaintext, but leaking them enables offline cracking and account correlation.

Principle: never expose authentication credential material through public APIs; select least-privileged fields.

Snippet:

```ts
// app/api/accounts/provider/route.ts:23-31
const { providerAccountId } = validateData.data;

const account = await Account.findOne({
  providerAccountId,
})
  .lean()
  .exec();

// database/account.model.ts:17-20
image: { type: String },
password: { type: String },
provider: { type: String, required: true },
providerAccountId: { type: String, required: true },
```

Best fix: delete this public route or protect it with internal-only auth. For all account reads use `.select("-password")`. Move auth lookups into a server-only DAL.

### S3. Public OAuth sign-in route trusts arbitrary JSON

Severity: Critical. Affects: security, authorization, data integrity.

Why: `/api/auth/signin-with-oauth` accepts `provider`, `providerAccountId`, and `user` from the request body, then creates/links users and accounts. The endpoint itself does not verify a provider token or require a trusted internal caller.

Real impact: attackers can create users or pollute/link provider accounts for existing emails. Even if it does not mint a session directly, it corrupts the identity graph.

Principle: identity linking must be performed only inside the trusted auth callback after provider verification.

Snippet:

```ts
// app/api/auth/signin-with-oauth/route.ts:12-21
export async function POST(request: Request) {
  const { provider, providerAccountId, user } = await request.json();

  await connectToDatabase();
  const session = await mongoose.startSession();
  ...
  const validateData = SignInWithOauth.safeParse({

// app/api/auth/signin-with-oauth/route.ts:43-75
let existingUser = await User.findOne({ email }).session(session);
...
await Account.create(
```

Best fix: remove the route and call a server-only `upsertOAuthAccount()` function from the NextAuth `signIn` callback. If a route must exist, require a signed internal secret and never accept unverified identity claims from browsers.

### S4. User-generated MDX is rendered with `next-mdx-remote/rsc`

Severity: Critical. Affects: security, UX, maintainability.

Why: question content is user input, and `next-mdx-remote` warns not to pass user input to `MDXRemote`. The code does exactly that.

Real impact: XSS or server/client code execution risks depending on MDX capabilities and options. At minimum, unsafe JSX/HTML rendering is possible; the app has no CSP to reduce blast radius.

Principle: untrusted content must be parsed with a sanitizer and a constrained rendering grammar.

Snippet:

```tsx
// components/editor/Preview.tsx:11-16
const formattedContent = content.replace(/\\/g, "").replace(/&#x20;/g, "");

return (
  <section className="markdown prose grid wrap-break-word">
    <MDXRemote
      source={formattedContent}
```

Package note: `node_modules/next-mdx-remote/README.md:389` says: "Do not pass user input into `<MDXRemote />`."

Best fix: use a markdown-only renderer such as `react-markdown` with `remark-gfm` and `rehype-sanitize`, or configure MDX compilation with JavaScript disabled and a strict sanitizer. Store sanitized content or sanitize on render. Add CSP headers.

### S5. Secrets exist in local environment file

Severity: High. Affects: security, operations.

Why: `.env.local` contains real-looking Auth, OAuth, and MongoDB credentials. It is ignored by git, but it is present in the workspace and was loaded by `next build`.

Real impact: if the workspace is shared, zipped, logged, or synced, OAuth and database credentials can leak.

Principle: secret material should be managed by deployment secret stores and rotated after exposure.

Redacted snippet:

```dotenv
# .env.local:1-6, values intentionally redacted
AUTH_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...
GOOGLE_ID=...
GOOGLE_SECRET=...
MONGODB_URI=...
```

Best fix: rotate these credentials if this workspace has been shared. Keep `.env.local` local-only, use platform secrets for deployment, and never include raw secret values in reports or logs.

### S6. No rate limiting on auth and mutation surfaces

Severity: High. Affects: security, scalability.

Why: sign-in, sign-up, OAuth linking, public account lookup, question creation/editing, and user/account APIs have no throttling.

Real impact: brute-force attempts, account enumeration, DB write abuse, and cost spikes.

Principle: every unauthenticated or expensive mutation endpoint needs abuse controls.

Snippet:

```ts
// lib/actions/auth.action.ts:73-105
export async function signInWithCredentials(
  params: Pick<AuthCredentials, "email" | "password">
): Promise<ActionResponse> {
  ...
  const validatePassword = await bcrypt.compare(
```

Best fix: add IP/user/email rate limiting around auth attempts and write actions. Use a shared store in production, not in-memory state.

### S7. Credential sign-in leaks account existence and reason

Severity: Medium. Affects: security, UX.

Why: the server action distinguishes missing email, missing account, and password mismatch.

Real impact: attackers can enumerate registered emails and provider state.

Principle: auth errors should be indistinguishable to the client and detailed only in server logs.

Snippet:

```ts
// lib/actions/auth.action.ts:85-103
const existingUsername = await User.findOne({ email });
if (!existingUsername) {
  throw new NotFoundError("Email");
}
...
if (!existingAccount) throw new NotFoundError("Account");
...
if (!validatePassword) throw new Error("Password does not match");
```

Best fix: return one generic client error like "Invalid email or password"; log structured internal reasons privately.

### S8. API account reads can return password hashes to authenticated users

Severity: High. Affects: security, privacy.

Why: `/api/accounts` and `/api/accounts/[id]` return account documents without excluding `password`.

Real impact: even "own account" APIs should not expose password hashes to browsers. Any XSS or browser extension can exfiltrate them.

Principle: credentials are write/check-only and should never be serialized.

Snippet:

```ts
// app/api/accounts/route.ts:28-31
const accounts = await Account.find({ userId: session.user.id })
  .sort({ createdAt: -1 })
  .lean()
  .exec();
```

Best fix: always `.select("-password")`; consider splitting credentials into a separate private collection.

### S9. Error details are rendered directly into the UI

Severity: Low. Affects: security, UX.

Why: validation details are stringified to users.

Real impact: noisy UX and possible leakage of internal field names or validation structure.

Principle: server errors should be normalized for users and detailed for logs.

Snippet:

```tsx
// components/DataRenderer.tsx:78-83
message={
  error?.details
    ? JSON.stringify(error.details, null, 2)
    : DEFAULT_ERROR.message
}
```

Best fix: map validation errors to friendly copy, and keep structured details in logs.

### S10. Security headers/CSP are absent

Severity: High. Affects: security.

Why: `next.config.ts` configures images but no `headers()` for CSP, frame protection, referrer policy, or content-type hardening.

Real impact: MDX/rendering issues have a larger blast radius; clickjacking and script injection defenses are weaker.

Principle: defense in depth matters; headers do not replace sanitization but reduce impact.

Snippet:

```ts
// next.config.ts:3-28
const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    remotePatterns: [
```

Best fix: add strict headers. CSP must be designed carefully because `next-mdx-remote` may require unsafe eval in some modes; that is another reason to avoid it for user content.

## 6. Scalability Audit

### A1. Route handlers and server actions duplicate business logic

Severity: Medium. Affects: maintainability, scalability.

Why: account/user validation, duplicate checks, auth flow, and direct DB calls are spread across route handlers, server actions, and `auth.ts`.

Real impact: fixes must be repeated in multiple places; security rules drift.

Principle: isolate business rules in a server-only service/DAL, and keep route handlers/actions as transport adapters.

Snippet:

```ts
// app/api/accounts/route.ts:59-66
const existingAccount = await Account.findOne({
  userId: session.user.id,
  provider: accountData.provider,
  providerAccountId: accountData.providerAccountId,
})

// app/api/auth/signin-with-oauth/route.ts:68-75
const existingAccount = await Account.findOne({
  userId: existingUser._id,
  provider: validProvider,
  providerAccountId: validProviderAccountId,
}).session(session);
```

Best fix: create service functions such as `createCredentialUser`, `findCredentialAccount`, `upsertOAuthAccount`, `listQuestions`, and use them everywhere.

### A2. Validation schemas do not match route semantics

Severity: Medium. Affects: developer experience, maintainability, correctness.

Why: `UserSchema` requires `bio` even though the DB makes it optional; `AccountSchema` requires `userId` in a route that overwrites it from the session.

Real impact: API clients get confusing validation failures; server routes accept or require fields that should not be client controlled.

Principle: validation schemas should model operation intent, not raw database shape.

Snippet:

```ts
// lib/zod.ts:62-67
export const UserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  name: nameSchema,
  email: emailSchema,
  bio: z.string(),
});

// app/api/accounts/route.ts:54
const accountData = AccountSchema.parse(body);
```

Best fix: define operation schemas: `CreateUserInput`, `UpdateUserInput`, `CreateAccountForSessionInput`, `OAuthAccountInput`, etc.

### A3. Types are global, duplicated, and partly incorrect

Severity: Medium. Affects: developer experience, maintainability.

Why: `types.d.ts` declares global interfaces with duplicates and typos.

Real impact: type drift between DB models and UI props hides runtime bugs, especially optional `image` fields and populated document shapes.

Principle: prefer explicit exported types and view-specific DTOs.

Snippet:

```ts
// types.d.ts:8-12
interface QuestionProps {
  _id: string;
  title: string;
  content: string;
  content: string;

// types.d.ts:89
interface GegTagQuestionParams extends Omit<PaginatedSearchParams, "filter"> {
```

Best fix: move to `types/*.ts` modules, remove globals, model populated DTOs explicitly, and fix `GetTagQuestionParams`.

### A4. No automated tests cover the riskiest paths

Severity: High. Affects: production-readiness, maintainability.

Why: no test/spec files were found.

Real impact: auth regressions, route authorization gaps, and server action data corruption can ship unnoticed.

Principle: production systems need tests around trust boundaries and data mutations first.

Snippet:

```text
rg --files -g "*test*" -g "*spec*"
# no results
```

Best fix: add route-handler tests for authorization, server-action tests for create/edit question, and integration tests for credential/OAuth sign-in flows.

### A5. Placeholder/dead UI code remains in production routes

Severity: Low. Affects: maintainability, UX.

Why: several pages and sidebar sections are placeholders or contain unused imports.

Real impact: navigation leads to unfinished experiences; dead imports hide real warnings.

Principle: production navigation should not expose non-functional surfaces.

Snippet:

```tsx
// app/(root)/profile/[id]/page.tsx:3-4
const ProfilePage = () => {
  return <div>ProfilePage</div>;
};

// components/RightSideBar.tsx:1-5
import { ROUTES } from "@/constants/routes";
import { Link } from "lucide-react";
import { title } from "process";
import React from "react";
import TagCard from "./cards/TagCard";
```

Best fix: either implement these features, hide links behind feature flags, or remove them until ready.

### A6. Image rendering assumes optional user images are always valid

Severity: Medium. Affects: UX, reliability.

Why: card metrics use `next/image` with `author?.image`, but user image is optional in the database.

Real impact: questions from credential users with no image can crash image rendering or show broken UI.

Principle: UI types must represent nullable data and render fallbacks at the edge.

Snippet:

```tsx
// components/cards/QuestionCard.tsx:54-59
<Metric
  imgUrl={author?.image}
  alt={author.name}
  value={author.name}
  title={`â€¢ asked ${formatPHTimeAgo(createdAt)}`}
```

Best fix: use `UserAvatar` for author display and type `Author.image?: string | null`.

### A7. Mojibake text indicates encoding corruption

Severity: Low. Affects: UX, maintainability.

Why: several strings contain `â€™` and `â€¢`.

Real impact: visible broken punctuation in production.

Principle: source files should have consistent UTF-8 encoding, and UI copy should be reviewed.

Snippet:

```tsx
// components/forms/QuestionForm.tsx:164-166
Be specific and imagine youâ€™re asking a question to another

// components/cards/QuestionCard.tsx:58
title={`â€¢ asked ${formatPHTimeAgo(createdAt)}`}
```

Best fix: convert files to UTF-8 and replace corrupted characters with ASCII apostrophes/bullets or correct Unicode.

## 7. Refactor Priority List

Top 10 improvements by production impact:

1. Fix the build blocker by splitting `handleApiError` from server-action error handling.
2. Lock down `/api/users/*`: require auth, enforce ownership/admin, paginate or remove public list.
3. Remove `/api/accounts/provider` or make it internal-only; never serialize `password`.
4. Remove public `/api/auth/signin-with-oauth`; move OAuth account upsert into a server-only DAL called from NextAuth callbacks.
5. Replace `MDXRemote` for user-generated question content with sanitized markdown rendering and add CSP headers.
6. Add rate limiting to credential auth, sign-up, OAuth/linking routes, and question mutations.
7. Add database indexes for account identity, tag-question joins, votes, collections, and question list/sort/search paths.
8. Refactor data access into server-only services used by actions, route handlers, and auth callbacks.
9. Move session fetching out of the root layout and remove duplicate `auth()` calls in nav/sidebar.
10. Add tests for auth, authorization, route handlers, and question create/edit flows before adding more features.

Secondary but worthwhile:

- Use `Promise.all` for independent list/count queries.
- Use atomic `$inc` for views.
- Fix route constants, asset casing, and placeholder pages.
- Clean global types and operation-specific Zod schemas.
- Add App Router `loading.tsx` and `error.tsx` boundaries.
