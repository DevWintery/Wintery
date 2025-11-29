import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://wintery-blog.vercel.app' // Replace with your actual domain

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/private/',
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
