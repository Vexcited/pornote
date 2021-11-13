import type { DefaultSeoProps } from "next-seo";

const projectDescription = "Redesign de l'application web Pronote. Celle-ci est complétement personnalisable et inclus de nouvelles fonctionnalitées."
const projectUrl = "https://pronote-evolution.vercel.app";
const projectName = "Pronote Évolution";

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

    // Remove the ability to zoom on mobile devices.
    additionalMetaTags: [
        {
            name: "viewport",
            content: "width=device-width, user-scalable=no"
        }
    ]
}

export default SeoProps;