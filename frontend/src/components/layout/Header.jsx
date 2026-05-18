import { CheckCircle2, LogOut } from "lucide-react";
import { Button } from "../ui/button";

export default function Header() {
    return (
        <header>
            <div>
                <div>
                    <CheckCircle2 />
                    <div>
                        <h1>TaskFlow</h1>
                        <p>Task Manager</p>
                    </div>
                </div>

                <div>
                    <span>becho@example.com</span>

                    <Button variant="outline">
                        <LogOut /> Logout
                    </Button>
                </div>
            </div>
        </header>
    )
}