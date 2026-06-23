import { MetadataRoute } from 'next'
import { projects } from '@/data/projects'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://noalivingstudio.co.zm'

    // Projects dynamic routes
    const projectUrls = projects.map((project) => ({
        url: `${baseUrl}/portfolio/${project.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: `${baseUrl}/portfolio`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
{
            url: `${baseUrl}/booking`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        ...projectUrls,
    ]
}
