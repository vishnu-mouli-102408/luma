import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<div className="font-sans text-red-700 text-5xl grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			hello world
			<Button>Upgrade Plan</Button>
		</div>
	);
}
