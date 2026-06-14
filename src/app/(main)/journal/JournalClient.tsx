"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Post } from "@/types/journal";
import LookbookSection from "@/components/EmailCapture/LookbookSection";

interface JournalClientProps {
    initialPosts: Post[];
    initialFeaturedPosts: Post[];
}

const JournalClient = ({ initialPosts, initialFeaturedPosts }: JournalClientProps) => {
    const [filter, setFilter] = useState("All");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const categories = ["All", "Design Guides", "Art & Culture", "Budgeting", "Small Spaces"];

    const filteredPosts = initialPosts.filter((post: Post) => {
        if (filter === "All") return true;
        return post.category === filter;
    });

    // Separating posts for the layout - only when filter is "All"
    const displayFeatured = filter === "All" ? initialFeaturedPosts : [];
    const displayGrid = filter === "All"
        ? initialPosts.filter(p => !p.featured)
        : filteredPosts;

    if (!mounted) {
        return <div className="min-h-screen bg-background pt-32 px-6 lg:px-24" />;
    }

    return (
        <div className="bg-background min-h-screen">
            <div className="pt-32 pb-24 px-6 lg:px-24">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-20">
                        <motion.p
                            initial={{ opacity: 0, letterSpacing: "0.1em" }}
                            animate={{ opacity: 1, letterSpacing: "0.4em" }}
                            className="text-accent text-xs uppercase font-bold mb-4"
                        >
                            The Journal
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-8xl font-heading mb-6"
                        >
                            Journal
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-foreground/60 max-w-2xl font-light leading-relaxed mb-12"
                        >
                            Design thinking, project stories, and honest advice from the studio.
                        </motion.p>

                        {/* Filter Bar */}
                        <div className="flex flex-wrap items-center gap-4 border-b border-foreground/10 pb-8 overflow-x-auto scroller-hidden">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={cn(
                                        "text-xs md:text-sm uppercase font-bold tracking-[0.2em] px-6 py-2 rounded-full border transition-all whitespace-nowrap",
                                        filter === cat
                                            ? "bg-accent text-white border-accent shadow-lg shadow-accent/20"
                                            : "bg-transparent text-foreground/40 border-foreground/10 hover:border-accent/40 hover:text-accent"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </header>

                    {/* Featured Posts Row */}
                    {displayFeatured.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-24">
                            {displayFeatured.map((post) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                    className="group"
                                >
                                    <Link href={`/journal/${post.slug}`} className="block">
                                        <div className="relative aspect-[16/10] overflow-hidden mb-8 shadow-2xl rounded-sm bg-neutral-100 flex items-center justify-center">
                                            {post.coverImage && (
                                                <Image
                                                    src={post.coverImage || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80"}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                                />
                                            )}
                                            <div className="absolute top-6 left-6">
                                                <span className="bg-white/90 backdrop-blur-md text-accent text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-sm">
                                                    {post.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-6 text-xs uppercase tracking-widest text-foreground/40 font-bold">
                                                <span className="flex items-center gap-2"><Calendar size={14} className="text-accent" /> {new Date(post.publishedAt).toLocaleDateString('en-ZM', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                <span className="flex items-center gap-2"><Clock size={14} className="text-accent" /> {post.readTime}</span>
                                            </div>
                                            <h2 className="text-3xl md:text-4xl font-heading group-hover:text-accent transition-colors duration-300 leading-tight">
                                                {post.title}
                                            </h2>
                                            <p className="text-foreground/60 leading-relaxed max-w-xl text-sm md:text-base">
                                                {post.excerpt}
                                            </p>
                                            <div className="pt-2 flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest group-hover:gap-4 transition-all duration-300">
                                                Read Entry <ArrowRight size={14} />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Remaining Posts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                        <AnimatePresence mode="popLayout">
                            {displayGrid.map((post) => (
                                <motion.div
                                    layout
                                    key={post.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.5 }}
                                    className="group"
                                >
                                    <Link href={`/journal/${post.slug}`} className="block">
                                        <div className="relative aspect-[4/3] overflow-hidden mb-6 shadow-xl rounded-sm bg-neutral-100 flex items-center justify-center">
                                            {post.coverImage && (
                                                <Image
                                                    src={post.coverImage || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80"}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            )}
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-accent shadow-sm">
                                                    {post.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-foreground/40 font-bold">
                                                <span>{new Date(post.publishedAt).toLocaleDateString('en-ZM', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                <span>•</span>
                                                <span>{post.readTime}</span>
                                            </div>
                                            <h3 className="text-xl font-heading group-hover:text-accent transition-colors duration-300 leading-snug">
                                                {post.title}
                                            </h3>
                                            <p className="text-foreground/50 text-sm line-clamp-2 leading-relaxed">
                                                {post.excerpt}
                                            </p>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {displayGrid.length === 0 && displayFeatured.length === 0 && (
                        <div className="py-32 text-center text-foreground/40 uppercase tracking-widest text-sm">
                            No journal entries found in this category.
                        </div>
                    )}
                </div>
            </div>

            <div className="pb-24">
                <LookbookSection />
            </div>
        </div>
    );
};

export default JournalClient;
