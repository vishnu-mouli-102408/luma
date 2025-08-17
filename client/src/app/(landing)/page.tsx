import CTA from "@/components/landing/cta";
import Features from "@/components/landing/features";
import HeroSection from "@/components/landing/hero";
import HowItWorks from "@/components/landing/how-it-works";

export default function Home() {
	return (
		<div className="pt-16">
			<HeroSection />
			<HowItWorks />
			<Features />
			<CTA />
		</div>
	);
}
