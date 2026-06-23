import { Metadata } from "next";
import ProjectDetailClient from "./ProjectDetailClient";
import { fetchProjectBySlug, fetchRelatedProjects } from "@/lib/data";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const project = await fetchProjectBySlug(slug);
    if (!project) return { title: "Project Not Found" };

    return {
        title: project.title,
        description: project.brief.body.substring(0, 160) + "...",
        alternates: {
            canonical: `/portfolio/${slug}`,
        },
        openGraph: {
            title: `${project.title} | NOA Living Studio - Bespoke Interiors`,
            description: project.brief.body.substring(0, 160) + "...",
            images: [
                {
                    url: project.coverImage ?? "/noa-living-studio.png",
                    width: 1200,
                    height: 630,
                    alt: project.title,
                }
            ],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: project.title,
            description: project.brief.body.substring(0, 160) + "...",
            images: [project.coverImage ?? "/noa-living-studio.png"],
        }
    };
}

export default async function ProjectDetailPage({ params }: Props) {
    const { slug } = await params;
    const project = await fetchProjectBySlug(slug);
    if (!project) notFound();

    const relatedProjects = await fetchRelatedProjects(project.slug, 2);

    return <ProjectDetailClient project={project} relatedProjects={relatedProjects} />;
}
