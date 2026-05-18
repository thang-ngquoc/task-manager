import SignupForm from "@/components/auth/SignupForm";
import AuthLayout from "@/components/layouts/AuthLayout";

export default function SignupPage() {
    return (
        <AuthLayout>
            <SignupForm />
        </AuthLayout>
    );
}