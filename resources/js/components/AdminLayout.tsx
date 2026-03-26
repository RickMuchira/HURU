import { Link, usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

const NAV = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '▤' },
    { href: '/admin/users',     label: 'Users',      icon: '◎' },
    { href: '/admin/reports',   label: 'Reports',    icon: '⚑' },
    { href: '/admin/spaces',    label: 'Spaces',     icon: '◈' },
];

export default function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-huru-bg text-huru-text flex">
            {/* Sidebar */}
            <aside className="w-56 shrink-0 border-r border-white/5 flex flex-col">
                <div className="px-5 py-5 border-b border-white/5">
                    <Link href="/admin/dashboard" className="no-underline">
                        <span className="font-display italic text-xl text-huru-gold font-semibold">HURU</span>
                        <span className="text-stone-500 text-xs ml-2">admin</span>
                    </Link>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-0.5">
                    {NAV.map((item) => {
                        const active = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors no-underline ${
                                    active
                                        ? 'bg-huru-gold/10 text-huru-gold font-medium'
                                        : 'text-stone-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <span className="text-base leading-none">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-4 py-4 border-t border-white/5 space-y-2">
                    <Link
                        href="/home"
                        className="block text-xs text-stone-500 hover:text-stone-300 transition-colors no-underline"
                    >
                        ← Back to app
                    </Link>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="block text-xs text-stone-500 hover:text-red-400 transition-colors"
                    >
                        Sign out
                    </Link>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="border-b border-white/5 px-6 py-4">
                    <h1 className="font-display text-lg text-white">{title}</h1>
                </header>
                <main className="flex-1 px-6 py-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
