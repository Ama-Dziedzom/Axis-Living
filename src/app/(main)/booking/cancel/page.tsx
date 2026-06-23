"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function BookingCancelPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-md"
            >
                <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-8">
                    <span className="text-3xl">↩</span>
                </div>

                <p className="text-foreground/40 text-xs font-bold uppercase tracking-[0.4em] mb-4">
                    Payment Cancelled
                </p>
                <h1 className="text-4xl md:text-5xl font-heading mb-6 leading-tight">
                    No worries —<br />
                    <span className="italic font-light">your slot is still open.</span>
                </h1>
                <p className="text-foreground/50 text-sm leading-relaxed mb-10 max-w-xs mx-auto">
                    You cancelled before completing payment. No charge was made. Head back and try again whenever you&apos;re ready.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/booking"
                        className="bg-accent text-white px-8 py-4 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:shadow-lg hover:shadow-accent/20 transition-shadow flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={14} />
                        Try Again
                    </Link>
                    <Link
                        href="/"
                        className="border border-foreground/15 text-foreground/60 px-8 py-4 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={14} />
                        Go Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
