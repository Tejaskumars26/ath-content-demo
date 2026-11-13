import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import Layout, { type NavigationText } from "@/components/Layout";
import { fundingSlugs, getFieldConfig, getFunding } from "@/lib/content";
import { type FundingDefaults, label } from "@/lib/fundingDefaults";
import { type CalloutDefaults, inlineMarkdownToHtml, markdownToHtml } from "@/lib/markdown";

type Props = {
  nav: NavigationText;
  defaults: FundingDefaults;
  funding: {
    name: string;
    summaryHtml: string;
    bodyHtml: string;
    fundingType: string;
    status: string;
    programFrequency: string;
    agency: string[];
    agencyContact: string;
    callToActionText: string | null;
    callToActionLink: string | null;
    dueDate: string | null;
    translated: boolean;
  };
};

export default function FundingDetail({ nav, defaults, funding }: Props) {
  return (
    <Layout nav={nav} title={funding.name} showTranslationNotice={!funding.translated}>
      <div className="grid-container padding-y-5">
        <Link href="/funding" className="back-link">← {defaults.backToList}</Link>
        <div className="grid-row grid-gap-lg margin-top-2">
          <article className="desktop:grid-col-8">
            <h1>{funding.name}</h1>
            <p className="usa-intro" dangerouslySetInnerHTML={{ __html: funding.summaryHtml }} />
            <div className="usa-prose funding-body" dangerouslySetInnerHTML={{ __html: funding.bodyHtml }} />
          </article>

          <aside className="desktop:grid-col-4">
            <div className="details-box">
              <h2 className="details-box__title">{defaults.detailsHeading}</h2>
              <dl>
                <dt>{defaults.fundingTypeLabel}</dt>
                <dd>{label(defaults.fundingTypes, funding.fundingType)}</dd>
                <dt>{defaults.statusLabel}</dt>
                <dd>{label(defaults.statuses, funding.status)}</dd>
                <dt>{defaults.frequencyLabel}</dt>
                <dd>{label(defaults.frequencies, funding.programFrequency)}</dd>
                {funding.dueDate && (<><dt>{defaults.dueDateLabel}</dt><dd>{funding.dueDate}</dd></>)}
                <dt>{defaults.agencyLabel}</dt>
                <dd>{funding.agency.map((a) => label(defaults.agencies, a)).join(", ")}</dd>
                <dt>{defaults.contactLabel}</dt>
                <dd>{funding.agencyContact}</dd>
              </dl>
              {funding.callToActionLink && funding.callToActionText && (
                <a className="usa-button width-full" href={funding.callToActionLink} rel="noopener noreferrer">
                  {funding.callToActionText}
                </a>
              )}
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async ({ locales = ["en"] }) => ({
  paths: locales.flatMap((locale) => fundingSlugs().map((urlSlug) => ({ params: { urlSlug }, locale }))),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props> = async ({ params, locale }) => {
  const funding = getFunding(String(params?.urlSlug), locale);
  if (!funding) return { notFound: true };
  const callouts = getFieldConfig<{ calloutDefaults: CalloutDefaults }>("callout-defaults", locale).calloutDefaults;
  return {
    props: {
      nav: getFieldConfig<{ navigation: NavigationText }>("navigation", locale).navigation,
      defaults: getFieldConfig<{ fundingDefaults: FundingDefaults }>("funding-defaults", locale).fundingDefaults,
      funding: {
        name: funding.name,
        summaryHtml: await inlineMarkdownToHtml(funding.summaryDescriptionMd, callouts),
        bodyHtml: await markdownToHtml(funding.contentMd, callouts),
        fundingType: funding.fundingType,
        status: funding.status,
        programFrequency: funding.programFrequency,
        agency: funding.agency,
        agencyContact: funding.agencyContact,
        callToActionText: funding.callToActionText ?? null,
        callToActionLink: funding.callToActionLink ?? null,
        dueDate: funding.dueDate ?? null,
        translated: funding.translated,
      },
    },
  };
};
