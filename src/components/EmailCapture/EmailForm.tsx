"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check } from "lucide-react";

interface EmailFormProps {
    variant: "popup" | "inline";
    buttonText?: string;
    onSuccess?: (email: string) => void;
}

export default function EmailForm({ variant, buttonText, onSuccess }: EmailFormProps) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [alreadySubscribed, setAlreadySubscribed] = useState(false);

    const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setAlreadySubscribed(false);

        if (!email) {
            setError("Please enter your email address.");
            return;
        }

        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (data.success) {
                setIsSuccess(true);
                if (onSuccess) onSuccess(email);
            } else if (data.alreadySubscribed) {
                setAlreadySubscribed(true);
            } else {
                setError(data.message || "Something went wrong. Please try again.");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        if (variant === 'inline') {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center py-4"
                >
                    <div className="w-12 h-12 bg-[#C6B9AA] rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                        <Check className="text-[#2F402C]" size={24} />
                    </div>
                    <h3 className="text-xl font-heading mb-2 text-foreground">You&apos;re in!</h3>
                    <p className="text-foreground/70 text-sm max-w-xs">
                        The lookbook is on its way to your inbox.
                    </p>
                </motion.div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white"
            >
                <p className="text-sm font-medium">
                    It&apos;s on its way! Check your inbox in the next few minutes.
                </p>
            </motion.div>
        );
    }

    if (alreadySubscribed) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${variant === 'popup' ? 'text-white' : 'text-foreground'}`}
            >
                <p className="text-sm font-medium">
                    You&apos;re already on our list! Check your inbox for the lookbook.
                </p>
            </motion.div>
        );
    }

    if (variant === 'inline') {
        return (
            <form onSubmit={handleSubmit} className="w-full">
                <div className="flex items-center rounded-full border border-foreground/15 bg-white overflow-hidden transition-all focus-within:border-[#C6B9AA]/40 focus-within:shadow-md">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="flex-grow px-6 py-4 bg-transparent text-foreground placeholder:text-foreground/35 outline-none focus-visible:outline-none caret-foreground/40 text-sm"
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-7 py-3 mr-1.5 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all whitespace-nowrap bg-[#2F402C] text-white hover:bg-[#3d5339] shadow-sm flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={14} />
                                Sending...
                            </>
                        ) : (buttonText || "Submit")}
                    </button>
                </div>
                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-red-500 text-[11px] mt-2 ml-6 font-medium"
                        >
                            {error}
                        </motion.p>
                    )}
                </AnimatePresence>
            </form>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col gap-3">
                <div className="flex-grow">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="w-full px-4 py-3 rounded-md border outline-none transition-colors bg-white/10 border-[#C6B9AA]/30 text-white placeholder:text-[#C6B9AA]/50 focus:border-[#C6B9AA]/60"
                        disabled={isSubmitting}
                    />
                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-400 text-[11px] mt-1 font-medium"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all whitespace-nowrap bg-[#C6B9AA] text-[#2F402C] hover:bg-[#b8a999] shadow-lg flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={14} />
                            Sending...
                        </>
                    ) : (buttonText || "Submit")}
                </button>
            </div>
            <p className="text-[10px] text-[#C6B9AA]/50 mt-3 italic">
                No spam. Unsubscribe anytime.
            </p>
        </form>
    );
}
