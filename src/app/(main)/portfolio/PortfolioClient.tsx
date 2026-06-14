"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Project } from "@/types/project";
import LookbookSection from "@/components/EmailCapture/LookbookSection";

interface PortfolioClientProps {
    initialProjects: Project[];
}

const PortfolioClient = ({ initialProjects }: PortfolioClientProps) => {
    const [filter, setFilter] = useState("All");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const categories = ["All", "Residential", "Commercial", "Contemporary", "Minimalist", "Japandi", "Maximalist"];

    const filteredProjects = initialProjects.filter((project: Project) => {
        if (filter === "All") return true;
        return project.category === filter || project.style === filter;
    });

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
                            className="text-[#705D4E] text-xs uppercase font-bold mb-4"
                        >
                            The Collection
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-8xl font-heading mb-12"
                        >
                            Portfolio <span className="italic font-light text-foreground/20">Catalog</span>
                        </motion.h1>

                        {/* Filter Bar */}
                        <div className="flex flex-wrap items-center gap-6 border-b border-foreground/10 pb-8 overflow-x-auto scroller-hidden">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={cn(
                                        "text-xs md:text-sm uppercase font-bold tracking-[0.2em] px-6 py-2 rounded-full border transition-all",
                                        filter === cat
                                            ? "bg-accent text-white border-accent"
                                            : "bg-transparent text-foreground/70 border-foreground/30 hover:border-accent hover:text-accent hover:bg-accent/5"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </header>

                    {/* Project Grid */}
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((project: Project) => (
                                <motion.div
                                    layout
                                    key={project.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                    className="group relative cursor-pointer"
                                >
                                    <Link href={`/portfolio/${project.slug}`}>
                                        <div className="relative aspect-[16/9] w-full overflow-hidden mb-8 shadow-2xl bg-neutral-100 flex items-center justify-center">
                                            {project.coverImage && (
                                                <Image
                                                    src={project.coverImage!}
                                                    alt={`${project.title} - ${project.category} Interior Design in ${project.location}`}
                                                    fill
                                                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-accent/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-8 text-center text-white">
                                                <h3 className="text-3xl md:text-4xl font-heading mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                    {project.title}
                                                </h3>
                                                <div className="w-12 h-[1px] bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 mb-4" />
                                                <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-200">View Details</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center py-4">
                                            <p className="text-xs uppercase tracking-widest text-foreground/65">
                                                {project.location} · <span className="text-accent">{project.style}</span>
                                            </p>
                                            <motion.div
                                                className="w-10 h-10 rounded-full border border-foreground/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all"
                                            >
                                                <ArrowUpRight size={20} className="text-accent group-hover:text-white transition-colors" />
                                            </motion.div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredProjects.length === 0 && (
                        <div className="py-32 text-center text-foreground/65 uppercase tracking-widest text-sm">
                            No projects found in this category.
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

export default PortfolioClient;
