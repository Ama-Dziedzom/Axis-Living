"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface NavbarProps {
    siteSettings?: {
        headerLogo?: string;
        studioName?: string;
        navbarLinks?: { name: string; href: string }[];
    };
}

const Navbar = ({ siteSettings }: NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [scrollAmount, setScrollAmount] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            setScrollAmount(window.scrollY);
        };
        window.addEventListener("scroll", handleScroll);
        // Set initial state
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const defaultLinks = [
        { name: "Portfolio", href: "/portfolio" },
        { name: "About", href: "/about" },
        { name: "Journal", href: "/journal" },
    ];

    const navLinks = (siteSettings?.navbarLinks && siteSettings.navbarLinks.length > 0)
        ? siteSettings.navbarLinks.filter((link: { name?: string; href?: string }) => link.href)
        : defaultLinks;

    const isProjectDetail = pathname.startsWith("/portfolio/") && pathname !== "/portfolio";
    const isDarkHero = pathname === "/" || pathname === "/about" || isProjectDetail;
    const navTextColor = (scrolled && !isDarkHero) || (scrollAmount > 300)
        ? "text-foreground"
        : (isDarkHero ? "text-white" : "text-foreground");

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-6 md:py-8 flex items-center justify-between transition-[padding,background-color] duration-500",
                (scrolled && !isOpen)
                    ? "bg-background/30 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-white/10 py-4 md:py-4"
                    : "bg-transparent",
                isOpen ? "text-foreground transition-none" : navTextColor
            )}
        >
            <Link href="/" className="relative block">
                {siteSettings?.headerLogo ? (
                    <Image
                        src={siteSettings.headerLogo}
                        alt={`${siteSettings?.studioName || "Axis Living"} - Bespoke Interiors`}
                        width={240}
                        height={100}
                        className="h-12 md:h-20 w-auto object-contain transition-all duration-500"
                        style={{
                            filter: isDarkHero && !scrolled
                                ? "brightness(0) invert(1)"
                                : "brightness(0)"
                        }}
                        priority
                    />
                ) : (
                    <span className="text-xl font-heading tracking-widest text-accent uppercase">Axis Living</span>
                )}
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-10 text-sm font-medium tracking-wide uppercase">
                {navLinks.map((link: { name: string; href: string }, index: number) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={`${link.href}-${index}`}
                            href={link.href}
                            className={cn(
                                "transition-all duration-300 relative py-1",
                                // Base Color
                                navTextColor,
                                // Hover State
                                scrolled ? "hover:text-accent" : (isDarkHero ? "hover:text-white/60" : "hover:text-accent"),
                                // Active State
                                isActive && cn(
                                    "font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-px",
                                    scrolled || !isDarkHero ? "text-accent after:bg-accent" : "text-white after:bg-white"
                                )
                            )}
                        >
                            {link.name}
                        </Link>
                    );
                })}
                <Link
                    key="desktop-booking"
                    href="/booking"
                    className="bg-accent text-white px-6 py-2 rounded-full hover:bg-accent/90 transition-all shadow-md hover:scale-105 active:scale-95"
                >
                    Book a Consultation
                </Link>
            </div>

            {/* Mobile Toggle */}
            <button
                className={cn("md:hidden z-[110] transition-colors duration-300", isOpen ? "text-foreground" : navTextColor)}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
            >
                {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="mobile-menu-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-background z-[100] flex flex-col items-center justify-center p-6 md:hidden"
                    >
                        <motion.div
                            className="flex flex-col items-center space-y-12"
                            variants={{
                                open: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
                                closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                            }}
                            initial="closed"
                            animate="open"
                        >
                            <motion.div
                                key="mobile-home"
                                variants={{
                                    open: { opacity: 1, y: 0 },
                                    closed: { opacity: 0, y: 20 }
                                }}
                            >
                                <Link
                                    href="/"
                                    className="text-4xl font-heading text-foreground hover:text-accent transition-colors tracking-widest uppercase"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Home
                                </Link>
                            </motion.div>
                            {navLinks.map((link: { name: string; href: string }, index: number) => (
                                <motion.div
                                    key={`${link.href}-${index}`}
                                    variants={{
                                        open: { opacity: 1, y: 0 },
                                        closed: { opacity: 0, y: 20 }
                                    }}
                                >
                                    <Link
                                        href={link.href}
                                        className="text-4xl font-heading text-foreground hover:text-accent transition-colors tracking-widest uppercase"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                key="mobile-booking"
                                variants={{
                                    open: { opacity: 1, y: 0 },
                                    closed: { opacity: 0, y: 20 }
                                }}
                                className="pt-6"
                            >
                                <Link
                                    href="/booking"
                                    className="px-8 py-4 bg-accent text-white text-[10px] md:text-[12px] font-bold tracking-[0.3em] uppercase rounded-full shadow-2xl"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Book a Consultation
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
