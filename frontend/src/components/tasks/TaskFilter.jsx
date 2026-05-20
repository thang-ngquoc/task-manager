import { useState } from "react";
import { CalendarDays, ChevronDown, X, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { PRIORITIES, triggerCls, activeCls, controlWidth } from "@/components/constant";

export default function TaskFilter({ onFilterChange, onNewTask }) {
    const [date, setDate]         = useState(null);
    const [priority, setPriority] = useState("");

    function handleDate(val) {
        setDate(val);
        onFilterChange?.({ dueDate: val ? format(val, "yyyy-MM-dd") : "" });
    }

    function handlePriority(val) {
        const v = val === "all" ? "" : val;
        setPriority(v);
        onFilterChange?.({ priority: v });
    }

    function handleReset() {
        setDate(null);
        setPriority("");
        onFilterChange?.({ dueDate: "", priority: "" });
    }

    const hasFilters  = !!date || !!priority;
    const activePriority = PRIORITIES.find(p => p.value === (priority || "all"));

    return (
        <div className="flex items-center justify-between gap-3">

            {/* ── Left: filters ── */}
            <div className="flex items-center gap-2">

                {/* Due date */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={`${triggerCls} ${controlWidth} ${date ? activeCls : ""}`}>
                            <CalendarDays className="w-3.5 h-3.5 text-purple-400" />
                            {date ? format(date, "MMM d, yyyy") : "Due date"}
                            <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        align="start"
                        className="w-auto p-0 glass-strong border-white/75 rounded-2xl
                                   shadow-[0_8px_32px_rgba(99,102,241,0.12)]">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleDate}
                            initialFocus
                            className="rounded-2xl"
                        />
                        {date && (
                            <div className="px-3 pb-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDate(null)}
                                    className="w-full text-xs text-muted-foreground
                                               hover:text-danger hover:bg-danger/8 rounded-xl gap-1">
                                    <X className="w-3 h-3" /> Clear date
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                {/* Separator */}
                <div className="w-px h-[22px] bg-purple-300/20 flex-shrink-0" />

                {/* Priority */}
                <Select value={priority || "all"} onValueChange={handlePriority}>
                    <SelectTrigger
                        className={`${triggerCls} ${controlWidth} flex items-center     
                                    justify-between min-w-[160px] 
                                    ${priority ? activeCls : ""}`}>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                        className="glass-strong border-white/75 rounded-2xl p-1.5 min-w-[160px]
                                   shadow-[0_8px_32px_rgba(99,102,241,0.12)]">
                        {PRIORITIES.map(({ value, label, dot }, i) => (
                            <>
                                {/* Divider after "All Priority" */}
                                {i === 1 && (
                                    <div key="div" className="h-px bg-purple-300/20 my-1 mx-1" />
                                )}
                                <SelectItem
                                    key={value}
                                    value={value}
                                    className="rounded-xl text-sm font-semibold text-purple-700
                                               focus:bg-purple-500/8 focus:text-purple-800
                                               cursor-pointer py-2">
                                    <span className="flex items-center gap-2.5">
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                                        {label}
                                    </span>
                                </SelectItem>
                            </>
                        ))}
                    </SelectContent>
                </Select>

                {/* Reset — only when filters active */}
                {hasFilters && (
                    <>
                        <div className="w-px h-[22px] bg-purple-300/20 flex-shrink-0" />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="h-[38px] px-3 rounded-xl text-xs font-bold text-danger
                                       border border-danger/20 hover:bg-danger/8
                                       hover:border-danger/30 gap-1.5">
                            <X className="w-3 h-3" />
                            Reset
                        </Button>
                    </>
                )}
            </div>

            {/* ── Right: New Task ── */}
            <Button
                onClick={onNewTask}
                className="flex items-center gap-2 h-[38px] rounded-xl 
                            px-5 font-bold border border-white/75
                            shadow-[0_4px_14px_rgba(124,58,237,0.30)]">
                <Plus className="w-4 h-4" />
                New Task
            </Button>
        </div>
    );
}