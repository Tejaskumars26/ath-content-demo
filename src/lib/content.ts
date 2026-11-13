/**
 * Content loading. Source content (English) lives in content/src; translations written by
 * ATH Pull Requests live in content/src/translations/<lang>/ with the same file names.
 * When a translated file does not exist yet, the English file is used (per file).
 *
 *   content/src/fieldConfig/<name>.json               -> page and interface texts
 *   content/src/fundings/<file>.md                    -> funding programs (frontmatter + body)
 *   content/src/translations/<lang>/fieldConfig/...   -> translated copies (from ATH)
 *   content/src/translations/<lang>/fundings/...
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT = path.join(process.cwd(), "content", "src");

const localized = (locale: string | undefined, ...parts: string[]) => {
  const source = path.join(CONTENT, ...parts);
  if (locale && locale !== "en") {
    const translated = path.join(CONTENT, "translations", locale, ...parts);
    if (fs.existsSync(translated)) return { file: translated, translated: true };
  }
  return { file: source, translated: false };
};

/** Is there a translated copy of content/src/fieldConfig/<name>.json for this language? */
export const hasFieldConfigTranslation = (name: string, locale?: string) =>
  localized(locale, "fieldConfig", `${name}.json`).translated;

/** Reads content/src/fieldConfig/<name>.json (translated when available). */
export const getFieldConfig = <T = Record<string, unknown>>(name: string, locale?: string): T => {
  const { file } = localized(locale, "fieldConfig", `${name}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, "")) as T;
};

export type Funding = {
  urlSlug: string;
  name: string;
  sidebarCardBodyText: string;
  summaryDescriptionMd: string;
  fundingType: string;
  status: string;
  programFrequency: string;
  agency: string[];
  agencyContact: string;
  callToActionText?: string;
  callToActionLink?: string;
  dueDate?: string;
  contentMd: string;
  translated: boolean;
};

const fundingFiles = () =>
  fs.readdirSync(path.join(CONTENT, "fundings")).filter((f) => f.endsWith(".md")).sort();

const readFunding = (fileName: string, locale?: string): Funding => {
  const { file, translated } = localized(locale, "fundings", fileName);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return {
    urlSlug: String(data.urlSlug),
    name: String(data.name ?? ""),
    sidebarCardBodyText: String(data.sidebarCardBodyText ?? ""),
    summaryDescriptionMd: String(data.summaryDescriptionMd ?? ""),
    fundingType: String(data.fundingType ?? ""),
    status: String(data.status ?? ""),
    programFrequency: String(data.programFrequency ?? ""),
    agency: Array.isArray(data.agency) ? data.agency.map(String) : [],
    agencyContact: String(data.agencyContact ?? ""),
    callToActionText: data.callToActionText ? String(data.callToActionText) : undefined,
    callToActionLink: data.callToActionLink ? String(data.callToActionLink) : undefined,
    dueDate: data.dueDate ? String(data.dueDate) : undefined,
    contentMd: content,
    translated,
  };
};

export const listFundings = (locale?: string): Funding[] => fundingFiles().map((f) => readFunding(f, locale));

export const getFunding = (urlSlug: string, locale?: string): Funding | null => {
  const file = fundingFiles().find((f) => readFunding(f).urlSlug === urlSlug);
  return file ? readFunding(file, locale) : null;
};

export const fundingSlugs = () => fundingFiles().map((f) => readFunding(f).urlSlug);
