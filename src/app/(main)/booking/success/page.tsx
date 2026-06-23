"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Calendar, Clock, MapPin, Video, Mail } from "lucide-react";

interface Booking {
    id: string;
    name: string;
    email: string;
    date: string;
    time: string;
    consultation_type: string | null;
    project_type: string | null;
}

type PageState =
    | { kind: "verifying" }
    | { kind: "success"; booking: Booking }
    | { kind: "failed"; message?: string };

export default function BookingSuccessPage() {
    const [state, setState] = useState<PageState>({ kind: "verifying" });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("TransactionToken");

        if (!token) {
            setState({ kind: "failed", message: "No payment token found." });
            return;
        }

        fetch(`/api/payment/verify?token=${encodeURIComponent(token)}`)
            .then((r) => r.json())
            .then((data) => {
                if (data.success && data.status === "succeeded" && data.booking) {
                    setState({ kind: "success", booking: data.booking });
                } else {
                    setState({ kind: "failed", message: "Payment could not be confirmed." });
                }
            })
            .catch(() => setState({ kind: "failed", message: "Something went wrong. Please contact us." }));
    }, []);

    if (state.kind === "verifying") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="text-center">
                    <motion.div
                        animate={{ scale: [1, 1.12, 1] }}
                        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                        className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8"
                    >
                        <CheckCircle2 size={36} className="text-accent" />
                    </motion.div>
                    <p className="text-foreground/40 text-xs uppercase tracking-[0.3em] font-bold mb-3">Just a moment</p>
                    <p className="text-2xl font-heading mb-4">Confirming your booking</p>
                    <p className="text-foreground/50 text-sm max-w-xs mx-auto leading-relaxed">
                        We&apos;re verifying your payment and securing your slot.
                    </p>
                    <div className="flex gap-1 justify-center mt-8">
                        {[0, 1, 2].map((i) => (
                            <motion.span
                                key={i}
                                className="w-2 h-2 bg-accent rounded-full"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (state.kind === "failed") {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <span className="text-3xl text-red-400">✕</span>
                    </div>
                    <p className="text-foreground/40 text-xs uppercase tracking-[0.3em] font-bold mb-3">Payment Issue</p>
                    <h1 className="text-3xl font-heading mb-4">Payment Not Confirmed</h1>
                    <p className="text-foreground/50 text-sm leading-relaxed mb-8">
                        {state.message || "We couldn't confirm your payment. No charge has been made to your account."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/booking"
                            className="bg-accent text-white px-8 py-3 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:shadow-lg transition-shadow"
                        >
                            Try Again
                        </Link>
                        <a
                            href="mailto:hello@noalivingstudio.co.zm"
                            className="border border-foreground/15 text-foreground/60 px-8 py-3 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:border-accent hover:text-accent transition-colors"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    const { booking } = state;

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-24">
            <div className="w-full max-w-lg">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8"
                    >
                        <CheckCircle2 size={44} className="text-accent" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <p className="text-accent text-xs font-bold uppercase tracking-[0.4em] mb-4">
                            Payment Confirmed
                        </p>
                        <h1 className="text-4xl md:text-6xl font-heading mb-8 leading-tight">
                            You&apos;re <span className="italic font-light">Booked!</span>
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-foreground/[0.03] border border-foreground/8 rounded-sm p-6 mb-8 space-y-3"
                    >
                        <div className="flex items-center justify-center gap-3 text-sm">
                            <Calendar size={16} className="text-accent shrink-0" />
                            <span className="font-medium">{booking.date}</span>
                        </div>
                        <div className="flex items-center justify-center gap-3 text-sm">
                            <Clock size={16} className="text-accent shrink-0" />
                            <span className="font-medium">{booking.time} (CAT)</span>
                        </div>
                        {booking.consultation_type && (
                            <div className="flex items-center justify-center gap-3 text-sm">
                                {booking.consultation_type === "walk-in"
                                    ? <MapPin size={16} className="text-accent shrink-0" />
                                    : <Video size={16} className="text-accent shrink-0" />
                                }
                                <span className="font-medium capitalize">
                                    {booking.consultation_type === "walk-in" ? "Walk-in — In-person at the studio" : "Online — Video call"}
                                </span>
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <div className="flex items-center justify-center gap-2 text-sm text-foreground/50 mb-2">
                            <Mail size={14} />
                            <span>Confirmation sent to <strong className="text-accent">{booking.email}</strong></span>
                        </div>
                        <p className="text-foreground/40 text-sm leading-relaxed max-w-sm mx-auto mb-10">
                            {booking.consultation_type === "online"
                                ? "We'll send over a Google Meet link shortly. Looking forward to hearing about your space!"
                                : "We look forward to meeting you at the studio. See you then!"}
                        </p>

                        <Link
                            href="/"
                            className="text-foreground/30 hover:text-accent text-xs uppercase tracking-widest transition-colors"
                        >
                            Back to home
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
