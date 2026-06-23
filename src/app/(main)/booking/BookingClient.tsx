"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Mail,
    Clock,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    User,
    Phone,
    MessageSquare,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    MapPin,
    Video,
} from "lucide-react";
import { Clock01Icon, Calendar01Icon, SecurityCheckIcon } from "hugeicons-react";

// ───── Currency Config ─────
const CURRENCIES = [
    { code: "ZMW", symbol: "K",  name: "Zambian Kwacha", amount: 250  },
    { code: "USD", symbol: "$",  name: "US Dollar",       amount: 20   },
    { code: "EUR", symbol: "€",  name: "Euro",            amount: 18   },
    { code: "GBP", symbol: "£",  name: "British Pound",   amount: 15   },
] as const;

type CurrencyConfig = typeof CURRENCIES[number];

// ───── Helpers ─────
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TIME_SLOTS = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM",
    "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM",
];

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function isWeekend(year: number, month: number, day: number) {
    const d = new Date(year, month, day).getDay();
    return d === 0 || d === 6;
}

function isPast(year: number, month: number, day: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(year, month, day);
    return target < today;
}

function getBookedSlots(date: Date): string[] {
    const seed = date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
    const booked: string[] = [];
    TIME_SLOTS.forEach((slot, i) => {
        if ((seed * (i + 3)) % 7 === 0) booked.push(slot);
    });
    return booked;
}

// ───── Types ─────
type BookingStep = "date" | "time" | "details";

interface BookingFormData {
    name: string;
    email: string;
    phone: string;
    projectType: string;
    message: string;
    consultationType: "walk-in" | "online" | "";
}

// ───── Component ─────
interface BookingClientProps {
    siteSettings?: {
        studioName?: string;
        email?: string;
    };
}

