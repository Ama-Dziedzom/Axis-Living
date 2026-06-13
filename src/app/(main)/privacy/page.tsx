import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Axis Living",
    description: "How Axis Living collects, uses, and protects your personal information.",
};

const SECTIONS = [
    {
        title: "Who We Are",
        content: `Axis Living is a bespoke interior design studio based in Lusaka, Zambia. We operate the website axisliving.co.zm. When you book a consultation or subscribe to receive our lookbook, you are sharing information directly with us.

For any privacy-related questions, you can reach us at hello@axisliving.co.zm.`,
    },
    {
        title: "What Information We Collect",
        content: `When you book a consultation, we collect your name, email address, phone number, preferred date and time, project type, and any message you provide. If you pay a consultation fee, we also receive a payment reference number from our payment processor — we do not store your card or mobile money details directly.

When you subscribe to receive our lookbook, we collect your email address.`,
    },
    {
        title: "How We Use Your Information",
        content: `We use your booking details to confirm your consultation, send you a calendar invite, and follow up about your project. Your email address may be used to send you our design newsletter and occasional updates about our work — you can unsubscribe at any time by replying to any email we send.

We do not sell, rent, or trade your personal information to any third party.`,
    },
    {
        title: "Third-Party Services",
        content: `We use the following services to operate our business, each with their own privacy policies:

• Supabase — our database, used to store booking records securely (supabase.com/privacy)
• Resend — our email delivery service, used to send booking confirmations and newsletters (resend.com/legal/privacy-policy)
• Flutterwave — our payment processor, used to handle consultation fees (flutterwave.com/gb/privacy-policy)

These providers process only the data necessary to perform their service and are bound by their own data protection obligations.`,
    },
    {
        title: "Cookies & Local Storage",
        content: `Our website uses browser local storage to remember your cookie consent preference. This is a technical necessity to avoid showing you the consent notice on every visit — no tracking or advertising cookies are used.

If you add analytics or tracking tools in the future, this policy will be updated to reflect that.`,
    },
    {
        title: "Data Retention",
        content: `We retain booking records for as long as they are relevant to our business relationship with you. If you would like us to delete your information, please email us at hello@axisliving.co.zm and we will action your request within 14 days.`,
    },
    {
        title: "Your Rights",
        content: `You have the right to request a copy of the personal data we hold about you, ask us to correct inaccurate information, and ask us to delete your data. To exercise any of these rights, email us at hello@axisliving.co.zm.`,
    },
    {
        title: "Changes to This Policy",
        content: `We may update this policy from time to time. When we do, we will update the date at the bottom of this page. Continued use of our website after changes are posted means you accept the updated policy.`,
    },
];

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <section className="pt-40 pb-16 px-6 lg:px-24 border-b border-foreground/5">
                <div className="max-w-3xl mx-auto">
                    <span className="text-accent text-[10px] uppercase font-bold tracking-[0.4em] mb-4 block">
                        Legal
                    </span>
                    <h1 className="text-4xl md:text-6xl font-heading font-light leading-tight tracking-wide mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-foreground/50 text-sm font-body">
                        Last updated: June 2026
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-20 px-6 lg:px-24">
                <div className="max-w-3xl mx-auto space-y-14">
                    {SECTIONS.map((section) => (
                        <div key={section.title}>
                            <h2 className="text-xl font-heading font-light tracking-wide mb-4 text-foreground">
                                {section.title}
                            </h2>
                            <div className="text-foreground/65 font-body text-base leading-relaxed whitespace-pre-line">
                                {section.content}
                            </div>
                        </div>
                    ))}

                    <div className="pt-10 border-t border-foreground/5">
                        <p className="text-foreground/40 text-sm font-body">
                            Questions? Email us at{" "}
                            <a
                                href="mailto:hello@axisliving.co.zm"
                                className="text-accent underline underline-offset-4 hover:text-foreground transition-colors"
                            >
                                hello@axisliving.co.zm
                            </a>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
