import Footer from "@/components/landing/footer";
import Header from "@/components/landing/header";
import { type ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
	return (
		<>
			<Header />
			{children}
			<Footer />
		</>
	);
};

export default layout;
