"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Sparkles,
    CreditCard,
    Lock,
    Smartphone,
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

// Simulate some "booked" slots per date (seeded by date)
function getBookedSlots(date: Date): string[] {
    const seed = date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
    const booked: string[] = [];
    TIME_SLOTS.forEach((slot, i) => {
        if ((seed * (i + 3)) % 7 === 0) booked.push(slot);
    });
    return booked;
}

// ───── Mobile Money Config ─────
const MOBILE_NETWORKS = [
    { code: "AIRTEL", label: "Airtel Money" },
    { code: "MTN",    label: "MTN MoMo"    },
    { code: "ZAMTEL", label: "Zamtel Kwacha" },
] as const;

type NetworkCode = typeof MOBILE_NETWORKS[number]["code"];

// ───── Types ─────
type BookingStep = "date" | "time" | "details" | "payment" | "confirmed";

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

    // Payment state — shared
    const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "card">("mobile_money");
    const [chargeId, setChargeId] = useState<string | null>(null);
    const [paymentReference, setPaymentReference] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<"idle" | "initiating" | "pending" | "failed">("idle");
    const pollCancelledRef = useRef(false);

    // Mobile money
    const [mobileNetwork, setMobileNetwork] = useState<NetworkCode>("AIRTEL");
    const [mobilePhone, setMobilePhone] = useState("");

    // Card
    const [cardNumber, setCardNumber] = useState("");
    const [cardName, setCardName] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [cardStep, setCardStep] = useState<"form" | "pin" | "otp" | "redirect" | "processing">("form");
    const [cardPinInput, setCardPinInput] = useState("");
    const [cardOtpInput, setCardOtpInput] = useState("");
    const [cardRedirectUrl, setCardRedirectUrl] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Calendar data
    const daysInMonth = useMemo(() => getDaysInMonth(currentYear, currentMonth), [currentYear, currentMonth]);
    const firstDay = useMemo(() => getFirstDayOfMonth(currentYear, currentMonth), [currentYear, currentMonth]);
    const bookedSlots = useMemo(
        () => (selectedDate ? getBookedSlots(selectedDate) : []),
        [selectedDate]
    );

    // Build calendar grid
    const calendarCells = useMemo(() => {
        const cells: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push(d);
        return cells;
    }, [firstDay, daysInMonth]);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.consultationType) return;

        const nameParts = formData.name.trim().split(/\s+/);
        const last = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];
        if (last.length < 2) {
            setNameError("Please enter your full name — first and last name.");
            return;
        }
        setNameError(null);

        setMobilePhone(formData.phone || "");
        setStep("payment");
    };

    const handlePaymentInitiate = async () => {
        if (!mobilePhone) return;
        setPaymentStatus("initiating");

        try {
            const res = await fetch('/api/payment/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: mobilePhone,
                    network: mobileNetwork,
                    amount: currency.amount,
                    currency: currency.code,
                }),
            });

            const result = await res.json();
            if (!result.success) throw new Error(result.message);

            setChargeId(result.chargeId);
            setPaymentReference(result.reference);
            setPaymentStatus("pending");
            pollForPayment(result.chargeId, result.reference);
        } catch (error) {
            console.error("Payment initiation error:", error);
            setPaymentStatus("failed");
        }
    };

    const pollForPayment = (cId: string, reference: string) => {
        pollCancelledRef.current = false;
        let attempts = 0;
        const maxAttempts = 24; // 2 minutes at 5s intervals

        const poll = async () => {
            if (pollCancelledRef.current) return;
            attempts++;
            try {
                const res = await fetch(`/api/payment/verify?charge_id=${cId}`);
                const result = await res.json();

                if (result.status === "succeeded") {
                    if (!pollCancelledRef.current) await confirmBooking(reference);
                    return;
                }

                if (result.status === "failed" || result.status === "voided") {
                    setPaymentStatus("failed");
                    return;
                }

                if (attempts < maxAttempts) {
                    setTimeout(poll, 5000);
                } else {
                    setPaymentStatus("failed");
                }
            } catch {
                if (attempts < maxAttempts) setTimeout(poll, 5000);
                else setPaymentStatus("failed");
            }
        };

        setTimeout(poll, 5000);
    };

    const formatCardNumber = (val: string) =>
        val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

    const formatExpiry = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 4);
        return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    };

    const handleCardPaymentInitiate = async () => {
        setPaymentStatus("initiating");
        setCardStep("processing");

        const [expiryMonth, expiryYear] = cardExpiry.split('/');

        try {
            const res = await fetch('/api/payment/card/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    cardNumber: cardNumber.replace(/\s/g, ''),
                    expiryMonth: expiryMonth?.trim(),
                    expiryYear: expiryYear?.trim(),
                    cvv: cardCvv,
                    amount: currency.amount,
                    currency: currency.code,
                }),
            });

            const result = await res.json();
            if (!result.success) throw new Error(result.message);

            setChargeId(result.chargeId);
            setPaymentReference(result.reference);
            handleCardNextAction(result.chargeId, result.reference, result.nextAction, result.status);
        } catch (error) {
            console.error('Card payment error:', error);
            setPaymentStatus("failed");
            setCardStep("form");
        }
    };

    const handleCardNextAction = (
        cId: string,
        reference: string,
        nextAction: { type: string; redirect_url?: { url: string } } | null,
        status: string,
    ) => {
        if (status === 'succeeded' || nextAction === null) {
            confirmBooking(reference);
            return;
        }

        switch (nextAction?.type) {
            case 'requires_pin':
                setCardStep("pin");
                setPaymentStatus("idle");
                break;
            case 'requires_otp':
                setCardStep("otp");
                setPaymentStatus("idle");
                break;
            case 'redirect_url':
                setCardRedirectUrl(nextAction.redirect_url?.url ?? null);
                setCardStep("redirect");
                setPaymentStatus("pending");
                pollForPayment(cId, reference);
                break;
            default:
                setPaymentStatus("failed");
                setCardStep("form");
        }
    };

    const handleCardAuthorize = async (type: 'pin' | 'otp') => {
        if (!chargeId || !paymentReference) return;
        setPaymentStatus("initiating");
        setCardStep("processing");

        try {
            const res = await fetch('/api/payment/card/authorize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chargeId,
                    type,
                    pin: type === 'pin' ? cardPinInput : undefined,
                    otp: type === 'otp' ? cardOtpInput : undefined,
                }),
            });

            const result = await res.json();
            if (!result.success) throw new Error(result.message);

            handleCardNextAction(chargeId, paymentReference, result.nextAction, result.status);
        } catch (error) {
            console.error('Card authorization error:', error);
            setPaymentStatus("failed");
            setCardStep("form");
        }
    };

    const confirmBooking = async (reference: string) => {
        pollCancelledRef.current = true;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    date: formatSelectedDate(),
                    time: selectedTime,
                    projectType: formData.projectType,
                    consultationType: formData.consultationType,
                    message: formData.message,
                    currency: currency.code,
                    amount: currency.amount,
                    paymentReference: reference,
                }),
            });
            const result = await res.json();
            if (result.success) setStep("confirmed");
            else setPaymentStatus("failed");
        } catch {
            setPaymentStatus("failed");
        } finally {
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
        setPaymentMethod("mobile_money");
        setMobilePhone("");
        setMobileNetwork("AIRTEL");
        setChargeId(null);
        setPaymentReference(null);
        setPaymentStatus("idle");
        setCardNumber("");
        setCardName("");
        setCardExpiry("");
        setCardCvv("");
        setCardStep("form");
        setCardPinInput("");
        setCardOtpInput("");
        setCardRedirectUrl(null);
    };



    const formatSelectedDate = () => {
        if (!selectedDate) return "";
        return `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
    };

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
                    {/* Widget header with progress */}
                    <div className="p-6 border-b border-white/10 bg-accent">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-white text-xs uppercase tracking-[0.3em] font-bold">
                                Secure Booking Portal
                            </span>
                            {step !== "confirmed" && (
                                <span className="text-white/70 text-xs uppercase tracking-[0.2em]">
                                    Step{" "}
                                    {step === "date" ? "1" : step === "time" ? "2" : step === "details" ? "3" : "4"} of 4
                                </span>
                            )}
                        </div>
                        {/* Progress bar */}
                        {step !== "confirmed" && (
                            <div className="w-full h-[2px] bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-white rounded-full"
                                    initial={{ width: "0%" }}
                                    animate={{
                                        width:
                                            step === "date"
                                                ? "25%"
                                                : step === "time"
                                                    ? "50%"
                                                    : step === "details"
                                                        ? "75%"
                                                        : "100%",
                                    }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                />
                            </div>
                        )}
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

                                    {/* Month Navigation */}
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

                                    {/* Day labels */}
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

                                    {/* Calendar grid */}
                                    <div className="grid grid-cols-7 gap-1 max-w-md mx-auto">
                                        {calendarCells.map((day, i) => {
                                            if (day === null) {
                                                return <div key={`empty-${i}`} />;
                                            }

                                            const past = isPast(currentYear, currentMonth, day);
                                            const weekend = isWeekend(currentYear, currentMonth, day);
                                            const disabled = past || weekend;
                                            const isToday = isSameDay(
                                                new Date(currentYear, currentMonth, day),
                                                today
                                            );
                                            const isSelected =
                                                selectedDate &&
                                                isSameDay(
                                                    new Date(currentYear, currentMonth, day),
                                                    selectedDate
                                                );

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

                                    {/* Legend */}
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

                            {/* ─── STEP 3: Contact Details Form ─── */}
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

                                    {/* Selected date/time summary */}
                                    <div className="flex flex-col items-center mb-10">
                                        <p className="text-foreground/40 text-xs uppercase tracking-[0.3em] font-bold mb-3">
                                            Your Appointment
                                        </p>
                                        <div className="flex items-center gap-4 bg-accent/5 px-6 py-3 rounded-full">
                                            <Calendar size={16} className="text-accent" />
                                            <span className="text-sm font-medium">
                                                {formatSelectedDate()}
                                            </span>
                                            <span className="text-foreground/20">|</span>
                                            <Clock size={16} className="text-accent" />
                                            <span className="text-sm font-medium">
                                                {selectedTime}
                                            </span>
                                        </div>
                                    </div>

                                    <form
                                        onSubmit={handleSubmit}
                                        className="max-w-lg mx-auto space-y-5"
                                    >
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
                                                onChange={(e) =>
                                                    setFormData({ ...formData, name: e.target.value })
                                                }
                                                className={`w-full pl-12 pr-4 py-4 bg-white border rounded-sm text-sm text-neutral-800 font-body placeholder:text-foreground/30 focus:outline-none transition-all ${nameError ? "border-red-400 focus:border-red-400" : "border-foreground/10 focus:border-accent"}`}
                                            />
                                            {nameError && (
                                                <p className="mt-1.5 text-xs text-red-500">{nameError}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="relative">
                                            <Mail
                                                size={16}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/25"
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                required
                                                value={formData.email}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, email: e.target.value })
                                                }
                                                className="w-full pl-12 pr-4 py-4 bg-white border border-foreground/10 rounded-sm text-sm text-neutral-800 font-body placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-all"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div className="relative">
                                            <Phone
                                                size={16}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/25"
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone Number (optional)"
                                                value={formData.phone}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, phone: e.target.value })
                                                }
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

                                        {/* Project type */}
                                        <div className="relative">
                                            <Sparkles
                                                size={16}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/25"
                                            />
                                            <select
                                                required
                                                value={formData.projectType}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        projectType: e.target.value,
                                                    })
                                                }
                                                className="w-full pl-12 pr-4 py-4 bg-white border border-foreground/10 rounded-sm text-sm font-body text-neutral-800 focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>
                                                    Project Type
                                                </option>
                                                <option value="residential">
                                                    Residential Design
                                                </option>
                                                <option value="commercial">
                                                    Commercial / Hospitality
                                                </option>
                                                <option value="renovation">
                                                    Renovation / Remodel
                                                </option>
                                                <option value="consultation">
                                                    Design Consultation Only
                                                </option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        {/* Message */}
                                        <div className="relative">
                                            <MessageSquare
                                                size={16}
                                                className="absolute left-4 top-4 text-foreground/25"
                                            />
                                            <textarea
                                                placeholder="Tell us briefly about your space and vision..."
                                                rows={4}
                                                value={formData.message}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        message: e.target.value,
                                                    })
                                                }
                                                className="w-full pl-12 pr-4 py-4 bg-white border border-foreground/10 rounded-sm text-sm text-neutral-800 font-body placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-all resize-none"
                                            />
                                        </div>

                                        {/* Consultation Fee */}
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

                                        {/* Submit */}
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
                                                        transition={{
                                                            repeat: Infinity,
                                                            duration: 1,
                                                            ease: "linear",
                                                        }}
                                                        className="inline-block"
                                                    >
                                                        ⏳
                                                    </motion.span>
                                                    Confirming your booking...
                                                </>
                                            ) : (
                                                <>
                                                    Pay {currency.symbol}{currency.amount.toLocaleString()} &amp; Confirm
                                                    <CreditCard size={16} />
                                                </>
                                            )}
                                        </motion.button>

                                        <p className="text-center text-foreground/40 text-xs mt-2">
                                            Secure payment via Flutterwave. Your slot is reserved once payment is complete.
                                        </p>
                                    </form>
                                </motion.div>
                            )}

                            {/* ─── STEP 4: Payment ─── */}
                            {step === "payment" && (
                                <motion.div
                                    key="payment"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.35 }}
                                    className="p-8 md:p-12"
                                >
                                    {/* ── Processing / Pending spinner ── */}
                                    {(paymentStatus === "initiating" || (paymentStatus === "pending" && cardStep === "redirect") || (paymentStatus === "pending" && paymentMethod === "mobile_money")) ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <motion.div
                                                animate={{ scale: [1, 1.15, 1] }}
                                                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                                                className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-8"
                                            >
                                                {paymentMethod === "mobile_money"
                                                    ? <Smartphone size={32} className="text-accent" />
                                                    : <CreditCard size={32} className="text-accent" />
                                                }
                                            </motion.div>
                                            <p className="text-foreground/40 text-xs uppercase tracking-[0.3em] font-bold mb-3">
                                                {paymentStatus === "initiating" ? "Processing..." : "Waiting for approval"}
                                            </p>
                                            <p className="text-xl font-heading mb-4">
                                                {paymentMethod === "mobile_money" ? "Check your phone" : cardStep === "redirect" ? "Complete bank verification" : "Processing your card..."}
                                            </p>
                                            {paymentMethod === "mobile_money" && paymentStatus === "pending" && (
                                                <p className="text-foreground/50 text-sm max-w-xs leading-relaxed mb-8">
                                                    A payment request of <strong>{currency.symbol}{currency.amount.toLocaleString()}</strong> has been sent to <strong>{mobilePhone}</strong> via {MOBILE_NETWORKS.find(n => n.code === mobileNetwork)?.label}. Enter your PIN to confirm.
                                                </p>
                                            )}
                                            {cardStep === "redirect" && cardRedirectUrl && (
                                                <div className="space-y-4 mb-8">
                                                    <p className="text-foreground/50 text-sm max-w-xs leading-relaxed">
                                                        Your bank requires additional verification. Complete it in the new tab, then return here.
                                                    </p>
                                                    <a
                                                        href={cardRedirectUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:shadow-lg transition-shadow"
                                                    >
                                                        Open Bank Page <ArrowRight size={14} />
                                                    </a>
                                                </div>
                                            )}
                                            <div className="flex gap-1 mb-8">
                                                {[0, 1, 2].map(i => (
                                                    <motion.span
                                                        key={i}
                                                        className="w-2 h-2 bg-accent rounded-full"
                                                        animate={{ opacity: [0.3, 1, 0.3] }}
                                                        transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                                                    />
                                                ))}
                                            </div>
                                            {process.env.NEXT_PUBLIC_FLUTTERWAVE_SANDBOX === 'true' && paymentReference && (
                                                <button
                                                    onClick={() => confirmBooking(paymentReference)}
                                                    className="text-xs uppercase tracking-widest text-foreground/30 border border-dashed border-foreground/20 px-4 py-2 rounded-full hover:text-accent hover:border-accent transition-colors"
                                                >
                                                    Simulate Success (Sandbox Only)
                                                </button>
                                            )}
                                        </div>

                                    ) : paymentStatus === "failed" ? (
                                        /* ── Failed ── */
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-8">
                                                <span className="text-3xl">✕</span>
                                            </div>
                                            <p className="text-xl font-heading mb-4">Payment failed</p>
                                            <p className="text-foreground/50 text-sm max-w-xs leading-relaxed mb-8">
                                                The payment was not completed. Please try again or use a different method.
                                            </p>
                                            <button
                                                onClick={() => { setPaymentStatus("idle"); setCardStep("form"); }}
                                                className="bg-accent text-white px-8 py-3 rounded-full text-xs font-bold tracking-[0.2em] uppercase hover:shadow-lg transition-shadow"
                                            >
                                                Try Again
                                            </button>
                                        </div>

                                    ) : cardStep === "pin" ? (
                                        /* ── PIN entry ── */
                                        <div className="flex flex-col items-center justify-center py-8 text-center max-w-sm mx-auto">
                                            <Lock size={32} className="text-accent mb-6" />
                                            <p className="text-foreground/40 text-xs uppercase tracking-[0.3em] font-bold mb-2">Card PIN Required</p>
                                            <p className="text-xl font-heading mb-8">Enter your card PIN</p>
                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                maxLength={6}
                                                placeholder="••••"
                                                value={cardPinInput}
                                                onChange={(e) => setCardPinInput(e.target.value.replace(/\D/g, ''))}
                                                className="w-full text-center text-2xl tracking-[0.5em] py-4 border border-foreground/10 rounded-sm focus:outline-none focus:border-accent mb-6"
                                            />
                                            <motion.button
                                                onClick={() => handleCardAuthorize('pin')}
                                                disabled={cardPinInput.length < 4}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full bg-accent text-white py-4 rounded-full text-xs font-bold tracking-[0.3em] uppercase disabled:opacity-50"
                                            >
                                                Confirm PIN
                                            </motion.button>
                                        </div>

                                    ) : cardStep === "otp" ? (
                                        /* ── OTP entry ── */
                                        <div className="flex flex-col items-center justify-center py-8 text-center max-w-sm mx-auto">
                                            <Mail size={32} className="text-accent mb-6" />
                                            <p className="text-foreground/40 text-xs uppercase tracking-[0.3em] font-bold mb-2">OTP Verification</p>
                                            <p className="text-xl font-heading mb-3">Enter the OTP sent to you</p>
                                            <p className="text-foreground/40 text-sm mb-8">Check your phone or email for a one-time code from your bank.</p>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={8}
                                                placeholder="123456"
                                                value={cardOtpInput}
                                                onChange={(e) => setCardOtpInput(e.target.value.replace(/\D/g, ''))}
                                                className="w-full text-center text-2xl tracking-[0.5em] py-4 border border-foreground/10 rounded-sm focus:outline-none focus:border-accent mb-6"
                                            />
                                            <motion.button
                                                onClick={() => handleCardAuthorize('otp')}
                                                disabled={cardOtpInput.length < 4}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="w-full bg-accent text-white py-4 rounded-full text-xs font-bold tracking-[0.3em] uppercase disabled:opacity-50"
                                            >
                                                Verify OTP
                                            </motion.button>
                                        </div>

                                    ) : (
                                        /* ── Idle: payment method selector + forms ── */
                                        <>
                                            <button
                                                onClick={() => { setStep("details"); setPaymentStatus("idle"); setCardStep("form"); }}
                                                className="flex items-center gap-2 text-foreground/40 hover:text-accent text-xs uppercase tracking-widest mb-8 transition-colors"
                                            >
                                                <ArrowLeft size={14} />
                                                Back to details
                                            </button>

                                            <p className="text-center text-foreground/40 text-xs uppercase tracking-[0.3em] font-bold mb-2">
                                                Payment
                                            </p>
                                            <p className="text-center text-3xl font-heading mb-8">
                                                {currency.symbol}{currency.amount.toLocaleString()} <span className="text-base font-body text-foreground/40">{currency.name}</span>
                                            </p>

                                            {/* Payment method toggle */}
                                            <div className="max-w-sm mx-auto mb-8">
                                                <div className="flex rounded-sm overflow-hidden border border-foreground/10">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPaymentMethod("mobile_money")}
                                                        disabled={currency.code !== "ZMW"}
                                                        className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold tracking-wider transition-all ${
                                                            paymentMethod === "mobile_money"
                                                                ? "bg-accent text-white"
                                                                : currency.code !== "ZMW"
                                                                    ? "bg-white text-foreground/20 cursor-not-allowed"
                                                                    : "bg-white text-foreground/40 hover:bg-accent/5 hover:text-accent"
                                                        }`}
                                                    >
                                                        <Smartphone size={14} /> Mobile Money
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPaymentMethod("card")}
                                                        className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold tracking-wider transition-all ${
                                                            paymentMethod === "card"
                                                                ? "bg-accent text-white"
                                                                : "bg-white text-foreground/40 hover:bg-accent/5 hover:text-accent"
                                                        }`}
                                                    >
                                                        <CreditCard size={14} /> Card
                                                    </button>
                                                </div>
                                                {currency.code !== "ZMW" && paymentMethod === "card" && (
                                                    <p className="text-center text-foreground/30 text-xs mt-2">
                                                        Mobile Money is only available for ZMW payments
                                                    </p>
                                                )}
                                            </div>

                                            {/* ── Mobile Money form ── */}
                                            {paymentMethod === "mobile_money" && (
                                                <div className="max-w-sm mx-auto space-y-5">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-widest text-foreground/40 font-bold mb-3">Network</p>
                                                        <div className="flex rounded-sm overflow-hidden border border-foreground/10">
                                                            {MOBILE_NETWORKS.map((n) => (
                                                                <button
                                                                    key={n.code}
                                                                    type="button"
                                                                    onClick={() => setMobileNetwork(n.code)}
                                                                    className={`flex-1 py-3 text-xs font-bold tracking-wider transition-all ${
                                                                        mobileNetwork === n.code
                                                                            ? "bg-accent text-white"
                                                                            : "bg-white text-foreground/40 hover:bg-accent/5 hover:text-accent"
                                                                    }`}
                                                                >
                                                                    {n.code}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <p className="text-center text-foreground/30 text-xs mt-2">
                                                            {MOBILE_NETWORKS.find(n => n.code === mobileNetwork)?.label}
                                                        </p>
                                                    </div>
                                                    <div className="relative">
                                                        <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/25" />
                                                        <input
                                                            type="tel"
                                                            placeholder="Mobile Money Number (e.g. 0971234567)"
                                                            value={mobilePhone}
                                                            onChange={(e) => setMobilePhone(e.target.value)}
                                                            className="w-full pl-12 pr-4 py-4 bg-white border border-foreground/10 rounded-sm text-sm text-neutral-800 font-body placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-all"
                                                        />
                                                    </div>
                                                    <motion.button
                                                        type="button"
                                                        onClick={handlePaymentInitiate}
                                                        disabled={!mobilePhone}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="w-full bg-accent text-white py-5 rounded-full text-xs font-bold tracking-[0.3em] uppercase flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-accent/20 transition-shadow disabled:opacity-60"
                                                    >
                                                        Pay {currency.symbol}{currency.amount.toLocaleString()}
                                                        <ArrowRight size={16} />
                                                    </motion.button>
                                                    <p className="text-center text-foreground/30 text-xs">
                                                        A payment prompt will be sent to your phone. Enter your PIN to confirm.
                                                    </p>
                                                </div>
                                            )}

                                            {/* ── Card form ── */}
                                            {paymentMethod === "card" && (
                                                <div className="max-w-sm mx-auto space-y-4">
                                                    {/* Card number */}
                                                    <div className="relative">
                                                        <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/25" />
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            placeholder="Card Number"
                                                            value={cardNumber}
                                                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                            className="w-full pl-12 pr-4 py-4 bg-white border border-foreground/10 rounded-sm text-sm text-neutral-800 font-body placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-all tracking-wider"
                                                        />
                                                    </div>
                                                    {/* Cardholder name */}
                                                    <div className="relative">
                                                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/25" />
                                                        <input
                                                            type="text"
                                                            placeholder="Cardholder Name"
                                                            value={cardName}
                                                            onChange={(e) => setCardName(e.target.value)}
                                                            className="w-full pl-12 pr-4 py-4 bg-white border border-foreground/10 rounded-sm text-sm text-neutral-800 font-body placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-all"
                                                        />
                                                    </div>
                                                    {/* Expiry + CVV */}
                                                    <div className="flex gap-4">
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                placeholder="MM/YY"
                                                                value={cardExpiry}
                                                                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                                                className="w-full px-4 py-4 bg-white border border-foreground/10 rounded-sm text-sm text-neutral-800 font-body placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-all text-center tracking-wider"
                                                            />
                                                        </div>
                                                        <div className="relative flex-1">
                                                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/25" />
                                                            <input
                                                                type="password"
                                                                inputMode="numeric"
                                                                placeholder="CVV"
                                                                maxLength={4}
                                                                value={cardCvv}
                                                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                                                className="w-full pl-9 pr-4 py-4 bg-white border border-foreground/10 rounded-sm text-sm text-neutral-800 font-body placeholder:text-foreground/30 focus:outline-none focus:border-accent transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                    <motion.button
                                                        type="button"
                                                        onClick={handleCardPaymentInitiate}
                                                        disabled={
                                                            cardNumber.replace(/\s/g, '').length < 16 ||
                                                            !cardName ||
                                                            cardExpiry.length < 5 ||
                                                            cardCvv.length < 3
                                                        }
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="w-full bg-accent text-white py-5 rounded-full text-xs font-bold tracking-[0.3em] uppercase flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-accent/20 transition-shadow disabled:opacity-50"
                                                    >
                                                        Pay {currency.symbol}{currency.amount.toLocaleString()}
                                                        <Lock size={14} />
                                                    </motion.button>
                                                    <p className="text-center text-foreground/30 text-xs flex items-center justify-center gap-1">
                                                        <Lock size={10} /> Encrypted &amp; secured by Flutterwave
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {/* ─── STEP 5: Confirmation ─── */}
                            {step === "confirmed" && (
                                <motion.div
                                    key="confirmed"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="p-12 md:p-20 flex flex-col items-center text-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            delay: 0.2,
                                        }}
                                        className="mb-8"
                                    >
                                        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center">
                                            <CheckCircle2
                                                size={40}
                                                className="text-accent"
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.h2
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-4xl md:text-5xl font-heading mb-6"
                                    >
                                        You&apos;re{" "}
                                        <span className="italic font-light">Booked!</span>
                                    </motion.h2>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="bg-background rounded-sm p-6 mb-8 inline-flex flex-col items-center gap-2"
                                    >
                                        <div className="flex items-center gap-3 text-sm">
                                            <Calendar size={16} className="text-accent" />
                                            <span className="font-medium">
                                                {formatSelectedDate()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Clock size={16} className="text-accent" />
                                            <span className="font-medium">{selectedTime}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm mt-1">
                                            <User size={16} className="text-accent" />
                                            <span className="font-medium">{formData.name}</span>
                                        </div>
                                        {formData.consultationType && (
                                            <div className="flex items-center gap-3 text-sm mt-1">
                                                {formData.consultationType === "walk-in" ? (
                                                    <MapPin size={16} className="text-accent" />
                                                ) : (
                                                    <Video size={16} className="text-accent" />
                                                )}
                                                <span className="font-medium capitalize">{formData.consultationType === "walk-in" ? "Walk-in (In-person)" : "Online (Video call)"}</span>
                                            </div>
                                        )}
                                    </motion.div>

                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                        className="max-w-md text-foreground/50 text-sm leading-relaxed mb-10"
                                    >
                                        Check your inbox at{" "}
                                        <span className="text-accent font-medium">
                                            {formData.email}
                                        </span>{" "}
                                        for a confirmation.{" "}
                                        {formData.consultationType === "online"
                                            ? "We’ll send over a meeting link — looking forward to hearing about your space!"
                                            : "We’ll see you at the studio — looking forward to meeting you!"
                                        }
                                    </motion.p>

                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1 }}
                                        onClick={handleReset}
                                        className="text-foreground/30 hover:text-accent text-xs uppercase tracking-widest transition-colors"
                                    >
                                        Book another consultation
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    {step !== "confirmed" && (
                        <div className="p-12 bg-foreground text-white text-center">
                            <p className="text-sm opacity-60 uppercase tracking-widest mb-4 font-bold">
                                What&apos;s Next?
                            </p>
                            <p className="max-w-md mx-auto italic text-lg opacity-90 leading-relaxed font-body">
                                &ldquo;You&apos;re booked! Check your inbox for your confirmation. We&apos;re looking
                                forward to your visit.&rdquo;
                            </p>
                        </div>
                    )}
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
                        <Mail size={16} /> or reach out directly: <a href={`mailto:${siteSettings?.email}`} className="text-accent hover:underline">{siteSettings?.email}</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
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
                <h4 className={`text-lg md:text-xl font-body transition-colors duration-300 ${isOpen ? 'text-accent' : 'text-foreground/80 group-hover:text-foreground'}`}>
                    {question}
                </h4>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-shrink-0 ml-4"
                >
                    <ChevronDown size={20} className={isOpen ? 'text-accent' : 'text-foreground/30'} />
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
