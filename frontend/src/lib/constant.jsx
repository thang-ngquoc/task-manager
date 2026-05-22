export const triggerCls = `
    h-[38px] px-3 rounded-xl border border-white/75 bg-white/55 backdrop-blur-xl
    text-sm font-semibold text-purple-700 gap-1.5
    hover:bg-white/75 transition-colors
    data-[state=open]:bg-purple-500/10 data-[state=open]:border-purple-500/30
`;

export const activeCls = "bg-purple-500/10 border-purple-500/30";

export const controlWidth = "min-h-[35px] h-[35px]";

export const PRIORITIES = [
    { value: "all",    label: "All Priority", dot: "bg-purple-300" },
    { value: "high",   label: "High",         dot: "bg-danger" },
    { value: "medium", label: "Medium",        dot: "bg-amber-400" },
    { value: "low",    label: "Low",           dot: "bg-success" },
];

export const PRIORITY_STYLES = {
    high:   { pill: "bg-pink-50 text-pink-800",   ring: "border-danger shadow-[0_0_0_3px_rgba(228,91,138,0.12)]"   },
    medium: { pill: "bg-amber-50 text-amber-800",  ring: "border-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.12)]" },
    low:    { pill: "bg-green-50 text-green-800",  ring: "border-success shadow-[0_0_0_3px_rgba(107,196,166,0.12)]"  },
};


export const priorityStyles = {
    high:   "bg-pink-50   text-pink-800",
    medium: "bg-amber-50  text-amber-800",
    low:    "bg-green-50  text-green-800",
};

export const statusStyles = {
    pending:     "bg-purple-50 text-purple-700",
    in_progress: "bg-blue-50   text-blue-700",
    completed:   "bg-teal-50   text-teal-700",
};

export const statusLabel = {
    pending:     "Pending",
    in_progress: "In Progress",
    completed:   "Done",
};