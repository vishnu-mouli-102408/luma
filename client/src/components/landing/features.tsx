import { Clock, MessageSquareHeart, Shield, Brain, TrendingUp, Heart } from "lucide-react";

const features = [
	{
		icon: <MessageSquareHeart className="h-6 w-6" />,
		title: "Empathetic AI Companion",
		desc: "Advanced AI that understands emotions and provides compassionate, personalized mental health support tailored to your unique needs.",
	},
	{
		icon: <Shield className="h-6 w-6" />,
		title: "Privacy & Security",
		desc: "End-to-end encryption ensures your conversations remain completely confidential and secure at all times.",
	},
	{
		icon: <Brain className="h-6 w-6" />,
		title: "Evidence-Based Therapy",
		desc: "Therapeutic techniques backed by clinical research including CBT, mindfulness, and emotional regulation strategies.",
	},
	{
		icon: <Clock className="h-6 w-6" />,
		title: "24/7 Availability",
		desc: "Access mental health support whenever you need it, day or night, without appointments or waiting times.",
	},
	{
		icon: <TrendingUp className="h-6 w-6" />,
		title: "Progress Tracking",
		desc: "Monitor your mental wellness journey with insights, mood tracking, and personalized progress reports.",
	},
	{
		icon: <Heart className="h-6 w-6" />,
		title: "Crisis Support",
		desc: "Immediate crisis intervention and emergency resources when you need urgent mental health assistance.",
	},
];

export default function Features() {
	return (
		<section className="relative py-14">
			<div className="mx-auto max-w-screen-xl px-4 md:px-8">
				<div className="relative mx-auto max-w-2xl sm:text-center">
					<div className="relative z-10">
						<h3 className="font-geist mt-4 text-3xl font-normal tracking-tighter sm:text-4xl md:text-5xl">
							Platform Features
						</h3>
						<p className="font-geist text-foreground/60 mt-3">
							Experience the future of mental wellness with our intelligent companion that combines advanced AI
							capabilities with industry-leading security to provide personalized, confidential support.
						</p>
					</div>
					<div
						className="absolute inset-0 mx-auto h-44 max-w-xs blur-[118px]"
						style={{
							background:
								"linear-gradient(152.92deg, rgba(192, 15, 102, 0.2) 4.54%, rgba(192, 11, 109, 0.26) 34.2%, rgba(192, 15, 102, 0.1) 77.55%)",
						}}
					></div>
				</div>
				<hr className="bg-foreground/30 mx-auto mt-5 h-px w-1/2" />
				<div className="relative mt-12">
					<ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{features.map((item, idx) => (
							<li
								key={idx}
								className="transform-gpu space-y-3 rounded-xl border bg-transparent p-4 [box-shadow:0_-20px_80px_-20px_#ff7aa42f_inset]"
							>
								<div className="text-primary w-fit transform-gpu rounded-full border p-4 [box-shadow:0_-20px_80px_-20px_#ff7aa43f_inset] dark:[box-shadow:0_-20px_80px_-20px_#ff7aa40f_inset]">
									{item.icon}
								</div>
								<h4 className="font-geist text-lg font-bold tracking-tighter">{item.title}</h4>
								<p className="text-gray-500">{item.desc}</p>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	);
}
