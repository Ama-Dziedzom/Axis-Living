"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { ArrowRight, Quote } from "lucide-react";
import { Project } from "@/types/project";
import { Post } from "@/types/journal";
import { useState, useEffect } from "react";
import LookbookSection from "@/components/EmailCapture/LookbookSection";

interface HomeClientProps {
    featuredProjects: Project[];
    featuredPosts: Post[];
    siteSettings?: {
        studioName?: string;
        tagline?: string;
        heroImage?: string;
        aboutSection?: {
            subtitle?: string;
            title?: string;
            body?: string;
            buttonText?: string;
            image?: string;
        };
        projectsSection?: {
            subtitle?: string;
            title?: string;
            buttonText?: string;
        };
        testimonialsSection?: {
            subtitle?: string;
            title?: string;
        };
        journalSection?: {
            subtitle?: string;
            title?: string;
            buttonText?: string;
        };
        preFooterSection?: {
            subtitle?: string;
            title?: string;
            body?: string;
            image?: string;
            buttonText?: string;
        };
        lookbookSection?: {
            subtitle?: string;
            title?: string;
            body?: string;
            buttonText?: string;
        };
    };
    testimonials?: {
        quote: string;
        clientName: string;
        location: string;
    }[];
}

const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        }
    }
};

const fadeInUp: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

const pulse: Variants = {
    initial: { scale: 1 },
    animate: {
        scale: [1, 1.05, 1],
        boxShadow: ["0 0 0 0 rgba(201, 168, 76, 0.4)", "0 0 0 15px rgba(201, 168, 76, 0)", "0 0 0 0 rgba(201, 168, 76, 0)"],
        transition: {
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
        }
    }
};

