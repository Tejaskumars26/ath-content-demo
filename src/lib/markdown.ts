/**
 * Markdown -> HTML with support for the content's custom callout syntax:
 *
 *   :::largeCallout{ showHeader="true" headerText="Benefits" calloutType="conditional" }
 *   Text of the callout.
 *   :::
 *
 * calloutType: informational | warning | conditional | quickReference. When showHeader is "true"
 * the header is headerText, or the type's default heading from fieldConfig/callout-defaults.json.
 */
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";

export type CalloutDefaults = {
  informationalHeadingDefaultText: string;
  warningHeadingDefaultText: string;
  conditionalHeadingDefaultText: string;
  quickReferenceHeadingDefaultText: string;
};

const CALLOUT_TYPES = ["informational", "warning", "conditional", "quickReference"];

/* eslint-disable @typescript-eslint/no-explicit-any */
const calloutPlugin = (defaults: CalloutDefaults) => () => (tree: any) => {
  visit(tree, (node: any) => {
    if (node.type !== "containerDirective" && node.type !== "leafDirective" && node.type !== "textDirective") return;
    const attributes = node.attributes || {};
    const data = node.data || (node.data = {});

    if (node.name === "largeCallout") {
      const type = CALLOUT_TYPES.includes(attributes.calloutType) ? attributes.calloutType : "informational";
      data.hName = "div";
      data.hProperties = { className: ["callout", `callout--${type}`] };
      if (attributes.showHeader === "true") {
        const heading = attributes.headerText || (defaults as any)[`${type}HeadingDefaultText`] || "";
        if (heading) {
          node.children.unshift({
            type: "paragraph",
            data: { hName: "h3", hProperties: { className: ["callout__header"] } },
            children: [{ type: "text", value: heading }],
          });
        }
      }
      return;
    }
    // Unknown directives: keep their content, drop the syntax
    data.hName = node.type === "textDirective" ? "span" : "div";
  });
};

export const markdownToHtml = async (markdown: string, defaults: CalloutDefaults): Promise<string> => {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(calloutPlugin(defaults))
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);
  return String(file);
};

/** Inline Markdown (e.g. a frontmatter *Md value) without the wrapping paragraph. */
export const inlineMarkdownToHtml = async (markdown: string, defaults: CalloutDefaults): Promise<string> =>
  (await markdownToHtml(markdown, defaults)).replace(/^<p>([\s\S]*)<\/p>\s*$/, "$1");
