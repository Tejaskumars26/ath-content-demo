import type { GetStaticProps } from "next";
import Link from "next/link";
import Layout, { type NavigationText } from "@/components/Layout";
import { getFieldConfig, hasFieldConfigTranslation } from "@/lib/content";

type LandingPage = {
  heroTitle: string;
  heroSubtitle: string;
  heroCallToAction: string;
  cardsTitle: string;
  cards: { id: string; href: string; title: string; text: string; linkText: string }[];
};

type Props = { nav: NavigationText; page: LandingPage; translated: boolean };

export default function Home({ nav, page, translated }: Props) {
  return (
    <Layout nav={nav} title={nav.menu.home} showTranslationNotice={!translated}>
      <section className="hero">
        <div className="grid-container">
          <h1 className="hero__title">{page.heroTitle}</h1>
          <p className="hero__subtitle">{page.heroSubtitle}</p>
          <Link href="/funding" className="usa-button usa-button--big">{page.heroCallToAction}</Link>
        </div>
      </section>

      <section className="grid-container padding-y-5">
        <h2 className="section-title">{page.cardsTitle}</h2>
        <ul className="usa-card-group">
          {page.cards.map((card) => (
            <li key={card.id} className="usa-card tablet:grid-col-4">
              <div className="usa-card__container">
                <div className="usa-card__header"><h3 className="usa-card__heading">{card.title}</h3></div>
                <div className="usa-card__body"><p>{card.text}</p></div>
                <div className="usa-card__footer">
                  <Link href={card.href} className="usa-button usa-button--outline">{card.linkText}</Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps<Props> = async ({ locale }) => ({
  props: {
    nav: getFieldConfig<{ navigation: NavigationText }>("navigation", locale).navigation,
    page: getFieldConfig<{ landingPage: LandingPage }>("landing-page", locale).landingPage,
    translated: hasFieldConfigTranslation("landing-page", locale),
  },
});
