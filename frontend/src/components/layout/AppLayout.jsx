import Header from '@/components/layout/Header'

export default function AppLayout({children}) {
    return (
        <div>
            <Header />
            <main>
                {children}
            </main>
        </div>
    );
}