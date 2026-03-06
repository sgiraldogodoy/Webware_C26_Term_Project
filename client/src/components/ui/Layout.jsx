import Navbar from "../Navigation/Navbar";
import Page from "./Page";

export default function Layout({ role, title, children }) {
    return (
        <div className="min-h-full">
            <Navbar role={role} />

            {title && (
                <header className="bg-white shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
                    </div>
                </header>
            )}

            <Page>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </Page>
        </div>
    );
}