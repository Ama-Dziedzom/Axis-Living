/**
 * Static data fetchers with Sanity hooks (disabled for now).
 * 
 * Reverting to hardcoded/static data as requested.
 */

import { projects as staticProjects, getFeaturedProjects, getProjectBySlug, getRelatedProjects } from '../data/projects'
import { posts as staticPosts, getFeaturedPosts, getPostBySlug, getRelatedPosts } from '../data/journal'

// ───── Projects ─────

export async function fetchProjects() {
    return staticProjects;
}

export async function fetchFeaturedProjects() {
    return getFeaturedProjects();
}

export async function fetchProjectBySlug(slug: string) {
    return getProjectBySlug(slug);
}

export async function fetchRelatedProjects(currentSlug: string, limit = 2) {
    return getRelatedProjects(currentSlug);
}

// ───── Posts ─────

export async function fetchPosts() {
    return staticPosts;
}

export async function fetchFeaturedPosts() {
    return getFeaturedPosts();
}

export async function fetchPostBySlug(slug: string) {
    return getPostBySlug(slug);
}

export async function fetchRelatedPosts(currentSlug: string, limit = 2) {
    return getRelatedPosts(currentSlug);
}

// ───── Pricing ─────

export async function fetchPricing() {
    return [
        {
            title: "Interior Design Consultation",
            price: "Free",
            description: "A complimentary session to discuss your vision and project requirements.",
            inclusions: [
                "30-minute virtual or in-person meeting",
                "Discussion of your vision, lifestyle & aesthetic preferences",
                "Initial space assessment & recommendations",
                "Overview of our design process & timelines",
                "Custom proposal tailored to your project scope",
                "No obligation, just a conversation about your space",
            ]
        }
    ];
}

// ───── Testimonials ─────

export async function fetchTestimonials() {
    return [
        {
            quote: "Axis Living transformed our house into a home that truly reflects who we are. Their attention to detail and understanding of our lifestyle was exceptional.",
            clientName: "Sarah M.",
            location: "Leopard's Hill"
        },
        {
            quote: "Working with Ama and her team was a breeze. They handled everything from concept to installation with such professionalism and grace.",
            clientName: "David K.",
            location: "Roma Park"
        },
        {
            quote: "The result exceeded all our expectations. Our living space is now both functional and incredibly beautiful.",
            clientName: "Michelle T.",
            location: "New Kasama"
        }
    ];
}

// ───── Site Settings & Home Data ─────

export async function fetchHomeData() {
    return {
        tagline: "Spaces Designed for the Way You Live",
        heroImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80",
        aboutSection: {
            subtitle: "About Us",
            title: "A Lusaka-based studio for deliberate living.",
            body: "We believe that your home should be a reflection of your soul. Our approach combines functional design with timeless aesthetics to create spaces that feel both elevated and lived-in.",
            image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80",
            buttonText: "Learn Our Story"
        },
        projectsSection: {
            subtitle: "Selected Works",
            title: "The Portfolio",
            buttonText: "Explore All Projects"
        },
        lookbookSection: {
            subtitle: "Free Resource",
            title: "Get the Lookbook",
            body: "Download our curated guide to modern interior styles and start envisioning your dream space today.",
            buttonText: "Get Free Access"
        },
        testimonialsSection: {
            subtitle: "Client Stories",
            title: "Working with Axis Living was the best decision we made for our new home."
        },
        journalSection: {
            subtitle: "From the Studio",
            title: "Thoughts on design, process, and living well",
            buttonText: "Read All Articles"
        },
        preFooterSection: {
            subtitle: "Start Your Journey",
            title: "Let's Talk About Your Space.",
            body: "Begin your design journey with a consultation. Tell us about your vision, and we'll help you bring it to life.",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
            buttonText: "Book a Consultation"
        }
    };
}

export async function fetchSiteSettings() {
    return {
        studioName: "Axis Living",
        tagline: "Bespoke Interiors",
        email: "hello@axisliving.co.zm",
        phone: "+260 971 251 110",
        address: "Lusaka, Zambia",
        headerLogo: "/axis-living.png",
        footerLogo: "/axis-living.png",
        instagram: "https://instagram.com/axisliving.zm",
        pinterest: "https://pinterest.com/axisliving",
    };
}

export async function fetchAboutData() {
    return {
        heroImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80",
        headline: "Deliberate design for elevated living.",
        philosophy: {
            title: "Our Philosophy",
            body: "We believe in the power of intentionality. Every piece we select, every color we choose, and every layout we design is purposed to enhance the quality of your daily life."
        },
        bio: {
            title: "The Vision",
            body: "Founded on the principles of balance and beauty, Axis Living has grown into a studio known for its unique ability to blend contemporary luxury with African heritage.",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
        },
        studioImages: [
            "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&q=80",
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&q=80",
            "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1000&q=80"
        ],
        processes: [
            { step: "01", title: "Discovery", description: "Every project starts with a conversation to understand your needs, lifestyle, and aesthetic goals." },
            { step: "02", title: "Design Development", description: "We develop comprehensive design concepts, material palettes, and bespoke spatial layouts." },
            { step: "03", title: "Project Management", description: "Reviewing spatial details and technical documentation to ensure a seamless implementation." },
            { step: "04", title: "Installation", description: "The final reveal—bringing the design to life through meticulous styling and placement." }
        ],
        press: [
            { name: "Lusaka Times", url: "#" },
            { name: "Zambia Design Week", url: "#" }
        ]
    };
}