const BookingClient = ({ siteSettings }: BookingClientProps) => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [step, setStep] = useState<BookingStep>("date");
    const [formData, setFormData] = useState<BookingFormData>({
        name: "",
        email: "",
        phone: "",
        projectType: "",
        message: "",
        consultationType: "",
    });
    const [nameError, setNameError] = useState<string | null>(null);
    const [currency, setCurrency] = useState<CurrencyConfig>(CURRENCIES[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Calendar data
    const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);
    const firstDay = useMemo(() => getFirstDayOfMonth(currentYear, currentMonth), [currentYear, currentMonth]);
    const bookedSlots = useMemo(
        () => (selectedDate ? getBookedSlots(selectedDate) : []),
        [selectedDate]
    );
    const calendarCells = useMemo(() => {
        const cells: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(d);
        return cells;
    }, [firstDay, daysInMonth]);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-background pt-32 px-4 md:px-6 lg:px-24" />;
    }

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonth((m) => m - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonth((m) => m + 1);
        }
    };

    const canGoPrev = currentYear > today.getFullYear() || currentMonth > today.getMonth();

    const handleDateSelect = (day: number) => {
        if (isWeekend(currentYear, currentMonth, day) || isPast(currentYear, currentMonth, day)) return;
        setSelectedDate(new Date(currentYear, currentMonth, day));
        setSelectedTime(null);
        setStep("time");
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setStep("details");
    };

    const formatSelectedDate = () => {
        if (!selectedDate) return "";
        return `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.consultationType) return;

        const nameParts = formData.name.trim().split(/\s+/);
        const last = nameParts.length > 1 ? nameParts.slice(1).join(" ") : nameParts[0];
        if (last.length < 2) {
            setNameError("Please enter your full name — first and last name.");
            return;
        }
        setNameError(null);
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/payment/card/initiate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    date: formatSelectedDate(),
                    time: selectedTime!,
                    projectType: formData.projectType,
                    consultationType: formData.consultationType,
                    message: formData.message,
                    amount: currency.amount,
                    currency: currency.code,
                }),
            });

            const result = await res.json();
            if (!result.success) throw new Error(result.message);

            window.location.href = result.paymentUrl;
        } catch (error) {
            console.error("Payment initiation error:", error);
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setSelectedDate(null);
        setSelectedTime(null);
        setStep("date");
        setFormData({ name: "", email: "", phone: "", projectType: "", message: "", consultationType: "" });
        setNameError(null);
        setCurrency(CURRENCIES[0]);
    };

    const stepNumber = step === "date" ? "1" : step === "time" ? "2" : "3";
    const progressWidth = step === "date" ? "33%" : step === "time" ? "66%" : "100%";

    // ───── Render ─────
    return (
        <div className="bg-background min-h-screen pt-32 pb-24 px-4 md:px-6 lg:px-24">
            <div className="max-w-5xl mx-auto flex flex-col items-center">
                {/* Header */}
                <header className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0, letterSpacing: "0.2em" }}
                        animate={{ opacity: 1, letterSpacing: "0.5em" }}
                        className="text-accent text-xs font-bold uppercase mb-6"
                    >
                        Let&apos;s Talk About Your Space
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-8xl font-heading mb-10 leading-[1.1]"
                    >
                        Book a <span className="italic font-light">Consultation</span>
                    </motion.h1>
                    <p className="max-w-xl mx-auto text-foreground/60 text-lg leading-relaxed font-body mb-8">
                        Book a 30-minute discovery call — in-person at the studio or virtually. We&apos;ll talk about your project,
                        your vision, and how we can bring it to life together.
                    </p>
                </header>

                {/* What to prepare */}
                <div className="w-full mb-12 text-center">
                    <p className="text-foreground/50 text-sm italic font-body">
                        <span className="font-bold not-italic text-xs uppercase tracking-widest text-accent block mb-3">
                            What to prepare
                        </span>
                        Have a rough idea of your space (photos help!), your timeline, and your
                        budget range. That&apos;s it.
                    </p>
                </div>

                {/* Feature cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 w-full border-y border-foreground/5 py-12">
                    <div className="flex flex-col items-center text-center p-6 bg-accent text-white shadow-xl rounded-sm">
                        <Clock01Icon className="text-white/70 mb-4" size={44} />
                        <p className="text-sm uppercase font-bold tracking-widest mb-2 font-heading">
                            30-Minute Call
                        </p>
                        <p className="text-sm opacity-70">
                            Efficient exploration of your project goals.
                        </p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 bg-accent text-white shadow-xl rounded-sm">
                        <Calendar01Icon className="text-white/70 mb-4" size={44} />
                        <p className="text-sm uppercase font-bold tracking-widest mb-2 font-heading">
                            Self-Scheduling
                        </p>
                        <p className="text-sm opacity-70">
                            Choose a time that fits your own busy calendar.
                        </p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 bg-accent text-white shadow-xl rounded-sm">
                        <SecurityCheckIcon className="text-white/70 mb-4" size={44} />
                        <p className="text-sm uppercase font-bold tracking-widest mb-2 font-heading">
                            No Obligation
                        </p>
                        <p className="text-sm opacity-70">
                            A discovery phase before any formal commitment.
                        </p>
                    </div>
                </div>

                {/* ───── Booking Widget ───── */}
                <div className="w-full bg-white shadow-2xl rounded-sm overflow-hidden border border-foreground/5">
                    {/* Widget header */}
                    <div className="p-6 border-b border-white/10 bg-accent">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-white text-xs uppercase tracking-[0.3em] font-bold">
                                Secure Booking Portal
                            </span>
                            <span className="text-white/70 text-xs uppercase tracking-[0.2em]">
                                Step {stepNumber} of 3
                            </span>
                        </div>
                        <div className="w-full h-[2px] bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: progressWidth }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                        </div>
                    </div>

                    {/* Widget body */}
                    <div className="relative min-h-[550px]">
                        <AnimatePresence mode="wait">

                            {/* ─── STEP 1: Calendar ─── */}
                            {step === "date" && (
                                <motion.div
                                    key="date"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.35 }}
                                    className="p-8 md:p-12"
                                >
                                    <p className="text-center text-foreground/40 text-xs uppercase tracking-[0.3em] font-bold mb-8">
                                        Select a Date
                                    </p>

                                    <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
                                        <button
                                            onClick={prevMonth}
                                            disabled={!canGoPrev}
                                            className="p-2 rounded-full hover:bg-foreground/5 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                                            aria-label="Previous month"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <h3 className="text-xl font-body tracking-wide">
                                            {MONTH_NAMES[currentMonth]} {currentYear}
                                        </h3>
                                        <button
                                            onClick={nextMonth}
                                            className="p-2 rounded-full hover:bg-foreground/5 transition-colors"
                                            aria-label="Next month"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 max-w-md mx-auto mb-2">
                                        {DAY_LABELS.map((d) => (
                                            <div
                                                key={d}
                                                className="text-center text-xs uppercase tracking-widest text-foreground/30 font-bold py-2"
                                            >
                                                {d}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 max-w-md mx-auto">
                                        {calendarCells.map((day, i) => {
                                            if (day === null) return <div key={`empty-${i}`} />;
                                            const past = isPast(currentYear, currentMonth, day);
                                            const weekend = isWeekend(currentYear, currentMonth, day);
                                            const disabled = past || weekend;
                                            const isToday = isSameDay(new Date(currentYear, currentMonth, day), today);
                                            const isSelected = selectedDate && isSameDay(new Date(currentYear, currentMonth, day), selectedDate);
                                            return (
                                                <button
                                                    key={`day-${day}`}
                                                    onClick={() => handleDateSelect(day)}
                                                    disabled={disabled}
                                                    className={`
                                                        relative aspect-square flex items-center justify-center
                                                        text-sm font-medium rounded-sm transition-all duration-200
                                                        ${isSelected
                                                            ? "bg-accent text-white shadow-lg shadow-accent/20 scale-105"
                                                            : isToday
                                                                ? "bg-accent/10 text-accent font-bold ring-1 ring-accent/30"
                                                                : disabled
                                                                    ? "text-foreground/15 cursor-not-allowed"
                                                                    : "text-foreground/70 hover:bg-accent/8 hover:text-accent cursor-pointer"
                                                        }
                                                    `}
                                                >
                                                    {day}
                                                    {isToday && !isSelected && (
                                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent rounded-full" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex items-center justify-center gap-6 mt-8 text-xs uppercase tracking-widest text-foreground/30">
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-sm bg-accent/10 ring-1 ring-accent/30" />
                                            Today
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-sm bg-accent" />
                                            Selected
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-3 h-3 rounded-sm bg-foreground/5" />
                                            Unavailable
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ─── STEP 2: Time Slots ─── */}
                            {step === "time" && (
                                <motion.div
                                    key="time"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.35 }}
                                    className="p-8 md:p-12"
                                >
                                    <button
                                        onClick={() => setStep("date")}
                                        className="flex items-center gap-2 text-foreground/40 hover:text-accent text-xs uppercase tracking-widest mb-8 transition-colors"
                                    >
                                        <ArrowLeft size={14} />
                                        Change date
                                    </button>

                                    <p className="text-center text-foreground/40 text-xs uppercase tracking-[0.3em] font-bold mb-2">
                                        Available Times
                                    </p>
                                    <p className="text-center text-xl font-heading mb-10">
                                        {formatSelectedDate()}
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto">
                                        {TIME_SLOTS.map((slot) => {
                                            const isBooked = bookedSlots.includes(slot);
                                            const isActive = selectedTime === slot;
                                            return (
                                                <button
                                                    key={slot}
                                                    onClick={() => !isBooked && handleTimeSelect(slot)}
                                                    disabled={isBooked}
                                                    className={`
                                                        py-4 px-3 rounded-sm text-sm font-medium transition-all duration-200 border
                                                        ${isActive
                                                            ? "bg-accent text-white border-accent shadow-lg shadow-accent/20"
                                                            : isBooked
                                                                ? "bg-foreground/[0.02] text-foreground/15 border-foreground/5 cursor-not-allowed line-through"
                                                                : "bg-white text-foreground/60 border-foreground/10 hover:border-accent hover:text-accent hover:shadow-md cursor-pointer"
                                                        }
                                                    `}
                                                >
                                                    {slot}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <p className="text-center text-foreground/60 text-xs mt-6 italic">
                                        All times are in Central Africa Time (CAT)
                                    </p>
                                </motion.div>
                            )}

                            {/* ─── STEP 3: Details + Pay ─── */}
                            {step === "details" && (
                                <motion.div
                                    key="details"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.35 }}
                                    className="p-8 md:p-12"
                                >
                                    <button
                                        onClick={() => setStep("time")}
                                        className="flex items-center gap-2 text-foreground/40 hover:text-accent text-xs uppercase tracking-widest mb-8 transition-colors"
                                    >
                                        <ArrowLeft size={14} />
                                        Change time
                                    </button>

                                    <div className="flex flex-col items-center mb-10">
                                        <p className="text-foreground/40 text-xs uppercase tracking-[0.3em] font-bold mb-3">
                                            Your Appointment
                                        </p>
                                        <div className="flex items-center gap-4 bg-accent/5 px-6 py-3 rounded-full">
                                            <Calendar size={16} className="text-accent" />
                                            <span className="text-sm font-medium">{formatSelectedDate()}</span>
                                            <span className="text-foreground/20">|</span>
                                            <Clock size={16} className="text-accent" />
                                            <span className="text-sm font-medium">{selectedTime}</span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-5">
                                        {/* Name */}
                                        <div className="relative">
                                            <User
                                                size={16}
                                                className={`absolute left-4 top-1/2 -translate-y-1/2 ${nameError ? "text-red-400" : "text-foreground/25"}`}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Full Name (first and last)"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className={`w-full pl-12 pr-4 py-4 bg-white border rounded-sm text-sm text-neutral-800 font-body placeholder:text-foreground/30 focus:outline-none transition-all ${nameError ? "border-red-400 focus:border-red-400" : "border-foreground/10 focus:border-accent"}`}
                                            />
                                            {nameError && (
                                                <p className="mt-1.5 text-xs text-red-500">{nameError}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/25" />
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-white border border-foreground/10 rounded-sm text-sm text-neutral-800 font-body placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-all"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/25" />
                                            <input
                                                type="tel"
                                                placeholder="Phone Number (optional)"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-white border border-foreground/10 rounded-sm text-sm text-neutral-800 font-body placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-all"
                                            />
                                        </div>

                                        {/* Consultation Type */}
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-foreground/40 font-bold mb-3">
                                                Consultation Type
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {([
                                                    { value: "walk-in", label: "Walk-in", sub: "In-person at the studio", Icon: MapPin },
                                                    { value: "online",  label: "Online",  sub: "Virtual via video call",   Icon: Video  },
                                                ] as const).map(({ value, label, sub, Icon }) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, consultationType: value })}
                                                        className={`flex flex-col items-center gap-2 py-5 px-4 border rounded-sm transition-all ${
                                                            formData.consultationType === value
                                                                ? "bg-accent text-white border-accent shadow-lg shadow-accent/20"
                                                                : "bg-white text-foreground/60 border-foreground/10 hover:border-accent hover:text-accent"
                                                        }`}
                                                    >
                                                        <Icon size={22} />
                                                        <span className="text-xs font-bold tracking-wider uppercase">{label}</span>
                                                        <span className={`text-xs leading-tight text-center ${formData.consultationType === value ? "opacity-70" : "opacity-50"}`}>{sub}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Project Type */}
                                        <div className="relative">
                                            <Sparkles size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/25" />
                                            <select
                                                required
                                                value={formData.projectType}
                                                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-white border border-foreground/10 rounded-sm text-sm font-body text-neutral-800 focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Project Type</option>
                                                <option value="residential">Residential Design</option>
                                                <option value="commercial">Commercial / Hospitality</option>
                                                <option value="renovation">Renovation / Remodel</option>
                                                <option value="consultation">Design Consultation Only</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        {/* Message */}
                                        <div className="relative">
                                            <MessageSquare size={16} className="absolute left-4 top-4 text-foreground/25" />
                                            <textarea
                                                placeholder="Tell us briefly about your space and vision..."
                                                rows={4}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-white border border-foreground/10 rounded-sm text-sm text-neutral-800 font-body placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-all resize-none"
                                            />
                                        </div>

                                        {/* Currency */}
                                        <div>
                                            <p className="text-xs uppercase tracking-widest text-foreground/40 font-bold mb-3">
                                                Consultation Fee
                                            </p>
                                            <div className="flex rounded-sm overflow-hidden border border-foreground/10">
                                                {CURRENCIES.map((c) => (
                                                    <button
                                                        key={c.code}
                                                        type="button"
                                                        onClick={() => setCurrency(c)}
                                                        className={`flex-1 py-3 text-xs font-bold tracking-wider transition-all ${
                                                            currency.code === c.code
                                                                ? "bg-accent text-white"
                                                                : "bg-white text-foreground/40 hover:bg-accent/5 hover:text-accent"
                                                        }`}
                                                    >
                                                        {c.code}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="mt-3 flex items-baseline justify-center gap-2">
                                                <span className="text-3xl font-heading text-foreground">
                                                    {currency.symbol}{currency.amount.toLocaleString()}
                                                </span>
                                                <span className="text-foreground/40 text-sm font-body">
                                                    {currency.name}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Submit → redirect to DPO */}
                                        <motion.button
                                            type="submit"
                                            disabled={isSubmitting}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full bg-accent text-white py-5 rounded-full text-xs font-bold tracking-[0.3em] uppercase flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-accent/20 transition-shadow disabled:opacity-70 disabled:cursor-wait"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <motion.span
                                                        animate={{ rotate: 360 }}
                                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                        className="inline-block"
                                                    >
                                                        ⏳
                                                    </motion.span>
                                                    Redirecting to checkout...
                                                </>
                                            ) : (
                                                <>
                                                    Pay {currency.symbol}{currency.amount.toLocaleString()} &amp; Confirm
                                                    <ArrowRight size={16} />
                                                </>
                                            )}
                                        </motion.button>

                                        <p className="text-center text-foreground/40 text-xs mt-2">
                                            You&apos;ll be taken to DPO Pay&apos;s secure checkout. Your slot is reserved once payment is complete.
                                        </p>
                                    </form>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="p-12 bg-foreground text-white text-center">
                        <p className="text-sm opacity-60 uppercase tracking-widest mb-4 font-bold">
                            What&apos;s Next?
                        </p>
                        <p className="max-w-md mx-auto italic text-lg opacity-90 leading-relaxed font-body">
                            &ldquo;After payment, you&apos;ll receive a confirmation email with your calendar invite.&rdquo;
                        </p>
                    </div>
                </div>

                {/* FAQ Section */}
                <section className="w-full mt-32 max-w-4xl mx-auto px-4 md:px-0">
                    <header className="text-center mb-16">
                        <span className="text-accent text-xs font-bold uppercase tracking-[0.4em] mb-4 block">Common Queries</span>
                        <h2 className="text-3xl md:text-5xl font-heading tracking-wide">Frequently Asked <span className="italic font-light">Questions</span></h2>
                    </header>
                    <div className="space-y-4">
                        {[
                            {
                                q: "What happens after I book?",
                                a: "You'll receive an instant confirmation email with a calendar invite and a meeting link. I'll personally review your project notes before our call so we can jump straight into the details and make the most of our time together."
                            },
                            {
                                q: "How long is the consultation?",
                                a: "Discovery calls are 30 minutes. It's the perfect amount of time to understand your needs, discuss your vision, and see if our creative philosophies align—all without any pressure or commitment."
                            },
                            {
                                q: "Do you work with clients outside your city?",
                                a: "Yes, absolutely. While I am based in Lusaka, I work with clients across Zambia and internationally through our remote design packages and virtual consultations. Distance is never a barrier to good design."
                            },
                            {
                                q: "What should I prepare before the call?",
                                a: "You don't need a formal presentation. Just have a rough idea of your goals, any inspiration photos (Pinterest boards are great!), and a general sense of your timeline. This helps us have a productive and focused conversation."
                            }
                        ].map((faq, index) => (
                            <FAQItem key={index} question={faq.q} answer={faq.a} />
                        ))}
                    </div>
                </section>

                {/* Email fallback */}
                <div className="mt-24 text-center opacity-40 hover:opacity-100 transition-opacity">
                    <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-3 justify-center mb-6">
                        <Mail size={16} /> or reach out directly:{" "}
                        <a href={`mailto:${siteSettings?.email}`} className="text-accent hover:underline">
                            {siteSettings?.email}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border-b border-foreground/5 overflow-hidden"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-8 flex items-center justify-between text-left group"
            >
                <h4 className={`text-lg md:text-xl font-body transition-colors duration-300 ${isOpen ? "text-accent" : "text-foreground/80 group-hover:text-foreground"}`}>
                    {question}
                </h4>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-shrink-0 ml-4"
                >
                    <ChevronDown size={20} className={isOpen ? "text-accent" : "text-foreground/30"} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="pb-10 text-foreground/60 leading-relaxed font-body max-w-2xl">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BookingClient;
