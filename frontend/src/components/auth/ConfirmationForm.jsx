import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ConfirmationForm() {
  const navigate = useNavigate();

  function handleConfirm(e) {
    e.preventDefault();
  }

  function handleResend() {
    // No-op
  }

  return (
    <Card className="w-full max-w-sm border border-white/80 bg-white/30 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(99,102,241,0.10),0_1.5px_0_rgba(255,255,255,0.90)_inset]">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
          Verify your email
        </CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to your email
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
              disabled
              maxLength={6}
              className="tracking-[0.4em] text-center text-lg font-bold"
            />
          </div>

          <Button type="button" className="w-full font-bold" disabled>
            Verify Email
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <div className="text-center text-sm text-muted-foreground">
          <Button
            variant="link"
            className="p-0 h-auto ml-1 font-bold"
            onClick={handleResend}
          >
            Resend
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
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
