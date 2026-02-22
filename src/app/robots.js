export default function robots() {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin", "/private/"],
        },
        sitemap: "https://duffysfurniturecommercial.com.au/sitemap.xml",
    };
}
