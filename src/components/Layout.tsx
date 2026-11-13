import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { LANGUAGES } from "@/lib/languages";

export type NavigationText = {
  siteName: string;
  stateName: string;
  demoBanner: string;
  skipToContent: string;
  languageLabel: string;
  menu: { home: string; learn: string; funding: string };
  footer: { aboutTitle: string; aboutText: string; helpTitle: string; helpText: string; copyright: string };
  translationNotice: string;
};

type Props = {
  nav: NavigationText;
  title: string;
  showTranslationNotice?: boolean;
  children: ReactNode;
};

/** Page frame: demo banner, header with navigation and language picker, footer. */
export default function Layout({ nav, title, showTranslationNotice, children }: Props) {
  const router = useRouter();
  const locale = router.locale || "en";

  const changeLanguage = (code: string) => {
    router.push({ pathname: router.pathname, query: router.query }, router.asPath, { locale: code });
  };

  const isActive = (href: string) => (href === "/" ? router.pathname === "/" : router.pathname.startsWith(href));

  return (
    <>
      <Head>
        <title>{`${title} | ${nav.siteName}`}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <a className="usa-skipnav" href="#main-content">{nav.skipToContent}</a>

      <div className="demo-banner" role="note">{nav.demoBanner}</div>

      <header className="site-header">
        <div className="grid-container site-header__inner">
          <Link href="/" className="site-brand">
            <span className="site-brand__mark" aria-hidden="true">NJ</span>
            <span>
              <span className="site-brand__state">{nav.stateName}</span>
              <span className="site-brand__name">{nav.siteName}</span>
            </span>
          </Link>
          <label className="language-picker">
            <span className="language-picker__label">{nav.languageLabel}</span>
            <select className="usa-select" value={locale} onChange={(e) => changeLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} lang={l.code}>{l.label}</option>
              ))}
            </select>
          </label>
        </div>
        <nav className="site-nav" aria-label="Primary">
          <div className="grid-container">
            <ul>
              <li><Link href="/" className={isActive("/") ? "is-active" : ""}>{nav.menu.home}</Link></li>
              <li><Link href="/learn/business-structure" className={isActive("/learn") ? "is-active" : ""}>{nav.menu.learn}</Link></li>
              <li><Link href="/funding" className={isActive("/funding") ? "is-active" : ""}>{nav.menu.funding}</Link></li>
            </ul>
          </div>
        </nav>
      </header>

      <main id="main-content" className="site-main">
        {showTranslationNotice && locale !== "en" && (
          <div className="grid-container">
            <div className="usa-alert usa-alert--info usa-alert--slim margin-top-3">
              <div className="usa-alert__body"><p className="usa-alert__text">{nav.translationNotice}</p></div>
            </div>
          </div>
        )}
        {children}
      </main>

      <footer className="site-footer">
        <div className="grid-container">
          <div className="grid-row grid-gap">
            <div className="tablet:grid-col-6">
              <h2 className="site-footer__title">{nav.footer.aboutTitle}</h2>
              <p>{nav.footer.aboutText}</p>
            </div>
            <div className="tablet:grid-col-6">
              <h2 className="site-footer__title">{nav.footer.helpTitle}</h2>
              <p>{nav.footer.helpText}</p>
            </div>
          </div>
          <div className="site-footer__bottom">{nav.footer.copyright}</div>
        </div>
      </footer>
    </>
  );
}
