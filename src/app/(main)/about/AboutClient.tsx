"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { useRef, useState } from "react";

const fadeInUp: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: "easeOut" }
    }
};

const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.2
        }
    }
};

interface AboutClientProps {
    aboutData?: {
        heroImage?: string;
        headline?: string;
        philosophy?: {
            title?: string;
            body?: string;
        };
        bio?: {
            title?: string;
            body?: string;
            image?: string;
        };
        studioImages?: string[];
        processes?: {
            step: string;
            title: string;
            description: string;
        }[];
        press?: (string | { name: string })[];
    };
}

const AboutClient = ({ aboutData }: AboutClientProps) => {
    const [heroElement, setHeroElement] = useState<HTMLElement | null>(null);
    const { scrollYProgress } = useScroll({
        target: heroElement ? { current: heroElement } : undefined,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    // Hardcoded processes
    const processes = (aboutData?.processes && aboutData.processes.length > 0) ? aboutData.processes : [
        {
            step: "01",
            title: "Discovery",
            description: "We begin with a deep dive into your lifestyle, needs, and aesthetic preferences to establish a clear design direction."
        },
        {
            step: "02",
            title: "Design Development",
            description: "Our team crafts a cohesive design concept including space planning, material palettes, and bespoke furniture selection."
        },
        {
            step: "03",
            title: "Project Management",
            description: "We handle all the details, from procurement to coordinating with contractors, ensuring a seamless implementation."
        },
        {
            step: "04",
            title: "Installation",
            description: "The final reveal. We oversee the delivery and styling of every piece to bring your dream space to life."
        }
    ];

    const press = aboutData?.press || [
        "Lusaka Times",
        "Zambia Design Week",
        "Southern African Design"
    ];

    const studioImages = aboutData?.studioImages || [
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?q=80&w=800&auto=format&fit=crop",
    ];

    return (
        <div className="bg-background min-h-screen">
            {/* Hero Header */}
            <section ref={setHeroElement} className="h-[600px] relative overflow-hidden flex items-center justify-center pt-32">
                <motion.div style={{ y }} className="absolute inset-0 bg-neutral-900">
                    <Image
                        src={aboutData?.heroImage || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80"}
                        alt="Studio Aesthetic Portrait"
                        fill
                        className="object-cover brightness-50 contrast-125"
                        priority
                    />
                </motion.div>
                <div className="absolute inset-0 bg-black/40 z-10" />
                <div className="relative z-20 text-center text-white px-6">
                    <motion.p
                        initial={{ opacity: 0, letterSpacing: "0.2em" }}
                        animate={{ opacity: 1, letterSpacing: "0.5em" }}
                        className="text-white text-xs font-bold uppercase mb-4 opacity-90"
                    >
                        The Studio
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-9xl font-heading mb-10 font-light leading-[1.2] tracking-wide"
                    >
                        About Us
                    </motion.h1>
                    <p className="max-w-2xl mx-auto text-white/90 text-sm tracking-[0.5em] uppercase font-bold text-center">
                        {aboutData?.philosophy?.title || "Deliberate design for elevated living."}
                    </p>
                </div>
            </section>

            {/* Bio Section */}
            <section className="py-24 px-6 lg:px-24">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center mb-32">
                        <motion.div
                            variants={fadeInUp}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true, margin: "-100px" }}
                            className="relative aspect-[3/4] shadow-2xl rounded-sm overflow-hidden"
                        >
                            <Image
                                src={aboutData?.bio?.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"}
                                alt="Principal Designer"
                                fill
                                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-12">
                                <p className="text-white font-heading text-4xl italic leading-none border-l-4 border-accent pl-6">
                                    Kas <br />
                                    <span className="text-sm font-body uppercase font-bold tracking-[0.3em] opacity-70">Founder & Creative Director</span>
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={fadeInUp}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            <span className="text-accent text-xs uppercase font-bold tracking-[0.4em] mb-4 block underline decoration-accent/30 underline-offset-8">Our Philosophy</span>
                            <h2 className="text-3xl md:text-6xl font-heading mb-12 leading-[1.25] tracking-wide">
                                {aboutData?.headline || "Creating spaces that tell your story."}
                            </h2>
                            <div className="space-y-8 text-foreground/70 text-lg leading-relaxed font-body">
                                <p>
                                    {aboutData?.bio?.body || "Founded in Lusaka, Axis Living is a boutique interior design studio dedicated to crafting meaningful, luxury spaces. We believe that your home should be an extension of your soul—a place where every detail is intentional and every corner inspires comfort."}
                                </p>
                                <p>
                                    Our approach is highly collaborative. We work closely with our clients to understand their vision and translate it into a reality that exceeds expectations. From contemporary Minimalist villas to eclectic heritage homes, we bring a refined aesthetic and professional rigour to every project.
                                </p>
                                <p className="font-body italic text-foreground text-2xl py-8 border-y border-foreground/5 leading-relaxed">
                                    &ldquo;{aboutData?.philosophy?.body || "We believe in the power of deliberate living—where design serves both function and the human spirit."}&rdquo;
                                </p>
                                <Link
                                    href="/booking"
                                    className="bg-accent text-white px-10 py-5 rounded-full inline-block text-xs font-bold tracking-[0.2em] uppercase hover:bg-foreground transition-all shadow-xl"
                                >
                                    Book a Consultation
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="bg-foreground py-32 px-6 lg:px-24 text-white/80">
                <div className="max-w-7xl mx-auto">
                    <motion.header
                        variants={fadeInUp}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true, margin: "-100px" }}
                        className="mb-24 text-center"
                    >
                        <span className="text-white/70 text-xs font-bold uppercase tracking-[0.4em] mb-4 block">The Journey</span>
                        <h2 className="text-white text-5xl md:text-8xl font-heading mb-12 font-light leading-[1.2] tracking-wide">Our Process</h2>
                    </motion.header>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16"
                    >
                        {processes.map((proc, idx: number) => (
                            <motion.div
                                key={idx}
                                variants={fadeInUp}
                                className="flex flex-col border-t border-white/10 pt-8 group"
                            >
                                <span className="text-white/30 text-4xl font-body mb-8 italic group-hover:text-white/70 transition-all">{proc.step}</span>
                                <h3 className="text-white text-2xl font-body mb-6 group-hover:text-white/60 transition-colors">{proc.title}</h3>
                                <p className="text-sm font-body leading-relaxed text-white/70">
                                    {proc.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Press / "As Featured In" Section — hidden for now
            <section className="py-24 px-6 lg:px-24 bg-white">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        variants={fadeInUp}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-heading mb-12 tracking-wide text-foreground">As Featured In</h2>
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            {press.map((item, index: number) => {
                                const label = typeof item === 'string' ? item : item.name;
                                return (
                                    <span
                                        key={index}
                                        className="px-6 py-3 border border-[#C9A84C] text-[#C9A84C] rounded-full text-xs font-bold uppercase tracking-widest"
                                    >
                                        {label}
                                    </span>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </section>
            */}

            {/* Gallery/Atmosphere Section */}
            <section className="py-32 px-6 lg:px-24 bg-background">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {studioImages.map((src: string, idx: number) => (
                                <motion.div
                                    key={idx}
                                    variants={fadeInUp}
                                    className="relative aspect-square overflow-hidden bg-neutral-100"
                                >
                                    <Image
                                        src={src}
                                        alt="Behind the scenes"
                                        fill
                                        className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                    />
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            variants={fadeInUp}
                            initial="initial"
                            whileInView="animate"
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-6xl font-heading mb-8 leading-tight tracking-wide">Behind the Studio</h2>
                            <p className="text-foreground/70 text-lg leading-relaxed font-body">
                                Our studio is more than just a place of work; it&apos;s a sanctuary for creativity. We spend our days surrounded by textures, colors, and the raw materials that eventually become the foundations of your home.
                            </p>
                            <p className="mt-8 text-foreground/70 text-lg leading-relaxed font-body">
                                Based in the heart of Lusaka, we are inspired by both the urban pulse and the natural beauty of the Zambian landscape.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutClient;
