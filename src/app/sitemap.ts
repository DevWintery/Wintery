import { MetadataRoute } from 'next'
import { getSortedPostsData } from '@/lib/posts'

export default function sitemap(): MetadataRoute.Sitemap {
    const posts = getSortedPostsData()
    const baseUrl = 'https://wintery-blog.vercel.app' // Replace with your actual domain

    const blogPosts = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.id}`,
        lastModified: post.date,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...blogPosts,
    ]
}
