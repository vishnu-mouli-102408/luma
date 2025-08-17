export default function CTA() {
	return (
		<section id="contact" className="relative py-14 flex justify-center items-center">
			<div className="relative w-full max-w-4xl overflow-hidden rounded-[40px] bg-primary/70 p-6 sm:p-10 md:p-20">
				<div className="absolute inset-0 hidden h-full w-full overflow-hidden md:block">
					<div className="absolute top-1/2 right-[-45%] aspect-square h-[800px] w-[800px] -translate-y-1/2">
						<div className="absolute inset-0 rounded-full bg-primary/70 opacity-30"></div>
						<div className="absolute inset-0 scale-[0.8] rounded-full bg-primary/50 opacity-30"></div>
						<div className="absolute inset-0 scale-[0.6] rounded-full bg-primary/30 opacity-30"></div>
						<div className="absolute inset-0 scale-[0.4] rounded-full bg-primary/10 opacity-30"></div>
						<div className="absolute inset-0 scale-[0.2] rounded-full bg-primary/5 opacity-30"></div>
						<div className="absolute inset-0 scale-[0.1] rounded-full bg-white/50 opacity-30"></div>
					</div>
				</div>

				<div className="relative z-10">
					<h1 className="mb-3 text-3xl font-bold text-primary-foreground sm:text-4xl md:mb-4 md:text-5xl">
						Start Your Mental Wellness Journey
					</h1>
					<p className="mb-6 max-w-md text-base text-primary-foreground/90 sm:text-lg md:mb-8">
						Take the first step towards better mental health with your AI companion. Get personalized support that
						understands you.
					</p>

					<div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
						<a
							href="https://github.com/vishnu-mouli-102408/luma"
							target="_blank"
							rel="noopener noreferrer"
							className="flex w-full items-center justify-center gap-3 rounded-full bg-secondary px-6 py-3 text-secondary-foreground hover:bg-secondary/90 transition-all duration-200 hover:scale-105 sm:w-[240px]"
						>
							<svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path
									fillRule="evenodd"
									d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
									clipRule="evenodd"
								/>
							</svg>
							<span className="font-medium">GitHub</span>
						</a>
						<a
							href="mailto:vishnumouli0@gmail.com"
							className="flex w-full items-center justify-center gap-3 rounded-full bg-background px-6 py-3 text-foreground hover:bg-background/90 transition-all duration-200 hover:scale-105 sm:w-[240px]"
						>
							<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
								/>
							</svg>
							<span className="font-medium">Email Us</span>
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
