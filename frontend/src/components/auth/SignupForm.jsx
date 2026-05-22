import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSignup } from "@/hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SignupForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { handleSignup, isLoading } = useSignup();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate confirm password ở frontend trước khi gọi Cognito
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        const success = await handleSignup(email, password);

        // Sau khi signup thành công → sang trang confirm, mang email theo
        if (success) {
            navigate("/confirm", { state: { email } });
        }
    };

    return (
        <Card className="w-full max-w-sm border border-white/80 bg-white/30 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(99,102,241,0.10),0_1.5px_0_rgba(255,255,255,0.90)_inset]">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
                    Create account
                </CardTitle>
                <CardDescription>
                    Join us and start managing your tasks.
                </CardDescription>
            </CardHeader>

            <CardContent>
                {/* onSubmit nằm trên form, không phải button */}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="abc@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Button nằm trong form, type="submit", không cần onSubmit */}
                    <Button
                        type="submit"
                        className="w-full font-bold"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing up..." : "Sign up"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Button
                        variant="link"
                        className="p-0 h-auto ml-1 font-bold"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}