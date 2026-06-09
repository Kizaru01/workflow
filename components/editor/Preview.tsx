import { Code } from "bright";
import { MDXRemote } from "next-mdx-remote/rsc";

Code.theme = {
  light: "github-light",
  dark: "github-dark",
  lightSelector: "html.light",
};

const Preview = ({
  content = "",
  profile,
}: {
  content: string;
  profile?: boolean;
}) => {
  const formattedContent = content.replace(/\\/g, "").replace(/&#x20;/g, "");

  return (
    <section className="markdown prose break-all">
      <div className={profile ? "line-clamp-5" : ""}>
        <MDXRemote
          source={formattedContent}
          components={{
            pre: (props) => (
              <Code
                {...props}
                lineNumbers
                className="shadow-light-200 dark:shadow-dark-200"
              />
            ),
          }}
        />
      </div>
    </section>
  );
};

export default Preview;