export default function HomeClient({ featuredProjects, featuredPosts, siteSettings, testimonials }: HomeClientProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Axis Living",
        "image": "https://axisliving.co.zm/og-image.jpg",
        "@id": "https://axisliving.co.zm",
        "url": "https://axisliving.co.zm",
        "telephone": "+260 971 251 110",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Main Street",
            "addressLocality": "Lusaka",
            "addressRegion": "Lusaka",
            "postalCode": "10101",
            "addressCountry": "ZM"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": -15.4167,
            "longitude": 28.2833
        },
        "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday"
            ],
            "opens": "08:00",
            "closes": "17:00"
        },
        "sameAs": [
            "https://www.instagram.com/axisliving.zm"
        ],
        "priceRange": "$$$"
    };

    const [heroElement, setHeroElement] = useState<HTMLElement | null>(null);
    const [mounted, setMounted] = useState(false);
    const [marqueesPaused, setMarqueesPaused] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const { scrollYProgress } = useScroll({
        target: heroElement ? { current: heroElement } : undefined,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    if (!mounted) {
        return <div className="min-h-screen bg-background" />;
    }

    // Default hardcoded content
    const studioName = siteSettings?.studioName || "Axis Living";
    const tagline = siteSettings?.tagline || "Spaces Designed for the Way You Live";
    const heroImage = siteSettings?.heroImage || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80";

    return (
        <div className="bg-background min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Hero Section */}
            <section ref={setHeroElement} className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
                <motion.div style={{ y }} className="absolute inset-0 z-0 bg-neutral-900">
                    <Image
                        src={heroImage}
                        alt="Luxury Interior Design"
                        fill
                        sizes="100vw"
                        className="object-cover brightness-50"
                        priority
                    />
                </motion.div>

                <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                    <motion.p
                        initial={{ opacity: 0, letterSpacing: "0.2em" }}
                        animate={{ opacity: 1, letterSpacing: "0.5em" }}
                        transition={{ duration: 1 }}
                        className="text-white uppercase text-xs md:text-sm font-bold tracking-[0.4em] mb-6 drop-shadow-md"
                    >
                        {studioName}
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        className="text-white text-4xl md:text-8xl font-heading mb-10 leading-[1.2] md:leading-[1.25] tracking-wide"
                    >
                        {tagline.toLowerCase().includes('for') ? (
                            <>
                                {tagline.split(/for/i)[0]}for <br />
                                <span className="italic font-light text-white/90">{tagline.split(/for/i)[1]}</span>
                            </>
                        ) : (
                            <span>{tagline}</span>
                        )}
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.8 }}
                        className="flex flex-col md:flex-row items-center justify-center gap-6"
                    >
                        <motion.div
                            variants={pulse}
                            initial="initial"
                            animate="animate"
                        >
                            <Link
                                href="/booking"
                                className="bg-accent hover:bg-white text-white hover:text-accent px-12 py-5 rounded-full text-sm font-bold tracking-[0.2em] uppercase transition-all shadow-xl block"
                            >
                                Book a Consultation
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/50"
                >
                    <span className="text-xs uppercase tracking-[0.3em] mb-4">Discover More</span>
                    <div className="w-[1px] h-16 bg-white/20 relative">
                        <motion.div
                            animate={{ top: ["0%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute left-0 w-full h-4 bg-accent"
                        />
                    </div>
                </motion.div>
            </section>

            {/* Intro Section */}
            <section className="py-24 px-6 lg:px-24 bg-background overflow-hidden text-foreground">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                    <motion.div
                        variants={fadeInUp}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, margin: "-100px" }}
                        className="md:w-1/2"
                    >
                        <span className="text-[#705D4E] font-bold tracking-widest uppercase text-xs mb-4 block">
                            {siteSettings?.aboutSection?.subtitle || "About Us"}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-heading mb-8 leading-[1.2] tracking-wide">
                            {siteSettings?.aboutSection?.title || "A Lusaka-based studio for deliberate living."}
                        </h2>
                        <p className="text-foreground/80 text-lg leading-relaxed mb-8 max-w-xl">
                            {siteSettings?.aboutSection?.body || "We believe that your home should be a reflection of your soul. Our approach combines functional design with timeless aesthetics to create spaces that feel both elevated and lived-in."}
                        </p>
                        <Link href="/about" className="inline-flex items-center text-accent font-bold tracking-widest uppercase text-xs group">
                            {siteSettings?.aboutSection?.buttonText || "Learn Our Story"} <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 50 }}
                        whileInView={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 1 }}
                        viewport={{ once: true }}
                        className="md:w-1/2 relative aspect-[4/5] w-full"
                    >
                        <div className="relative w-full h-full bg-neutral-100 rounded-sm overflow-hidden">
                            <Image
                                src={siteSettings?.aboutSection?.image || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80"}
                                alt="Studio Aesthetic"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Featured Projects Grid */}
            <section className="py-24 px-6 lg:px-24 bg-white">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        variants={fadeInUp}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, margin: "-50px" }}
                        className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-8 text-center md:text-left"
                    >
                        <div>
                            <span className="text-[#705D4E] font-bold tracking-widest uppercase text-xs mb-4 block">
                                {siteSettings?.projectsSection?.subtitle || "Selected Works"}
                            </span>
                            <h2 className="text-4xl md:text-6xl font-heading tracking-wide leading-[1.2] max-w-2xl">
                                {siteSettings?.projectsSection?.title || "The Portfolio"}
                            </h2>
                        </div>
                        <Link href="/portfolio" className="bg-accent text-white px-10 py-4 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-accent/90 transition-all shadow-xl">
                            {siteSettings?.projectsSection?.buttonText || "Explore All Projects"}
                        </Link>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {featuredProjects.map((project: Project) => (
                            <motion.div
                                key={project.id}
                                variants={fadeInUp}
                                className="group cursor-pointer overflow-hidden"
                            >
                                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                                    <Image
                                        src={project.coverImage || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80"}
                                        alt={project.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center text-center p-6">
                                        <h4 className="text-white text-2xl font-heading mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{project.title}</h4>
                                        <Link
                                            href={`/portfolio/${project.slug}`}
                                            className="text-white border border-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-white hover:text-accent transition-all opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                        >
                                            View Project
                                        </Link>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-between items-end">
                                    <div>
                                        <p className="text-accent text-xs font-bold uppercase tracking-widest mb-1">{project.category} · {project.style}</p>
                                        <p className="text-foreground/65 text-xs uppercase tracking-widest">{project.location}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Testimonials Ticker */}
            <section className="py-24 bg-foreground text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-24 mb-16">
                    <motion.div
                        variants={fadeInUp}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <Quote className="mx-auto text-white/15 mb-8" size={32} />
                        <span className="text-white/55 text-xs uppercase tracking-[0.4em] font-bold mb-6 block">
                            {siteSettings?.testimonialsSection?.subtitle || "Client Stories"}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-heading font-light text-white leading-[1.3] max-w-4xl mx-auto">
                            {siteSettings?.testimonialsSection?.title || "Working with Axis Living was the best decision we made for our new home."}
                        </h2>
                    </motion.div>
                </div>

                {/* Marquee Container */}
                <div className="relative">
                    {/* Accessible pause control */}
                    <div className="flex justify-center mb-6">
                        <button
                            onClick={() => setMarqueesPaused(p => !p)}
                            className="text-white/60 hover:text-white text-xs uppercase tracking-widest font-bold px-4 py-2 border border-white/20 rounded-full transition-colors focus-visible:outline-white"
                            aria-label={marqueesPaused ? "Play testimonials" : "Pause testimonials"}
                        >
                            {marqueesPaused ? "▶ Play" : "⏸ Pause"}
                        </button>
                    </div>

                    {/* Gradient masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-r from-foreground to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 bg-gradient-to-l from-foreground to-transparent z-10 pointer-events-none" />

                    {/* Ticker row 1 */}
                    <div className={`flex animate-marquee mb-6 ${marqueesPaused ? '[animation-play-state:paused]' : 'hover:[animation-play-state:paused]'}`}>
                        {(testimonials || []).flatMap((t, idx) => [t, t].map((item, dupIdx) => (
                            <div
                                key={`${idx}-${dupIdx}`}
                                className="flex-shrink-0 w-[350px] md:w-[420px] mx-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm p-8 group hover:bg-white/10 transition-colors duration-500"
                            >
                                <Quote size={20} className="text-white/15 mb-4" />
                                <p className="text-white/70 text-sm leading-relaxed mb-6 italic font-body">
                                    &ldquo;{item.quote}&rdquo;
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/75">
                                        {item.clientName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs uppercase tracking-widest text-white/90">{item.clientName}</p>
                                        <p className="text-white/60 text-xs uppercase tracking-wider">{item.location}</p>
                                    </div>
                                </div>
                            </div>
                        )))}
                    </div>
                </div>
            </section>

            <LookbookSection data={siteSettings?.lookbookSection} />

            {/* Journal Preview Section */}
            <section className="py-24 px-6 lg:px-24 bg-white border-t border-foreground/5 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <header className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <motion.div
                            variants={fadeInUp}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            className="max-w-4xl"
                        >
                            <span className="text-[#705D4E] font-bold tracking-widest uppercase text-xs mb-4 block">
                                {siteSettings?.journalSection?.subtitle || "From the Studio"}
                            </span>
                            <h2 className="text-4xl md:text-6xl font-heading tracking-wide leading-[1.2]">
                                {siteSettings?.journalSection?.title || "Thoughts on design, process, and living well"}
                            </h2>
                        </motion.div>
                        <motion.div
                            variants={fadeInUp}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                        >
                            <Link href="/journal" className="bg-accent text-white px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-accent/90 transition-all shadow-lg flex items-center gap-2 whitespace-nowrap">
                                {siteSettings?.journalSection?.buttonText || "Read All Articles"} <ArrowRight size={14} />
                            </Link>
                        </motion.div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {featuredPosts.slice(0, 2).map((post: Post) => (
                            <motion.div
                                key={post.id}
                                variants={fadeInUp}
                                initial="initial"
                                whileInView="animate"
                                viewport={{ once: true }}
                                className="group bg-background overflow-hidden shadow-2xl flex flex-col md:flex-row border border-foreground/5 hover:border-accent/10 transition-all duration-500"
                            >
                                <div className="relative aspect-[16/10] md:aspect-square md:w-[45%] overflow-hidden bg-neutral-100">
                                    <Image
                                        src={post.coverImage || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80"}
                                        alt={post.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 45vw"
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 backdrop-blur-md text-accent text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-8 md:p-10 md:w-[55%] flex flex-col justify-center">
                                    <p className="text-xs uppercase tracking-widest text-foreground/65 font-bold mb-4">{post.readTime} · {new Date(post.publishedAt).toLocaleDateString('en-ZM', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    <h3 className="text-2xl md:text-3xl mb-6 group-hover:text-accent transition-colors leading-snug font-heading">{post.title}</h3>
                                    <p className="text-foreground/70 text-sm line-clamp-3 mb-8 leading-relaxed">{post.excerpt}</p>
                                    <div className="pt-2">
                                        <Link href={`/journal/${post.slug}`} className="text-xs font-bold uppercase tracking-widest text-accent hover:gap-4 transition-all flex items-center gap-2 group-hover:gap-4">
                                            Read Entry <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Hero */}
            <section className="relative h-[80vh] min-h-[500px] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-neutral-900">
                    <Image
                        src={siteSettings?.preFooterSection?.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80"}
                        alt="Beautifully designed interior space"
                        fill
                        sizes="100vw"
                        className="object-cover brightness-[0.3]"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl"
                >
                    <span className="text-white/60 text-xs uppercase tracking-[0.4em] font-bold mb-8 block">
                        {siteSettings?.preFooterSection?.subtitle || "Start Your Journey"}
                    </span>
                    <h2 className="text-4xl md:text-8xl font-heading text-white mb-8 leading-[1.15] tracking-wide">
                        {siteSettings?.preFooterSection?.title || "Let's Talk About Your Space."}
                    </h2>
                    <p className="text-white/75 text-sm md:text-base max-w-lg mb-12 leading-relaxed font-body">
                        {siteSettings?.preFooterSection?.body || "Begin your design journey with a complimentary consultation. Tell us about your vision, and we'll help you bring it to life."}
                    </p>
                    <Link
                        href="/booking"
                        className="bg-white text-foreground px-8 md:px-16 py-5 md:py-6 rounded-full text-xs md:text-sm font-bold tracking-[0.2em] uppercase hover:bg-accent hover:text-white transition-all shadow-2xl hover:scale-105 active:scale-95"
                    >
                        {siteSettings?.preFooterSection?.buttonText || "Book a Consultation"}
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}
