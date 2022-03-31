import type { DefaultSeoProps } from "next-seo";

const projectDescription = "Redesign de l'application web Pronote. Celle-ci est complétement personnalisable et inclues de nouvelles fonctionnalitées.";
const projectUrl = "https://pornote.vexcited.ml";
const projectName = "Pornote";

const SeoProps: DefaultSeoProps = {
  titleTemplate: `%s - ${projectName}`,
  defaultTitle: projectName,

  description: projectDescription,

  openGraph: {
    type: "website",
    locale: "fr_FR",

    url: projectUrl,
    title: projectName,
    description: projectDescription
  },

  twitter: {
    cardType: "summary_large_image"
  },

  additionalMetaTags: [
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1.0, user-scalable=no"
    },
    {
      name: "theme-color",
      content: "#17AA67"
    }
  ],

  additionalLinkTags: [
    {
      rel: "apple-touch-icon",
      href: "/apple-touch-icon.png",
      sizes: "180x180"
    },
    {
      rel: "manifest",
      href: "/manifest.json"
    },
    {
      rel: "icon",
      href: "/favicon.ico"
    }
  ]
};

export default SeoProps;