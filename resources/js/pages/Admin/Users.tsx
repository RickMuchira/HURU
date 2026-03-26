import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface AdminUser {
    id: number;
    username: string;
    display_name: string;
    pronouns: string | null;
    country: string | null;
    is_suspended: boolean;
    ghost_mode: boolean;
    onboarding_completed: boolean;
    intents: string[];
    created_at: string;
}

interface Meta { current_page: number; last_page: number; total: number }

const STATUS_FILTERS = [
    { value: '', label: 'All' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'ghost', label: 'Ghost mode' },
    { value: 'pending_delete', label: 'Pending deletion' },
];

export default function AdminUsers() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [actionMsg, setActionMsg] = useState<string | null>(null);

    useEffect(() => {
        load();
    }, [search, status, page]);

    async function load() {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/users', { params: { search, status, page } });
            setUsers(res.data.data);
            setMeta(res.data.meta);
        } finally {
            setLoading(false);
        }
    }

    async function suspend(user: AdminUser) {
        if (!confirm(`Suspend @${user.username}? This revokes all their sessions.`)) return;
        const res = await axios.put(`/api/admin/users/${user.id}/suspend`);
        flash(res.data.message);
        load();
    }

    async function unsuspend(user: AdminUser) {
        const res = await axios.put(`/api/admin/users/${user.id}/unsuspend`);
        flash(res.data.message);
        load();
    }

    async function revokeTokens(user: AdminUser) {
        if (!confirm(`Force log out all sessions for @${user.username}?`)) return;
        const res = await axios.delete(`/api/admin/users/${user.id}/tokens`);
        flash(res.data.message);
    }

    function flash(msg: string) {
        setActionMsg(msg);
        setTimeout(() => setActionMsg(null), 4000);
    }

    return (
        <>
            <Head title="Admin — Users" />
            <AdminLayout title="Users">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-5">
                    <input
                        className="huru-input max-w-xs"
                        placeholder="Search username, name or email…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    <div className="flex gap-1">
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => { setStatus(f.value); setPage(1); }}
                                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                    status === f.value
                                        ? 'bg-huru-gold/15 text-huru-gold border-huru-gold/30'
                                        : 'text-stone-400 border-white/10 hover:border-white/20 hover:text-white'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {actionMsg && (
                    <div className="mb-4 text-sm text-teal-300 bg-teal-500/10 border border-teal-500/20 rounded-xl px-4 py-2.5">
                        {actionMsg}
                    </div>
                )}

                {/* Table */}
                <div className="huru-card overflow-hidden">
                    {loading ? (
                        <div className="p-6 space-y-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-stone-400 text-sm">No users found.</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 text-left">
                                    <th className="px-4 py-3 text-stone-400 font-medium text-xs">Member</th>
                                    <th className="px-4 py-3 text-stone-400 font-medium text-xs hidden md:table-cell">Country</th>
                                    <th className="px-4 py-3 text-stone-400 font-medium text-xs hidden lg:table-cell">Joined</th>
                                    <th className="px-4 py-3 text-stone-400 font-medium text-xs">Status</th>
                                    <th className="px-4 py-3 text-stone-400 font-medium text-xs text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/2 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="text-white font-medium">{u.display_name}</p>
                                            <p className="text-stone-500 text-xs">@{u.username}</p>
                                        </td>
                                        <td className="px-4 py-3 text-stone-400 text-xs hidden md:table-cell">
                                            {u.country ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-stone-500 text-xs hidden lg:table-cell">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1">
                                                {u.is_suspended && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/25">
                                                        suspended
                                                    </span>
                                                )}
                                                {u.ghost_mode && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-stone-600/30 text-stone-400 border border-stone-600/30">
                                                        ghost
                                                    </span>
                                                )}
                                                {!u.is_suspended && !u.ghost_mode && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                                        active
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {u.is_suspended ? (
                                                    <button
                                                        onClick={() => unsuspend(u)}
                                                        className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                                                    >
                                                        Unsuspend
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => suspend(u)}
                                                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => revokeTokens(u)}
                                                    className="text-xs text-stone-400 hover:text-white transition-colors"
                                                >
                                                    Force logout
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-between mt-4 text-sm">
                        <p className="text-stone-400 text-xs">{meta.total} users total</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-stone-400 disabled:opacity-40 hover:border-white/20 hover:text-white transition-colors"
                            >
                                ← Prev
                            </button>
                            <span className="text-xs text-stone-400 px-2 py-1.5">
                                {page} / {meta.last_page}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                                disabled={page === meta.last_page}
                                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-stone-400 disabled:opacity-40 hover:border-white/20 hover:text-white transition-colors"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </AdminLayout>
        </>
    );
}
