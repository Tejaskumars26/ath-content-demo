import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { isRtl } from "@/lib/languages";
import "@uswds/uswds/css/uswds.min.css";
import "@/styles/site.css";

export default function App({ Component, pageProps }: AppProps) {
  const { locale } = useRouter();

  // Language switches happen client-side: keep <html lang/dir> in sync (right-to-left for Arabic)
  useEffect(() => {
    document.documentElement.lang = locale || "en";
    document.documentElement.dir = isRtl(locale) ? "rtl" : "ltr";
  }, [locale]);

  return <Component {...pageProps} />;
}
