export const triggerCls = `
    h-[38px] px-3 rounded-xl border border-white/75 bg-white/55 backdrop-blur-xl
    text-sm font-semibold text-purple-700 gap-1.5
    hover:bg-white/75 transition-colors
    data-[state=open]:bg-purple-500/10 data-[state=open]:border-purple-500/30
`;

export const activeCls = "bg-purple-500/10 border-purple-500/30";

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