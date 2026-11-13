import Document, { Head, Html, Main, NextScript } from "next/document";
import { isRtl } from "@/lib/languages";

export default class SiteDocument extends Document {
  render() {
    const locale = this.props.locale || "en";
    return (
      <Html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
        <Head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700&display=swap"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
