import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupForm() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Don't have an account? Create one now!</CardDescription>
            </CardHeader>

            <CardContent>
                <form>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="abc@example.com"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="********"
                            required
                        />
                    </div>
                </form>
            </CardContent>

            <CardFooter>
                <Button type="submit">Sign Up</Button>
                <div>
                    Already have an account?{" "}
                    <Button variant="link">Login</Button>
                </div>
            </CardFooter>
        </Card>
    )
};