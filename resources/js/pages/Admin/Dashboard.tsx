import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface Stats {
    users: {
        total: number;
        active: number;
        ghost: number;
        suspended: number;
        pending_delete: number;
        new_this_week: number;
    };
    spaces: { total: number; public: number };
    connections: number;
    reports: { total: number; pending: number };
}

function StatCard({ label, value, sub, accent = false }: { label: string; value: number | string; sub?: string; accent?: boolean }) {
    return (
        <div className="huru-card p-5">
            <p className="text-stone-400 text-xs font-medium uppercase tracking-wide mb-2">{label}</p>
            <p className={`font-display text-3xl font-semibold ${accent ? 'text-red-400' : 'text-white'}`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {sub && <p className="text-stone-500 text-xs mt-1">{sub}</p>}
        </div>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/admin/stats')
            .then((res) => setStats(res.data.data))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <Head title="Admin — Dashboard" />
            <AdminLayout title="Dashboard">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="huru-card p-5 h-24 animate-pulse" />
                        ))}
                    </div>
                ) : stats ? (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-3">Members</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                <StatCard label="Total" value={stats.users.total} />
                                <StatCard label="Active" value={stats.users.active} />
                                <StatCard label="New this week" value={stats.users.new_this_week} sub="last 7 days" />
                                <StatCard label="Ghost mode" value={stats.users.ghost} />
                                <StatCard label="Suspended" value={stats.users.suspended} accent={stats.users.suspended > 0} />
                                <StatCard label="Pending deletion" value={stats.users.pending_delete} accent={stats.users.pending_delete > 0} />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-3">Platform</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <StatCard label="Spaces" value={stats.spaces.total} sub={`${stats.spaces.public} public`} />
                                <StatCard label="Connections" value={stats.connections} />
                                <StatCard label="Reports total" value={stats.reports.total} />
                                <StatCard label="Reports pending" value={stats.reports.pending} accent={stats.reports.pending > 0} />
                            </div>
                        </div>

                        {stats.reports.pending > 0 && (
                            <div className="huru-card p-4 border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-amber-400 text-lg">⚑</span>
                                    <p className="text-amber-300 text-sm font-medium">
                                        {stats.reports.pending} report{stats.reports.pending !== 1 ? 's' : ''} awaiting review
                                    </p>
                                </div>
                                <a href="/admin/reports" className="text-xs text-amber-400 border border-amber-500/30 rounded-lg px-3 py-1.5 hover:bg-amber-500/10 transition-colors">
                                    Review now →
                                </a>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-stone-400">Failed to load stats.</p>
                )}
            </AdminLayout>
        </>
    );
}
