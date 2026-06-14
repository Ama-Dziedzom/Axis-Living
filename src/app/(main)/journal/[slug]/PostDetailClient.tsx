"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Calendar, MessageCircle } from "lucide-react";
import { Post } from "@/types/journal";
import LookbookSection from "@/components/EmailCapture/LookbookSection";
import { cn } from "@/lib/utils";

interface PostDetailClientProps {
    post: Post;
    relatedPosts: Post[];
}

const PostDetailClient = ({ post, relatedPosts }: PostDetailClientProps) => {
    const [scrolledPast, setScrolledPast] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolledPast(window.scrollY > 200);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="bg-background min-h-screen">
            {/* STICKY CTA PILL */}
            <AnimatePresence>
                {scrolledPast && (
                    <motion.div
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        className="fixed bottom-12 right-6 md:right-12 z-[60]"
                    >
                        <Link
                            href="/booking"
                            className="flex items-center gap-3 bg-accent text-white px-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all group"
                        >
                            <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Book a Consultation</span>
                            <MessageCircle size={20} />
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HERO HERO SECTION */}
            <section className="relative h-[80vh] w-full group overflow-hidden bg-neutral-900">
                <Image
                    src={post.coverImage || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-[3s] scale-105 group-hover:scale-110"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-24 pb-20">
                    <div className="max-w-7xl mx-auto w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-accent/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-[0.3em] px-4 py-2 w-fit mb-8"
                        >
                            {post.category}
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl md:text-7xl font-heading text-white max-w-4xl leading-tight mb-8"
                        >
                            {post.title}
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-wrap items-center gap-8 md:gap-12 text-xs uppercase tracking-widest text-white/80 font-bold border-t border-white/20 pt-8"
                        >
                            <span className="flex items-center gap-3"><Calendar size={16} className="text-white" /> {new Date(post.publishedAt).toLocaleDateString('en-ZM', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            <span className="flex items-center gap-3"><Clock size={16} className="text-white" /> {post.readTime}</span>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ARTICLE CONTENT */}
            <article className="pt-24 pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-20">
                        {/* MAIN CONTENT COL */}
                        <div className="flex-1">
                            <Link
                                href="/journal"
                                className="inline-flex items-center gap-3 text-accent text-xs font-bold uppercase tracking-widest mb-16 hover:gap-5 transition-all"
                            >
                                <ArrowLeft size={16} /> Back to Journal
                            </Link>

                            <div className="space-y-12">
                                {post.content.map((block, idx) => {
                                    if (block.type === "paragraph") {
                                        const isFirstParagraph = post.content.findIndex(b => b.type === 'paragraph') === idx;
                                        return (
                                            <p
                                                key={idx}
                                                className={cn(
                                                    "text-lg md:text-xl text-foreground/80 leading-[1.8] font-light max-w-[680px] mx-auto",
                                                    isFirstParagraph && "drop-cap pt-2"
                                                )}
                                                dangerouslySetInnerHTML={{ __html: block.text }}
                                            />
                                        );
                                    }
                                    if (block.type === "heading") {
                                        return (
                                            <h2
                                                key={idx}
                                                className="text-3xl md:text-5xl font-playfair font-bold text-foreground pt-12 max-w-[680px] mx-auto leading-tight"
                                            >
                                                {block.text}
                                            </h2>
                                        );
                                    }
                                    if (block.type === "cta") {
                                        return (
                                            <motion.div
                                                key={idx}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                className="bg-accent p-12 md:p-16 my-16 text-white text-center rounded-sm shadow-2xl"
                                            >
                                                <h3 className="text-2xl md:text-3xl font-heading mb-8 max-w-2xl mx-auto">
                                                    {block.text}
                                                </h3>
                                                <Link
                                                    href={block.buttonLink || "/booking"}
                                                    className="inline-block bg-white text-accent px-10 py-4 rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-white/90 hover:-translate-y-1 transition-all"
                                                >
                                                    {block.buttonText}
                                                </Link>
                                            </motion.div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>

                            {/* TAGS */}
                            <div className="mt-20 pt-12 border-t border-foreground/10 space-y-6">
                                <p className="text-xs uppercase tracking-widest text-foreground/40 font-bold">Topics Covered</p>
                                <div className="flex flex-wrap gap-3">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="text-xs uppercase font-bold tracking-widest px-4 py-2 bg-foreground/5 text-foreground/60 border border-foreground/10 rounded-full">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* RELATED POSTS SECTION */}
            <section className="py-32 bg-foreground/5 border-t border-foreground/10 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-20">
                        <p className="text-accent text-xs font-bold uppercase tracking-[0.4em] mb-4">You might also like</p>
                        <h2 className="text-4xl md:text-6xl font-heading">Related <span className="italic font-light opacity-30">Reading</span></h2>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
                        {relatedPosts.map((rPost) => (
                            <motion.div
                                key={rPost.id}
                                whileHover={{ y: -10 }}
                                className="group bg-white p-6 rounded-sm shadow-2xl"
                            >
                                <Link href={`/journal/${rPost.slug}`} className="block">
                                    <div className="relative aspect-[16/9] overflow-hidden mb-8 border border-foreground/10">
                                        <Image
                                            src={rPost.coverImage || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80"}
                                            alt={rPost.title}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                    </div>
                                    <h3 className="text-2xl font-heading mb-4 group-hover:text-accent transition-colors">
                                        {rPost.title}
                                    </h3>
                                    <p className="text-foreground/50 text-sm line-clamp-2 leading-relaxed mb-8">
                                        {rPost.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between text-xs uppercase tracking-widest font-bold border-t border-foreground/5 pt-6">
                                        <span className="text-foreground/40">{rPost.category}</span>
                                        <span className="text-accent group-hover:underline underline-offset-4">Read Article</span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* EMAIL CAPTURE */}
            <div className="py-24">
                <LookbookSection />
            </div>
        </div>
    );
};

export default PostDetailClient;
