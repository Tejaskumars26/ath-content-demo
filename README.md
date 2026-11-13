# Business Navigator – content translation demo

> **Demo prototype — not an official State of New Jersey website.** Sample content for demonstrating
> repository-based translation with ATH (Acumen Translation Hub). No official seals or logos; pages
> are marked `noindex`; contact details are placeholders (555 numbers, example.gov).

A small Next.js site built like a state business portal: page texts live in **JSON** files and
program pages in **Markdown with YAML frontmatter** and custom `:::largeCallout{…}` blocks. ATH
watches these files on GitHub, translates the user-facing text (Okapi + glossary + translation
memory), lets people review it, and delivers the translations back as a **Pull Request**.

## Run

```bash
npm install
npm run dev        # http://localhost:3100
```

Languages: `/` (English), `/es`, `/pt-BR`, `/ko`, `/gu`, `/zh-CN`, `/yue`, `/ht`, `/ar`. A language shows
its translated files when they exist, otherwise English with a "not translated yet" notice.
Arabic switches the page to right-to-left.

## Stack

Next.js (pages router) · React · TypeScript · USWDS 3 (U.S. Web Design System) · gray-matter ·
remark + remark-directive. No backend: pages are generated from the content files.

## Content

```
content/src/
  fieldConfig/                     page and interface texts (JSON, nested objects and lists)
    navigation.json                header, menu, footer, banner
    landing-page.json              home page
    learn-page-business-structure.json
    funding-defaults.json          labels; codes like "grant" map to translatable labels
    callout-defaults.json          default callout headings per callout type
  fundings/                        funding programs (Markdown + frontmatter + :::largeCallout)
  translations/<lang>/...          written by ATH Pull Requests — do not edit by hand
```

Markdown callouts:

```markdown
:::largeCallout{ showHeader="true" headerText="Benefits" calloutType="conditional" }
Text of the callout.
:::
```

`calloutType`: `informational` | `warning` | `conditional` | `quickReference`. With `showHeader="true"`
the header is `headerText`, or the type's default heading from `callout-defaults.json`.

## ATH setup (Repositories → Add repository)

| Source pattern | Target pattern | Format |
|---|---|---|
| `content/src/fieldConfig/*.json` | `content/src/translations/{lang}/fieldConfig/*.json` | JSON |
| `content/src/fundings/*.md` | `content/src/translations/{lang}/fundings/*.md` | Markdown |

Rules for the Markdown mapping (only these values are translated; ids, slugs, codes, links and
directive settings stay untouched):

```json
{
  "frontmatter": {
    "include": ["name", "sidebarCardBodyText", "summaryDescriptionMd", "agencyContact", "callToActionText"],
    "markdown": ["*Md"]
  },
  "directives": { "largeCallout": ["headerText"] }
}
```

The JSON mapping uses the default rules (`{}`): every text value is translated; keys such as `id`,
`href`, `url` and other identifiers are skipped automatically.

## Demo walkthrough

1. Change an English text, e.g. in `content/src/fundings/main-street-improvement-grant.md`, and push.
2. ATH receives the push, extracts only the user-facing texts and machine-translates them.
3. Reviewers post-edit the Spanish texts in ATH and **Publish**.
4. ATH opens a Pull Request adding `content/src/translations/es/...`; an alert e-mail is sent.
5. Merge the Pull Request and reload `/es/funding/main-street-improvement-grant`.
