export default function AuthLayout({ children }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4">
            
            {/* Lớp lưới nền (Pattern) giúp background bớt trống trải */}
            <div className="absolute inset-0 bg-[url('https://play.tailwindcss.com/img/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            {/* Blur circle top-left - Chuyển sang tone Indigo, to hơn và mờ hơn */}
            <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-indigo-500/20 blur-[120px]" />

            {/* Blur circle bottom-right - Chuyển sang tone Purple */}
            <div className="absolute -bottom-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-purple-500/20 blur-[120px]" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-md">
                {children}
            </div>
        </div>
    )
}