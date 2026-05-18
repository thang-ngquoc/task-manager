import LoginForm from "@/components/auth/LoginForm";
import AuthLayout from "@/components/layouts/AuthLayout";

export default function LoginPage() {
    return (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    );
}