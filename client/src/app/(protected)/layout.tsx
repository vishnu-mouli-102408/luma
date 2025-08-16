import AuthWrapper from "@/components/global/auth-wrapper";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
	return <AuthWrapper>{children}</AuthWrapper>;
};

export default ProtectedLayout;
