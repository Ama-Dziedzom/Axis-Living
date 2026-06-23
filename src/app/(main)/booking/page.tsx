import { fetchSiteSettings } from "@/lib/data";
import BookingClient from "./BookingClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Book a Consultation | NOA Living Studio",
    description: "Ready to transform your space? Book a free discovery call to discuss your project.",
};

export default async function BookingPage() {
    const siteSettings = await fetchSiteSettings();
    return <BookingClient siteSettings={siteSettings} />;
}
