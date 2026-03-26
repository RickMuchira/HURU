import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

interface SpaceMember {
    id: number;
    username: string;
    display_name: string;
    is_suspended: boolean;
    role: string;
}

interface SpacePost {
    id: number;
    body: string;
    created_at: string;
    user: { id: number; username: string; display_name: string } | null;
}

interface SpaceDetail {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    members_count: number;
    posts_count: number;
    created_at: string;
    members: SpaceMember[];
    posts: SpacePost[];
}

interface SpaceSummary {
    id: number;
    name: string;
    slug: string;
    type: string;
    description: string | null;
    members_count: number;
    posts_count: number;
    created_at: string;
}

interface Meta { current_page: number; last_page: number; total: number }

export default function AdminSpaces() {
    const [spaces, setSpaces] = useState<SpaceSummary[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<SpaceDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [actionMsg, setActionMsg] = useState<string | null>(null);

    useEffect(() => { loadSpaces(); }, [search, page]);

    async function loadSpaces() {
        setLoading(true);
        try {
            const res = await axios.get('/api/admin/spaces', { params: { search, page } });
            setSpaces(res.data.data);
            setMeta(res.data.meta);
        } finally {
            setLoading(false);
        }
    }

    async function openSpace(slug: string) {
        setDetailLoading(true);
        try {
            const res = await axios.get(`/api/admin/spaces/${slug}`);
            setSelected(res.data.data);
        } finally {
            setDetailLoading(false);
        }
    }

    async function removePost(post: SpacePost) {
        if (!selected) return;
        if (!confirm('Remove this post?')) return;
        await axios.delete(`/api/admin/spaces/${selected.slug}/posts/${post.id}`);
        flash('Post removed.');
        setSelected((s) => s ? { ...s, posts: s.posts.filter((p) => p.id !== post.id) } : s);
    }

    async function removeMember(member: SpaceMember) {
        if (!selected) return;
        if (!confirm(`Remove @${member.username} from this space?`)) return;
        const res = await axios.delete(`/api/admin/spaces/${selected.slug}/members/${member.id}`);
        flash(res.data.message);
        setSelected((s) => s ? { ...s, members: s.members.filter((m) => m.id !== member.id) } : s);
    }

    function flash(msg: string) {
        setActionMsg(msg);
        setTimeout(() => setActionMsg(null), 4000);
    }

    return (
        <>
            <Head title="Admin — Spaces" />
            <AdminLayout title="Spaces">
                {actionMsg && (
                    <div className="mb-4 text-sm text-teal-300 bg-teal-500/10 border border-teal-500/20 rounded-xl px-4 py-2.5">
                        {actionMsg}
                    </div>
                )}

                <div className="flex gap-4">
                    {/* List */}
                    <div className="flex-1 min-w-0">
                        <input
                            className="huru-input mb-4"
                            placeholder="Search spaces…"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />

                        {loading ? (
                            <div className="space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="huru-card p-4 h-16 animate-pulse" />
                                ))}
                            </div>
                        ) : spaces.length === 0 ? (
                            <div className="huru-card p-8 text-center text-stone-400 text-sm">No spaces found.</div>
                        ) : (
                            <div className="space-y-2">
                                {spaces.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => openSpace(s.slug)}
                                        className={`w-full text-left huru-card p-4 hover:border-huru-gold/30 transition-colors ${
                                            selected?.id === s.id ? 'border-huru-gold/40' : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-white font-medium text-sm truncate">{s.name}</p>
                                                {s.description && (
                                                    <p className="text-stone-500 text-xs mt-0.5 truncate">{s.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 text-xs text-stone-400">
                                                <span className={`px-1.5 py-0.5 rounded border ${
                                                    s.type === 'public'
                                                        ? 'text-teal-400 border-teal-500/20 bg-teal-500/10'
                                                        : 'text-stone-400 border-stone-600/20 bg-stone-700/20'
                                                }`}>{s.type}</span>
                                                <span>{s.members_count} members</span>
                                                <span>{s.posts_count} posts</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {meta && meta.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-stone-400 text-xs">{meta.total} spaces</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-stone-400 disabled:opacity-40 hover:border-white/20 transition-colors">
                                        ← Prev
                                    </button>
                                    <span className="text-xs text-stone-400 py-1.5">{page} / {meta.last_page}</span>
                                    <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}
                                        className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-stone-400 disabled:opacity-40 hover:border-white/20 transition-colors">
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detail panel */}
                    {(selected || detailLoading) && (
                        <div className="w-80 shrink-0">
                            {detailLoading ? (
                                <div className="huru-card p-5 animate-pulse h-64" />
                            ) : selected ? (
                                <div className="huru-card p-4 space-y-4 sticky top-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-white font-medium">{selected.name}</h3>
                                            <p className="text-stone-400 text-xs mt-0.5">
                                                {selected.members_count} members · {selected.posts_count} posts
                                            </p>
                                        </div>
                                        <button onClick={() => setSelected(null)} className="text-stone-500 hover:text-white text-lg leading-none">×</button>
                                    </div>

                                    {/* Members */}
                                    <div>
                                        <p className="text-stone-400 text-xs font-medium uppercase tracking-wide mb-2">Members</p>
                                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                            {selected.members.map((m) => (
                                                <div key={m.id} className="flex items-center justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className={`text-xs truncate ${m.is_suspended ? 'text-red-300' : 'text-stone-300'}`}>
                                                            @{m.username}
                                                        </p>
                                                        {m.role === 'moderator' && (
                                                            <span className="text-amber-400 text-xs">mod</span>
                                                        )}
                                                    </div>
                                                    {m.role !== 'moderator' && (
                                                        <button
                                                            onClick={() => removeMember(m)}
                                                            className="text-xs text-red-400 hover:text-red-300 shrink-0 transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Posts */}
                                    <div>
                                        <p className="text-stone-400 text-xs font-medium uppercase tracking-wide mb-2">Recent Posts</p>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {selected.posts.length === 0 ? (
                                                <p className="text-stone-500 text-xs">No posts yet.</p>
                                            ) : selected.posts.map((p) => (
                                                <div key={p.id} className="bg-white/3 rounded-lg p-2.5">
                                                    <p className="text-stone-400 text-xs mb-1">
                                                        @{p.user?.username ?? 'deleted'} · {new Date(p.created_at).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-stone-300 text-xs leading-relaxed line-clamp-3">{p.body}</p>
                                                    <button
                                                        onClick={() => removePost(p)}
                                                        className="text-red-400 text-xs mt-1.5 hover:text-red-300 transition-colors"
                                                    >
                                                        Remove post
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
