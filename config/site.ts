export const siteConfig = {
    name: "Website Audit App",
    url: "http://localhost:3000",
    description: "Get a free, comprehensive audit of your website's performance, SEO, and more.",
};

export type SiteConfig = typeof siteConfig;

export const appConfig = {
    audits: {
        freeTierLimit: 3,
    },
};