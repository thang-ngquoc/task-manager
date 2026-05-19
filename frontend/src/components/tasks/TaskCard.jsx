import { Check, Pencil, Trash2, CalendarDays, AlertCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const priorityStyles = {
    high:   "bg-pink-50   text-pink-800",
    medium: "bg-amber-50  text-amber-800",
    low:    "bg-green-50  text-green-800",
};

const statusStyles = {
    pending:     "bg-purple-50 text-purple-700",
    in_progress: "bg-blue-50   text-blue-700",
    completed:   "bg-teal-50   text-teal-700",
};

const statusLabel = {
    pending:     "Pending",
    in_progress: "In Progress",
    completed:   "Done",
};

export default function TaskCard({ task, onEdit, onDelete, onToggleDone }) {
    const done    = task.status === "completed";
    const overdue = !done && task.isOverdue;

    return (
        <Card className={[
            "glass border-white/75 rounded-[18px] overflow-hidden p-0 gap-0",
            "hover:shadow-[0_4px_24px_rgba(139,92,246,0.10)] transition-shadow",
            done    && "opacity-75",
            overdue && "border-danger/30",
        ].filter(Boolean).join(" ")}>

            {/* ── Top section ── */}
            <CardHeader className="flex flex-row items-start gap-3 px-4 pt-4 pb-3 space-y-0">
                {/* Title + description + badges */}
                <div className="flex-1 min-w-0">
                    <CardTitle className={[
                        "text-sm font-bold leading-snug",
                        done ? "line-through text-muted-foreground" : "text-foreground",
                    ].join(" ")}>
                        {task.title}
                    </CardTitle>

                    {task.description && (
                        <CardContent className="p-0 mt-1">
                            <p className={[
                                "text-[12.5px] leading-relaxed line-clamp-2",
                                done ? "text-text-subtle" : "text-muted-foreground",
                            ].join(" ")}>
                                {task.description}
                            </p>
                        </CardContent>
                    )}

                    {/* Badges */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full
                                          ${priorityStyles[task.priority]}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        <span className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full
                                          ${statusStyles[task.status]}`}>
                            {statusLabel[task.status]}
                        </span>
                    </div>
                </div>

                                    {/* Edit */}
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() => onEdit?.(task)}
                        aria-label="Edit task"
                        className="w-[28px] h-[28px] rounded-[8px] border-white/75 bg-white/50
                                   text-muted-foreground hover:bg-purple-500/8 hover:text-purple-700
                                   hover:border-purple-500/20">
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>

                    {/* Delete */}
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() => onDelete?.(task.id)}
                        aria-label="Delete task"
                        className="w-[28px] h-[28px] rounded-[8px] border-white/75 bg-white/50
                                   text-muted-foreground hover:bg-danger/10 hover:text-danger
                                   hover:border-danger/25">
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
            </CardHeader>

            {/* ── Footer ── */}
            <CardFooter className="flex items-center justify-between gap-3
                                   px-4 py-2.5 border-t border-white/60
                                   bg-white/25">

                {/* Due date */}
                <span className={`flex items-center gap-1.5 text-[11.5px]
                                  ${overdue ? "text-danger font-semibold" : "text-muted-foreground"}`}>
                    {overdue
                        ? <AlertCircle className="w-3 h-3" />
                        : <CalendarDays className="w-3 h-3" />}
                    {task.dueDate}
                    {overdue && " · Overdue"}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                    {/* Mark as done — only shown when not yet done */}
                    {!done && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onToggleDone?.(task.id)}
                            className="h-[30px] px-2.5 rounded-[9px] text-xs font-semibold gap-1.5
                                       border-white/75 bg-white/50 text-success
                                       hover:bg-success/15 hover:border-success/35">
                            <Check className="w-3 h-3" strokeWidth={2.5} />
                            Done
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}