import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface Report {
    id: number;
    reason: string;
    description: string | null;
    status: 'pending' | 'reviewed' | 'resolved';
    created_at: string;
    reporter: { id: number; username: string; display_name: string } | null;
    reported_user: { id: number; username: string; display_name: string; is_suspended: boolean } | null;
}

interface Meta { current_page: number; last_page: number; total: number }

const STATUS_FILTERS = [
    { value: 'pending',  label: 'Pending',  color: 'text-amber-400' },
    { value: 'resolved', label: 'Resolved', color: 'text-teal-400' },
    { value: 'reviewed', label: 'Dismissed', color: 'text-stone-400' },
    { value: '',         label: 'All',       color: 'text-white' },
];

export default function AdminReports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [page, setPage] = useState(1);
    const [actionMsg, setActionMsg] = useState<string | null>(null);
    const [acting, setActing] = useState<number | null>(null);

    useEffect(() => {
        load();
    }, [statusFilter, page]);

    async function load() {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/reports', {
                params: { status: statusFilter || undefined, page },
            });
            setReports(res.data.data);
            setMeta(res.data.meta);
        } finally {
            setLoading(false);
        }
    }

    async function resolve(report: Report, action: 'warn' | 'suspend' | 'none') {
        setActing(report.id);
        try {
            const res = await axios.put(`/api/admin/reports/${report.id}/resolve`, { action });
            flash(res.data.message);
            load();
        } finally {
            setActing(null);
        }
    }

    async function dismiss(report: Report) {
        setActing(report.id);
        try {
            const res = await axios.put(`/api/admin/reports/${report.id}/dismiss`);
            flash(res.data.message);
            load();
        } finally {
            setActing(null);
        }
    }

    function flash(msg: string) {
        setActionMsg(msg);
        setTimeout(() => setActionMsg(null), 4000);
    }

    const statusBadge = (s: Report['status']) => {
        const map = {
            pending:  'bg-amber-500/15 text-amber-300 border-amber-500/25',
            resolved: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
            reviewed: 'bg-stone-600/20 text-stone-400 border-stone-600/25',
        };
        return map[s];
    };

    return (
        <>
            <Head title="Admin — Reports" />
            <AdminLayout title="Reports">
                {/* Filters */}
                <div className="flex gap-1 mb-5 flex-wrap">
                    {STATUS_FILTERS.map((f) => (
                        <button
                            key={f.value}
                            onClick={() => { setStatusFilter(f.value); setPage(1); }}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                statusFilter === f.value
                                    ? 'bg-huru-gold/15 text-huru-gold border-huru-gold/30'
                                    : 'text-stone-400 border-white/10 hover:border-white/20 hover:text-white'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {actionMsg && (
                    <div className="mb-4 text-sm text-teal-300 bg-teal-500/10 border border-teal-500/20 rounded-xl px-4 py-2.5">
                        {actionMsg}
                    </div>
                )}

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="huru-card p-5 h-28 animate-pulse" />
                        ))}
                    </div>
                ) : reports.length === 0 ? (
                    <div className="huru-card p-10 text-center text-stone-400 text-sm">
                        {statusFilter === 'pending' ? '🎉 No pending reports — all clear!' : 'No reports found.'}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reports.map((r) => (
                            <div key={r.id} className="huru-card p-4">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge(r.status)}`}>
                                                {r.status}
                                            </span>
                                            <span className="text-stone-400 text-xs font-medium">{r.reason}</span>
                                            <span className="text-stone-600 text-xs">
                                                {new Date(r.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {r.description && (
                                            <p className="text-stone-300 text-sm mt-2 leading-relaxed">{r.description}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Involved users */}
                                <div className="flex items-center gap-6 mb-3 text-xs">
                                    <div>
                                        <span className="text-stone-500">Reporter: </span>
                                        {r.reporter ? (
                                            <span className="text-stone-300">
                                                {r.reporter.display_name} <span className="text-stone-500">@{r.reporter.username}</span>
                                            </span>
                                        ) : (
                                            <span className="text-stone-600">deleted user</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-stone-500">Reported: </span>
                                        {r.reported_user ? (
                                            <span className={r.reported_user.is_suspended ? 'text-red-300' : 'text-stone-300'}>
                                                {r.reported_user.display_name}{' '}
                                                <span className="text-stone-500">@{r.reported_user.username}</span>
                                                {r.reported_user.is_suspended && (
                                                    <span className="ml-1 text-red-400">(suspended)</span>
                                                )}
                                            </span>
                                        ) : (
                                            <span className="text-stone-600">deleted user</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions (only for pending) */}
                                {r.status === 'pending' && (
                                    <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5">
                                        <button
                                            onClick={() => resolve(r, 'suspend')}
                                            disabled={acting === r.id || r.reported_user?.is_suspended}
                                            className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 border border-red-500/25 hover:bg-red-500/20 disabled:opacity-40 transition-colors"
                                        >
                                            Suspend user
                                        </button>
                                        <button
                                            onClick={() => resolve(r, 'warn')}
                                            disabled={acting === r.id}
                                            className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/25 hover:bg-amber-500/20 disabled:opacity-40 transition-colors"
                                        >
                                            Mark reviewed
                                        </button>
                                        <button
                                            onClick={() => dismiss(r)}
                                            disabled={acting === r.id}
                                            className="text-xs px-3 py-1.5 rounded-lg bg-stone-700/30 text-stone-400 border border-stone-600/20 hover:bg-stone-700/50 disabled:opacity-40 transition-colors"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-stone-400 text-xs">{meta.total} reports</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-stone-400 disabled:opacity-40 hover:border-white/20 transition-colors"
                            >
                                ← Prev
                            </button>
                            <span className="text-xs text-stone-400 px-2 py-1.5">{page} / {meta.last_page}</span>
                            <button
                                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                                disabled={page === meta.last_page}
                                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-stone-400 disabled:opacity-40 hover:border-white/20 transition-colors"
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
