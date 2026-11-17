/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Small self-contained server for the container image (Cloud Run)
  output: "standalone",
  // English is the source language; the others are filled by ATH translation Pull Requests.
  i18n: {
    locales: ["en", "es", "pt-BR", "ko", "gu", "zh-CN", "yue", "ht", "ar"],
    defaultLocale: "en",
  },
};

export default nextConfig;
