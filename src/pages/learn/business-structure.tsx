import type { GetStaticProps } from "next";
import Layout, { type NavigationText } from "@/components/Layout";
import { getFieldConfig, hasFieldConfigTranslation } from "@/lib/content";

type TextItem = { text: string };
type Structure = {
  id: string;
  displayName: string;
  simpleWords: TextItem[];
  advantages: TextItem[];
  disadvantages: TextItem[];
};
type LearnPage = {
  title: string;
  overview: string;
  simpleWordsHeading: string;
  advantagesHeading: string;
  disadvantagesHeading: string;
  structures: Structure[];
};

type Props = { nav: NavigationText; page: LearnPage; translated: boolean };

export default function BusinessStructure({ nav, page, translated }: Props) {
  return (
    <Layout nav={nav} title={page.title} showTranslationNotice={!translated}>
      <div className="grid-container padding-y-5">
        <h1>{page.title}</h1>
        <p className="usa-intro">{page.overview}</p>

        {page.structures.map((structure) => (
          <section key={structure.id} className="structure-card" aria-labelledby={`structure-${structure.id}`}>
            <h2 id={`structure-${structure.id}`}>{structure.displayName}</h2>
            <div className="grid-row grid-gap">
              <div className="tablet:grid-col-4">
                <h3>{page.simpleWordsHeading}</h3>
                <ul className="usa-list">{structure.simpleWords.map((item, i) => <li key={i}>{item.text}</li>)}</ul>
              </div>
              <div className="tablet:grid-col-4">
                <h3 className="text-green">{page.advantagesHeading}</h3>
                <ul className="usa-list list-pros">{structure.advantages.map((item, i) => <li key={i}>{item.text}</li>)}</ul>
              </div>
              <div className="tablet:grid-col-4">
                <h3 className="text-secondary-dark">{page.disadvantagesHeading}</h3>
                <ul className="usa-list list-cons">{structure.disadvantages.map((item, i) => <li key={i}>{item.text}</li>)}</ul>
              </div>
            </div>
          </section>
        ))}
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    nav: getFieldConfig<{ navigation: NavigationText }>("navigation", locale).navigation,
    page: getFieldConfig<{ learnPageBusinessStructure: LearnPage }>("learn-page-business-structure", locale).learnPageBusinessStructure,
    translated: hasFieldConfigTranslation("learn-page-business-structure", locale),
  },
});
