import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Reusable confirm dialog.
 *
 * Props:
 *   open         boolean        — controlled open state
 *   onClose      () => void     — called when cancelled
 *   onConfirm    () => void     — called when confirmed
 *   title        string
 *   description  string
 *   confirmLabel string         — default "Confirm"
 *   confirmText  string         — alias for confirmLabel
 *   variant      "danger"|"default"
 *   disabled     boolean
 */
export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirm",
    confirmText,
    variant = "default",
    disabled = false,
}) {
    return (
        <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
            <AlertDialogContent className="glass-strong border-white/75 rounded-[20px]">
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-bold">{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel
                        className="rounded-[10px] border-white/75 bg-white/50"
                        onClick={onClose}>
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={disabled}
                        className={
                            variant === "danger"
                                ? "rounded-[10px] bg-danger/90 hover:bg-danger text-white"
                                : "rounded-[10px]"
                        }>
                        {confirmText || confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
