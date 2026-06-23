import { Metadata } from "next";
import PortfolioClient from "./PortfolioClient";
import { fetchProjects } from "@/lib/data";

export const metadata: Metadata = {
    title: "Portfolio | NOA Living Studio - Bespoke Interiors",
    description: "Explore our collection of bespoke residential and commercial interior design projects. From minimalist retreats to luxury estates.",
};

export default async function PortfolioPage() {
    const projects = await fetchProjects();
    return <PortfolioClient initialProjects={projects} />;
}
