import SignupForm from "@/components/auth/SignupForm";
import AuthLayout from "@/layouts/AuthLayout";

export default function SignupPage() {
    return (
        <AuthLayout>
            <SignupForm />
        </AuthLayout>
    );
}