import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

type Space = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: 'public' | 'private';
    member_count: number;
    is_member?: boolean;
    role?: 'member' | 'moderator' | null;
};

type Paginated<T> = {
    data: T[];
    links?: unknown;
    meta?: unknown;
};

export default function SpacesIndex() {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [search, setSearch] = useState('');
    const [type, setType] = useState<'all' | 'public' | 'private'>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const filtered = useMemo(() => {
        if (!Array.isArray(spaces)) return [];
        const s = search.trim().toLowerCase();
        return spaces.filter((sp) => {
            if (type !== 'all' && sp.type !== type) return false;
            if (!s) return true;
            return sp.name.toLowerCase().includes(s);
        });
    }, [spaces, search, type]);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/spaces');
            // API returns { data: ResourceCollection, message }
            // ResourceCollection can be { data: [...] } (paginated) or [...] (plain array)
            const raw = res.data?.data;
            const items: Space[] = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
            setSpaces(items);
        } catch (e: any) {
            setError('Failed to load spaces.');
        } finally {
            setLoading(false);
        }
    }

    async function joinSpace(slug: string) {
        try {
            await axios.post(`/api/spaces/${slug}/join`);
            await load();
        } catch (e: any) {
            const msg = e?.response?.data?.message ?? 'Could not join this space.';
            alert(msg);
        }
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <>
            <Head title="Spaces" />
            <div style={{ minHeight: '100vh', background: '#0C0A09', color: '#FAFAF8', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(12,10,9,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/home" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '1.375rem', color: '#D97706', fontWeight: 600, textDecoration: 'none' }}>HURU</Link>
                    <Link href="/spaces/create" className="huru-btn huru-btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', minHeight: 'unset', fontSize: '0.875rem' }}>
                        + Create space
                    </Link>
                </nav>

                <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '2.25rem', fontWeight: 400, margin: 0 }}>Spaces</h1>
                        <p style={{ color: '#A8A29E', marginTop: '0.5rem' }}>Join communities built for you.</p>
                    </div>

                    <div style={{ background: '#1C1917', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <input
                            className="huru-input"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search spaces…"
                            style={{ flex: '1 1 240px', padding: '0.5rem 0.75rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {(['all', 'public', 'private'] as const).map((t) => {
                                const active = type === t;
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        style={{
                                            padding: '0.45rem 0.9rem',
                                            borderRadius: '10px',
                                            background: active ? 'rgba(217,119,6,0.12)' : 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${active ? 'rgba(217,119,6,0.30)' : 'rgba(255,255,255,0.10)'}`,
                                            color: active ? '#D97706' : '#A8A29E',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            minHeight: 'unset',
                                            minWidth: 'unset',
                                        }}
                                    >
                                        {t[0].toUpperCase() + t.slice(1)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ color: '#57534E', padding: '2rem 0' }}>Loading spaces…</div>
                    ) : error ? (
                        <div style={{ color: '#EF4444', padding: '2rem 0' }}>{error}</div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#57534E' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏠</div>
                            <div style={{ color: '#A8A29E', fontSize: '1.05rem' }}>No spaces found</div>
                            <div style={{ marginTop: '0.5rem' }}>Try a different search.</div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {filtered.map((sp) => (
                                <div key={sp.id} className="huru-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ color: '#FAFAF8', fontWeight: 700, fontSize: '1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {sp.name}
                                            </div>
                                            <div style={{ color: '#57534E', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                                                {sp.type === 'private' ? '🔒 Private' : '🌍 Public'} · {sp.member_count} members
                                            </div>
                                        </div>
                                        {sp.role === 'moderator' && (
                                            <span style={{ color: '#0D9488', fontSize: '0.75rem', border: '1px solid rgba(13,148,136,0.25)', background: 'rgba(13,148,136,0.08)', padding: '0.25rem 0.6rem', borderRadius: '100px' }}>
                                                Moderator
                                            </span>
                                        )}
                                    </div>

                                    {sp.description && (
                                        <p style={{ color: '#A8A29E', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {sp.description}
                                        </p>
                                    )}

                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                        <Link href={`/spaces/${sp.slug}`} className="huru-btn huru-btn-ghost" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem', minHeight: 'unset' }}>
                                            View
                                        </Link>
                                        {sp.is_member ? (
                                            <Link href={`/spaces/${sp.slug}`} className="huru-btn huru-btn-primary" style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.875rem', minHeight: 'unset' }}>
                                                Enter
                                            </Link>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => joinSpace(sp.slug)}
                                                className="huru-btn huru-btn-outline"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', minHeight: 'unset' }}
                                            >
                                                Join
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
