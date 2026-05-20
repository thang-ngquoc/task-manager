import { useState } from "react";
import { X, CalendarDays, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { PRIORITIES, PRIORITY_STYLES, triggerCls, activeCls } from "@/components/constant";


export default function TaskForm({ open, onOpenChange, onSubmit, initialValues = {}, mode = "create" }) {
    const isEdit = mode === "edit";

    const [title,       setTitle]       = useState(initialValues.title       ?? "");
    const [description, setDescription] = useState(initialValues.description ?? "");
    const [priority,    setPriority]    = useState(initialValues.priority    ?? "");
    const [date,        setDate]        = useState(
        initialValues.dueDate ? new Date(initialValues.dueDate) : null
    );

    function handleSubmit() {
        if (!title.trim()) return;
        onSubmit?.({ title, description, priority, dueDate: date ? format(date, "yyyy-MM-dd") : "" });
        onOpenChange(false);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="glass-strong border-white/85 rounded-3xl p-0 gap-0
                           shadow-[0_16px_48px_rgba(99,102,241,0.16)] max-w-[440px]
                           [&>button]:hidden"> 

                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-0 flex flex-row items-start justify-between space-y-0">
                    <div>
                        <DialogTitle className="text-[17px] font-extrabold text-foreground">
                            {isEdit ? "Edit task" : "Create task"}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            {isEdit ? "Update task details" : "Add a new task to your workflow"}
                        </DialogDescription>
                    </div>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-[30px] h-[30px] rounded-[9px] border border-white/75 bg-white/50
                                   flex items-center justify-center text-muted-foreground
                                   hover:bg-white/75 transition-colors flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </DialogHeader>

                {/* Body */}
                <div className="px-6 pt-5 pb-2 flex flex-col gap-4">

                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11.5px] font-bold text-purple-700 tracking-wide">
                            Title
                        </Label>
                        <Input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Design onboarding flow"
                            className="glass border-white/75 rounded-xl text-sm
                                       placeholder:text-text-subtle focus:border-accent/60
                                       focus:shadow-[0_0_0_3px_rgba(160,123,229,0.10)]"
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11.5px] font-bold text-purple-700 tracking-wide">
                            Description
                        </Label>
                        <Textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Add more context about this task…"
                            rows={3}
                            className="glass border-white/75 rounded-xl text-sm resize-none
                                       placeholder:text-text-subtle focus:border-accent/60
                                       focus:shadow-[0_0_0_3px_rgba(160,123,229,0.10)]"
                        />
                    </div>

                    <div className="h-px bg-purple-300/15" />

                    {/* Priority — segmented toggle */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11.5px] font-bold text-purple-700 tracking-wide">
                            Priority
                        </Label>
                        <div className="flex gap-1.5">
                            {PRIORITIES.filter(p => p.value !== "all").map(({ value, label, dot }) => {
                                const sel = priority === value;
                                return (
                                    <button
                                        key={value}
                                        onClick={() => setPriority(sel ? "" : value)}
                                        className={[
                                            "flex-1 h-[34px] rounded-[10px] border-[1.5px]",
                                            "flex items-center justify-center gap-1.5",
                                            "text-[12px] font-bold transition-all",
                                            PRIORITY_STYLES[value].pill,
                                            sel ? PRIORITY_STYLES[value].ring : "border-transparent",
                                        ].join(" ")}>
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Due date */}
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11.5px] font-bold text-purple-700 tracking-wide">
                            Due date
                        </Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`${triggerCls} ${date ? activeCls : ""}`}>
                                    <CalendarDays className={`w-3.5 h-3.5 flex-shrink-0
                                                              ${date ? "text-purple-600" : "text-purple-300"}`} />
                                    <span className={`flex-1 text-left ${!date && "text-text-subtle font-normal"}`}>
                                        {date ? format(date, "MMM d, yyyy") : "Pick a due date"}
                                    </span>
                                    {date
                                        ? <X
                                            className="w-3.5 h-3.5 text-muted-foreground hover:text-danger"
                                            onClick={e => { e.stopPropagation(); setDate(null); }}
                                          />
                                        : <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
                                    }
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                align="start"
                                className="w-auto p-0 glass-strong border-white/75 rounded-2xl
                                           shadow-[0_8px_32px_rgba(99,102,241,0.12)]">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    className="rounded-2xl"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-2 px-6 py-5">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 h-[38px] rounded-xl border-white/75 bg-white/50
                                   text-sm font-bold text-muted-foreground hover:bg-white/75">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!title.trim()}
                        className={[
                            "flex-1 h-[38px] rounded-xl text-sm font-bold",
                            isEdit
                                ? "bg-success hover:bg-success/90 shadow-[0_4px_14px_rgba(15,110,86,0.22)]"
                                : "shadow-[0_4px_14px_rgba(124,58,237,0.28)]",
                        ].join(" ")}>
                        {isEdit ? "Save changes" : "Create task"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}