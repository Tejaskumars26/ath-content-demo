import type { GetStaticProps } from "next";
import Link from "next/link";
import Layout, { type NavigationText } from "@/components/Layout";
import { getFieldConfig, listFundings } from "@/lib/content";
import { type FundingDefaults, label } from "@/lib/fundingDefaults";

type Card = { urlSlug: string; name: string; sidebarCardBodyText: string; fundingType: string; status: string; translated: boolean };
type Props = { nav: NavigationText; defaults: FundingDefaults; fundings: Card[] };

export default function FundingList({ nav, defaults, fundings }: Props) {
  const anyUntranslated = fundings.some((f) => !f.translated);
  return (
    <Layout nav={nav} title={defaults.pageTitle} showTranslationNotice={anyUntranslated}>
      <div className="grid-container padding-y-5">
        <h1>{defaults.pageTitle}</h1>
        <p className="usa-intro">{defaults.pageIntro}</p>

        <ul className="usa-card-group">
          {fundings.map((f) => (
            <li key={f.urlSlug} className="usa-card tablet:grid-col-6 desktop:grid-col-4">
              <div className="usa-card__container">
                <div className="usa-card__header">
                  <div className="funding-tags">
                    <span className="usa-tag funding-tag--type">{label(defaults.fundingTypes, f.fundingType)}</span>
                    <span className="usa-tag funding-tag--status">{label(defaults.statuses, f.status)}</span>
                  </div>
                  <h2 className="usa-card__heading">{f.name}</h2>
                </div>
                <div className="usa-card__body"><p>{f.sidebarCardBodyText}</p></div>
                <div className="usa-card__footer">
                  <Link href={`/funding/${f.urlSlug}`} className="usa-button">{defaults.readMore}</Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    nav: getFieldConfig<{ navigation: NavigationText }>("navigation", locale).navigation,
    defaults: getFieldConfig<{ fundingDefaults: FundingDefaults }>("funding-defaults", locale).fundingDefaults,
    fundings: listFundings(locale).map(({ urlSlug, name, sidebarCardBodyText, fundingType, status, translated }) => ({
      urlSlug, name, sidebarCardBodyText, fundingType, status, translated,
    })),
  },
});
