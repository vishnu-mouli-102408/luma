import DashboardHeader from "@/components/dashboard/header";
import DashboardMainContent from "@/components/dashboard/main-content";
import { Container } from "@/components/ui/container";

const DashboardPage = () => {
	return (
		<div className="min-h-screen bg-background">
			<Container className="space-y-6 pt-12 pb-8">
				<DashboardHeader />
				<DashboardMainContent />
			</Container>
		</div>
	);
};

export default DashboardPage;
