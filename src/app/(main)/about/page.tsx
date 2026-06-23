import { Metadata } from "next";
import AboutClient from "./AboutClient";
import { fetchAboutData } from "@/lib/data";

export const metadata: Metadata = {
    title: "Our Story | NOA Living Studio - Bespoke Interiors",
    description: "Learn about the philosophy, the designer, and the 4-step process behind our studio's bespoke interior transformations in Lusaka, Zambia.",
};

export default async function AboutPage() {
    const aboutData = await fetchAboutData();
    return <AboutClient aboutData={aboutData} />;
}
