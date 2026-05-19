import Header from '@/components/layout/Header'

export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col relative">
            
            {/* Background */}
            <div className="fixed inset-0 
                            bg-[url('https://play.tailwindcss.com/img/grid.svg')] 
                            bg-center 
                            pointer-events-none
                            [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            {/* Shared container */}
            <div className="w-full max-w-5xl mx-auto flex flex-col flex-1 relative z-10">
                
                <Header />

                <main className="flex-1 px-6 py-6 flex flex-col gap-6">
                    {children}
                </main>

            </div>
        </div>
    )
}