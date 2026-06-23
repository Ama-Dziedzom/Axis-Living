import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchPostBySlug, fetchRelatedPosts } from "@/lib/data";
import PostDetailClient from "./PostDetailClient";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await fetchPostBySlug(slug);
    if (!post) return { title: "Post Not Found" };

    return {
        title: `${post.title} | NOA Living Studio Journal`,
        description: post.excerpt,
        openGraph: {
            title: `${post.title} | NOA Living Studio Journal`,
            description: post.excerpt,
            images: [
                {
                    url: post.coverImage ?? "/noa-living-studio.png",
                    width: 1200,
                    height: 630,
                    alt: post.title,
                }
            ],
            type: 'article',
            publishedTime: post.publishedAt,
            authors: ["NOA Living Studio"],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: [post.coverImage ?? "/noa-living-studio.png"],
        }
    };
}

export default async function PostDetailPage({ params }: Props) {
    const { slug } = await params;
    const post = await fetchPostBySlug(slug);
    if (!post) notFound();

    const relatedPosts = await fetchRelatedPosts(post.slug, 2);

    // JSON-LD for Search Engines
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": post.coverImage,
        "datePublished": post.publishedAt,
        "author": {
            "@type": "Organization",
            "name": "NOA Living Studio"
        },
        "description": post.excerpt,
        "articleBody": post.content.filter((block: { type: string }) => block.type === 'paragraph').map((block: { text: string }) => block.text).join(' ')
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <PostDetailClient post={post} relatedPosts={relatedPosts} />
        </>
    );
}
