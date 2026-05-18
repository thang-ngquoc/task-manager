import { Button } from "@/components/ui/button"; 
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; 
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label"; 
 
export default function LoginForm() { 
    return ( 
        <Card className="w-full max-w-sm border border-white/80 bg-white/30 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(99,102,241,0.10),0_1.5px_0_rgba(255,255,255,0.90)_inset]"> 
            <CardHeader className="space-y-1 text-center"> 
                <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground"> 
                    Welcome back 
                </CardTitle> 
                <CardDescription> 
                    Sign in to continue your journey. 
                </CardDescription> 
            </CardHeader> 
 
            <CardContent> 
                <form className="space-y-4"> 
                    <div className="space-y-2"> 
                        <Label htmlFor="email">Email</Label> 
                        <Input  
                            id="email"  
                            type="email"  
                            placeholder="abc@example.com"  
                            required  
                        /> 
                    </div> 
 
                    <div className="space-y-2"> 
                        <div className="flex items-center justify-between"> 
                            <Label htmlFor="password">Password</Label> 
                            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"> 
                                Forgot password? 
                            </a> 
                        </div> 
                        <Input 
                            id="password" 
                            type="password" 
                            placeholder="••••••••" 
                            required 
                        /> 
                    </div> 
                </form> 
            </CardContent> 
 
            <CardFooter className="flex flex-col gap-4"> 
                <Button type="submit" className="w-full font-bold"> 
                    Sign in 
                </Button> 
                <div className="text-center text-sm text-muted-foreground"> 
                    Don't have an account?{" "} 
                    <Button variant="link" className="p-0 h-auto ml-1 font-bold"> 
                        Register 
                    </Button> 
                </div> 
            </CardFooter> 
        </Card> 
    ) 
}