import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
    return (
        <Card className="w-full max-w-sm border border-white/60 bg-white/30 backdrop-blur-2xl shadow-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 text-center">
                    Login
                </CardTitle>
                <CardDescription className="text-slate-600">
                    Welcome back! Please login to your account.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-800">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="abc@example.com" 
                            required 
                            className="bg-white/40 border-white/50 backdrop-blur-md shadow-sm placeholder:text-slate-400 focus-visible:bg-white/60 transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-slate-800">Password</Label>
                            <a href="#" className="text-sm font-medium text-primary hover:underline">
                                Forgot password?
                            </a>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            required
                            className="bg-white/40 border-white/50 backdrop-blur-md shadow-sm placeholder:text-slate-400 focus-visible:bg-white/60 transition-colors"
                        />
                    </div>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full shadow-md">
                    Login
                </Button>
                <div className="text-center text-sm text-slate-600">
                    Don't have an account?{" "}
                    <Button variant="link" className="p-0 h-auto font-semibold">
                        Register
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}