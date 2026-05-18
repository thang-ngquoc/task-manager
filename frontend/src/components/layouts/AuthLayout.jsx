export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full ax-w-md bg-white rounded-2xl shadow-md p-8">
                {childen}
            </div>
        </div>
    )
}