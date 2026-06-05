import { useState } from "react";
import { LogOut, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useLogout } from "@/hooks/useAuth";

export default function Header() {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const { handleLogout, isLoading } = useLogout();

    const handleLogoutClick = async () => {
        await handleLogout();
        setShowLogoutConfirm(false);
    };

    return (
        <>
        <header className="sticky top-0 z-40 w-full px-6 py-4">
            <div className="flex items-center justify-between gap-4
                            bg-white/30 backdrop-blur-2xl
                            border border-white/75
                            rounded-[20px]
                            shadow-[0_6px_24px_rgba(99,102,241,0.08),0_1.5px_0_rgba(255,255,255,0.90)_inset]
                            px-4 py-2.5">

                {/* Brand */}
                <div className="flex items-center gap-2.5 shrink-0">
                    <div className="w-[38px] h-[38px] rounded-xl bg-purple-500/10 
                                    text-purple-600 flex items-center justify-center">
                        <LayoutList className="w-[20px] h-[20px]" />
                    </div>

                    <div className="leading-tight">
                        <h1 className="text-[18px] font-extrabold text-foreground">Task Manager</h1>
                    </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                    {/* Logout */}
                    <Button className="flex items-center gap-1.5 bg-danger/8 border 
                                        border-danger/20 rounded-[10px] px-3 py-1.5 
                                        text-[12.5px] font-bold text-danger 
                                        hover:bg-danger/14 ransition-colors"
                            aria-label="Log out"
                            disabled={isLoading}
                            onClick={() => setShowLogoutConfirm(true)} >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Logout</span>
                    </Button>
                </div>
            </div>
        </header>

            {/* Logout confirmation dialog */}
            <ConfirmDialog
                open={showLogoutConfirm}
                onClose={() => setShowLogoutConfirm(false)}
                onConfirm={handleLogoutClick}
                title="Log Out"
                description="Are you sure you want to log out?"
                confirmText="Log Out"
                variant="danger"
                disabled={isLoading}
            />
        </>
    );
}
