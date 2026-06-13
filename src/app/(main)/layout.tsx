import Navbar from "@/components/Navigation/Navbar";
import Footer from "@/components/Navigation/Footer";
import LookbookPopup from "@/components/EmailCapture/LookbookPopup";
import CookieBanner from "@/components/CookieBanner";
import { fetchSiteSettings, fetchHomeData } from "@/lib/data";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    const [siteSettings, homeData] = await Promise.all([
        fetchSiteSettings(),
        fetchHomeData(),
    ]);

    return (
        <>
            <Navbar siteSettings={siteSettings} />
            <main>{children}</main>
            <Footer siteSettings={siteSettings} />
            <LookbookPopup data={homeData?.lookbookSection} />
            <CookieBanner />
        </>
    );
}
