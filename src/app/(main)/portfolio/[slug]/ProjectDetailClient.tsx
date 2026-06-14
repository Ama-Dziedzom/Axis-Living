"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, MapPin, Tag, ChevronDown, Quote } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import LinkNext from "next/link";
import { Project } from "@/types/project";
import { useRef, useState } from "react";

interface ProjectDetailClientProps {
    project: Project;
    relatedProjects: Project[];
}

const fadeInUpSettings = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: "easeOut" as const }
};

const ProjectDetailClient = ({ project, relatedProjects }: ProjectDetailClientProps) => {
    const [heroElement, setHeroElement] = useState<HTMLElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: heroElement ? { current: heroElement } : undefined,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    const [currentSpread, setCurrentSpread] = useState(0);
    const totalSpreads = Math.min(3, Math.ceil(project.gallery.length / 3));

    return (
        <div className="bg-background min-h-screen">
            {/* Hero Section */}
            <section ref={setHeroElement} className="relative h-screen w-full overflow-hidden bg-neutral-900">
                <motion.div style={{ y }} className="absolute inset-0">
                    {project.coverImage && (
                        <Image
                            src={project.coverImage!}
                            alt={`${project.title} Interior Design - Final Result Showcase`}
                            fill
                            className="object-cover brightness-[0.4]"
                            priority
                        />
                    )}
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10 flex flex-col justify-end p-8 md:p-24">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="max-w-4xl"
                    >
                        <LinkNext href="/portfolio" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-6 py-2 rounded-full text-xs uppercase tracking-widest inline-flex items-center mb-8 gap-3 border border-white/20 group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Portfolio
                        </LinkNext>
                        <h1 className="text-4xl md:text-9xl font-heading text-white leading-[1.15] mb-10 tracking-wide">{project.title}</h1>
                        <div className="flex flex-wrap items-center gap-12 text-white/70 uppercase tracking-[0.2em] text-xs md:text-sm">
                            <div className="flex items-center gap-3"><MapPin size={18} className="text-accent" /> {project.location}</div>
                            <div className="flex items-center gap-3"><Tag size={18} className="text-accent" /> {project.style} · {project.category}</div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white z-20"
                >
                    <ChevronDown size={32} />
                </motion.div>
            </section>

            {/* Editorial Content */}
            <section className="py-24 px-6 lg:px-24">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-24">
                        {/* Left Column: Brief & Result */}
                        <div className="md:col-span-8 flex flex-col gap-20">
                            <motion.div
                                {...fadeInUpSettings}
                            >
                                <span className="text-tan text-xs md:text-xs font-bold uppercase tracking-[0.4em] mb-4 block">{project.brief.heading}</span>
                                <h2 className="text-3xl md:text-5xl font-heading mb-8 font-light leading-[1.25] tracking-wide">The Story Behind the Space</h2>
                                <p className="text-foreground/70 text-lg md:text-xl leading-relaxed max-w-2xl font-body">
                                    {project.brief.body}
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <motion.div
                                    {...fadeInUpSettings}
                                    className="bg-accent/5 p-12 lg:p-16 border border-accent/10 rounded-sm"
                                >
                                    <span className="text-tan text-xs font-bold uppercase tracking-[0.3em] mb-4 block underline decoration-tan/30 underline-offset-8">{project.approach.heading}</span>
                                    <p className="text-foreground/80 leading-relaxed font-body">
                                        {project.approach.body}
                                    </p>
                                </motion.div>
                                {project.gallery[1] && (
                                    <motion.div
                                        {...fadeInUpSettings}
                                        className="relative aspect-square grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl"
                                    >
                                        <Image
                                            src={project.gallery[1]!}
                                            alt={`${project.title} - Close up of textures, materials, and process`}
                                            fill
                                            className="object-cover"
                                        />
                                    </motion.div>
                                )}
                            </div>

                            <motion.div
                                {...fadeInUpSettings}
                            >
                                <span className="text-tan text-xs font-bold uppercase tracking-[0.3em] mb-4 block">{project.result.heading}</span>
                                <h3 className="text-3xl md:text-4xl font-heading mb-6 tracking-wide leading-[1.2]">The Final Outcome</h3>
                                <p className="text-foreground/70 text-lg md:text-xl leading-relaxed max-w-2xl font-body mb-10">
                                    {project.result.body}
                                </p>
                                {project.gallery[2] && (
                                    <div className="h-[700px] relative mt-16 group overflow-hidden">
                                        <Image
                                            src={project.gallery[2]!}
                                            alt={`${project.title} - Final design result preview`}
                                            fill
                                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Right Column: Sidebar CTA */}
                        <div className="md:col-span-4 sticky top-32 h-fit bg-foreground p-12 text-white rounded-sm shadow-2xl hidden md:block border-t-8 border-accent">
                            <Quote className="text-accent mb-8 opacity-40" size={40} />
                            {/* Removed hardcoded quote */}
                            <div className="space-y-6 pt-6 border-t border-white/10">
                                <p className="text-sm opacity-60 uppercase tracking-widest font-bold">Inspired by this project?</p>
                                <LinkNext
                                    href="/booking"
                                    className="w-full bg-accent text-white py-5 rounded-full text-center flex items-center justify-center font-bold tracking-[0.2em] uppercase text-xs hover:bg-white hover:text-accent transition-all"
                                >
                                    Request Consultation
                                </LinkNext>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Magazine Gallery */}
            <section className="bg-foreground py-32 overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-24">
                    <div className="flex items-center justify-between mb-16">
                        <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Gallery Spread</span>
                        <span className="text-white/20 text-xs uppercase tracking-widest">
                            {currentSpread + 1} / {totalSpreads}
                        </span>
                    </div>

                    {/* Magazine Viewer */}
                    <div className="relative">
                        <AnimatePresence mode="wait">
                            {currentSpread === 0 && (
                                <motion.div
                                    key="spread-0"
                                    initial={{ opacity: 0, x: 60 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -60 }}
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                    className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6"
                                >
                                    <div className="md:col-span-7 h-[400px] md:h-[700px] relative overflow-hidden group">
                                        {project.gallery[0] && <Image src={project.gallery[0]!} alt="Gallery 1" fill className="object-cover transition-transform duration-[1.5s] group-hover:scale-105" />}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 md:p-8">
                                            <p className="text-white/60 text-xs uppercase tracking-widest font-bold">{project.category}</p>
                                            <p className="text-white text-base md:text-lg font-heading mt-1">{project.title}</p>
                                        </div>
                                    </div>
                                    <div className="md:col-span-5 flex flex-col gap-4 md:gap-6">
                                        <div className="h-[300px] md:h-[340px] relative overflow-hidden group">
                                            {project.gallery[1] && <Image src={project.gallery[1]!} alt="Gallery 2" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />}
                                        </div>
                                        <div className="h-[300px] md:h-[340px] relative overflow-hidden group">
                                            {project.gallery[2] && <Image src={project.gallery[2]!} alt="Gallery 3" fill className="object-cover transition-transform duration-[1.5s] group-hover:scale-105" />}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentSpread === 1 && project.gallery.length > 3 && (
                                <motion.div
                                    key="spread-1"
                                    initial={{ opacity: 0, x: 60 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -60 }}
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                    className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6"
                                >
                                    <div className="flex flex-col gap-4 md:gap-6">
                                        <div className="h-[300px] md:h-[420px] relative overflow-hidden group">
                                            {project.gallery[3] && <Image src={project.gallery[3]!} alt="Gallery 4" fill className="object-cover transition-transform duration-[1.5s] group-hover:scale-105" />}
                                        </div>
                                        <div className="bg-white/5 p-6 md:p-12 flex flex-col justify-center">
                                            {/* Removed hardcoded detail text */}
                                        </div>
                                    </div>
                                    <div className="h-[400px] md:h-full relative overflow-hidden group">
                                        {(project.gallery[4] || project.gallery[3]) && <Image src={(project.gallery[4] || project.gallery[3])!} alt="Gallery 5" fill className="object-cover transition-transform duration-[1.5s] group-hover:scale-105" />}
                                        <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                                            <p className="text-white text-xs uppercase tracking-widest font-bold">{project.style}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {currentSpread === 2 && project.gallery.length > 5 && (
                                <motion.div
                                    key="spread-2"
                                    initial={{ opacity: 0, x: 60 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -60 }}
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                    className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6"
                                >
                                    <div className="md:col-span-5 h-[400px] md:h-[700px] relative overflow-hidden group">
                                        {project.gallery[5] && <Image src={project.gallery[5]!} alt="Gallery 6" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />}
                                    </div>
                                    <div className="md:col-span-7 flex flex-col justify-center p-6 md:p-16">
                                        <p className="text-white/20 text-xs uppercase tracking-widest font-bold mb-6 md:mb-8">The Space</p>
                                        <p className="text-white text-2xl md:text-5xl font-heading leading-[1.3] mb-8">
                                            {project.location}
                                        </p>
                                        <p className="text-white/50 text-xs md:text-sm leading-relaxed max-w-md">
                                            {project.result.body}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        <div className="flex items-center justify-center gap-6 mt-12">
                            <button
                                onClick={() => setCurrentSpread(s => Math.max(0, s - 1))}
                                disabled={currentSpread === 0}
                                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                aria-label="Previous spread"
                            >
                                <ArrowLeft size={18} />
                            </button>

                            {/* Page Dots */}
                            <div className="flex items-center gap-3">
                                {Array.from({ length: totalSpreads }).map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentSpread(i)}
                                        className={`transition-all duration-300 rounded-full ${currentSpread === i
                                            ? "w-8 h-2 bg-white"
                                            : "w-2 h-2 bg-white/20 hover:bg-white/40"
                                            }`}
                                        aria-label={`Go to spread ${i + 1}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentSpread(s => Math.min(totalSpreads - 1, s + 1))}
                                disabled={currentSpread === totalSpreads - 1}
                                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                aria-label="Next spread"
                            >
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Thumbnail Strip */}
                    <div className="mt-16 flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        {project.gallery.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSpread(Math.min(Math.floor(idx / 3), totalSpreads - 1))}
                                className={`flex-shrink-0 w-20 h-14 relative overflow-hidden rounded-sm transition-all duration-300 ${Math.floor(idx / 3) === currentSpread
                                    ? "ring-2 ring-white opacity-100"
                                    : "opacity-30 hover:opacity-60"
                                    }`}
                            >
                                {img && <Image src={img!} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Suggested Projects */}
            <section className="py-24 px-6 lg:px-24 bg-background border-t border-foreground/5">
                <div className="max-w-7xl mx-auto">
                    <h5 className="text-xl md:text-2xl font-heading mb-16 uppercase tracking-[0.4em] text-foreground/40 text-center">You May Also Like</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {relatedProjects.map((p: Project) => (
                            <LinkNext key={p.id} href={`/portfolio/${p.slug}`} className="group flex flex-col items-center">
                                <div className="w-full aspect-[16/6] relative overflow-hidden mb-6 rounded-sm">
                                    {p.coverImage && <Image src={p.coverImage} alt={p.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />}
                                    <div className="absolute inset-0 bg-accent/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-center p-4">
                                        <h6 className="text-white text-xl md:text-2xl font-heading mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{p.title}</h6>
                                        <span className="text-white border-b border-white text-xs font-bold tracking-widest uppercase pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">View Project</span>
                                    </div>
                                </div>
                                <span className="text-foreground/40 text-xs tracking-widest uppercase mt-3">{p.location}</span>
                            </LinkNext>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
};

export default ProjectDetailClient;
