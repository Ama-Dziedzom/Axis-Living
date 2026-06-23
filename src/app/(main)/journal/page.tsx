import { Metadata } from "next";
import JournalClient from "./JournalClient";
import { fetchPosts, fetchFeaturedPosts } from "@/lib/data";

export const metadata: Metadata = {
    title: "Journal | NOA Living Studio - Design Thinking & Stories",
    description: "Explore our collection of design thinking, project stories, and honest advice from our studio.",
};

export default async function JournalPage() {
    const allPosts = await fetchPosts();
    const featuredPosts = await fetchFeaturedPosts();
    return <JournalClient initialPosts={allPosts} initialFeaturedPosts={featuredPosts} />;
}
