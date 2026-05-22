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
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { confirmRegistration, resendConfirmationCode } from "@/api/auth";
import { toast } from "sonner";

export default function ConfirmationForm() {
    const navigate = useNavigate();
    const location = useLocation();

    // Email được truyền từ RegisterForm qua navigate("/confirm", { state: { email } })
    const emailFromState = location.state?.email ?? "";

    const [code, setCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleConfirm = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await confirmRegistration(emailFromState, code);
            toast.success("Email confirmed! You can now sign in.");
            navigate("/login");
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        try {
            await resendConfirmationCode(emailFromState);
            toast.success("A new code has been sent to your email.");
        } catch (err) {
            toast.error(getErrorMessage(err));
        } finally {
            setIsResending(false);
        }
    };

    return (
        <Card className="w-full max-w-sm border border-white/80 bg-white/30 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(99,102,241,0.10),0_1.5px_0_rgba(255,255,255,0.90)_inset]">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
                    Verify your email
                </CardTitle>
                <CardDescription>
                    We sent a 6-digit code to{" "}
                    <span className="font-semibold text-foreground">{emailFromState}</span>
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form className="space-y-4" onSubmit={handleConfirm}>
                    <div className="space-y-2">
                        <Label htmlFor="code">Confirmation Code</Label>
                        <Input
                            id="code"
                            type="text"
                            inputMode="numeric"
                            placeholder="000000"
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                            disabled={isLoading}
                            maxLength={6}
                            className="tracking-[0.4em] text-center text-lg font-bold"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full font-bold"
                        disabled={isLoading || code.length !== 6}
                    >
                        {isLoading ? "Verifying..." : "Verify Email"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
                {/* Resend code */}
                <div className="text-center text-sm text-muted-foreground">
                    Didn't receive a code?{" "}
                    <Button
                        variant="link"
                        className="p-0 h-auto ml-1 font-bold"
                        onClick={handleResend}
                        disabled={isResending}
                    >
                        {isResending ? "Sending..." : "Resend"}
                    </Button>
                </div>

                {/* Wrong email → back to register */}
                <div className="text-center text-sm text-muted-foreground">
                    Wrong email?{" "}
                    <Button
                        variant="link"
                        className="p-0 h-auto ml-1 font-bold"
                        onClick={() => navigate("/signup")}
                    >
                        Go back
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

function getErrorMessage(err) {
    switch (err.name) {
        case "CodeMismatchException":
            return "Incorrect code. Please check your email and try again.";
        case "ExpiredCodeException":
            return "This code has expired. Please request a new one.";
        case "TooManyRequestsException":
            return "Too many attempts. Please wait a moment and try again.";
        case "LimitExceededException":
            return "Resend limit reached. Please wait before trying again.";
        default:
            return err.message || "Something went wrong. Please try again.";
    }
}