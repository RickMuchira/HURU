import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PageProps } from '@/types';

type Space = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: 'public' | 'private';
    member_count: number;
    is_member: boolean;
    role: 'member' | 'moderator' | null;
};

type Post = {
    id: number;
    body: string;
    created_at: string;
    author: {
        username: string;
        avatar_url: string | null;
        pronouns: string | null;
    };
};

function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function SpaceShow() {
    const { props } = usePage<PageProps & { slug: string }>();
    const slug = (props as any).slug as string;

    const [space, setSpace] = useState<Space | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [body, setBody] = useState('');
    const [error, setError] = useState<string | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    async function loadAll() {
        setLoading(true);
        setError(null);
        try {
            const resSpace = await axios.get(`/api/spaces/${slug}`);
            setSpace(resSpace.data.data);

            const resPosts = await axios.get(`/api/spaces/${slug}/posts`);
            const rawPosts = resPosts.data?.data;
            const postItems: Post[] = Array.isArray(rawPosts) ? rawPosts : (Array.isArray(rawPosts?.data) ? rawPosts.data : []);
            setPosts(postItems);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Failed to load this space.');
        } finally {
            setLoading(false);
        }
    }

    async function join() {
        try {
            await axios.post(`/api/spaces/${slug}/join`);
            await loadAll();
        } catch (e: any) {
            alert(e?.response?.data?.message ?? 'Could not join.');
        }
    }

    async function submitPost() {
        if (!body.trim() || posting) return;
        setPosting(true);
        try {
            const res = await axios.post(`/api/spaces/${slug}/posts`, { body: body.trim() });
            setPosts((prev) => [res.data.data, ...prev]);
            setBody('');
            textareaRef.current?.focus();
        } catch (e: any) {
            alert(e?.response?.data?.message ?? 'Could not post.');
        } finally {
            setPosting(false);
        }
    }

    useEffect(() => {
        loadAll();
    }, [slug]);

    const canPost = !!space?.is_member;

    return (
        <>
            <Head title={space ? space.name : 'Space'} />
            <div style={{ minHeight: '100vh', background: '#0C0A09', color: '#FAFAF8', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(12,10,9,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/spaces" style={{ color: '#A8A29E', textDecoration: 'none' }}>← Spaces</Link>
                    <Link href="/home" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '1.375rem', color: '#D97706', fontWeight: 600, textDecoration: 'none' }}>HURU</Link>
                    <div style={{ width: 64 }} />
                </nav>

                <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
                    {loading ? (
                        <div style={{ color: '#57534E', padding: '2rem 0' }}>Loading…</div>
                    ) : error ? (
                        <div style={{ padding: '2rem 0' }}>
                            <div style={{ color: '#EF4444', marginBottom: '0.75rem' }}>{error}</div>
                            <Link href="/spaces" className="huru-btn huru-btn-ghost" style={{ textDecoration: 'none', padding: '0.5rem 1rem', minHeight: 'unset' }}>Back</Link>
                        </div>
                    ) : space ? (
                        <>
                            <div className="huru-card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                                    <div style={{ minWidth: 0 }}>
                                        <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '2rem', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {space.name}
                                        </h1>
                                        <div style={{ color: '#57534E', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                                            {space.type === 'private' ? '🔒 Private' : '🌍 Public'} · {space.member_count} members
                                            {space.role === 'moderator' ? ' · 🛡️ Moderator' : ''}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                        {space.is_member ? (
                                            <span style={{ color: '#0D9488', fontSize: '0.75rem', border: '1px solid rgba(13,148,136,0.25)', background: 'rgba(13,148,136,0.08)', padding: '0.35rem 0.75rem', borderRadius: '100px', alignSelf: 'flex-start' }}>
                                                Joined
                                            </span>
                                        ) : (
                                            <button type="button" onClick={join} className="huru-btn huru-btn-outline" style={{ padding: '0.5rem 1rem', minHeight: 'unset' }}>
                                                Join
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {space.description && (
                                    <p style={{ color: '#A8A29E', marginTop: '1rem', lineHeight: 1.7, marginBottom: 0 }}>
                                        {space.description}
                                    </p>
                                )}
                            </div>

                            {/* Post composer */}
                            {canPost ? (
                                <div className="huru-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
                                    <div style={{ color: '#A8A29E', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Post something</div>
                                    <textarea
                                        ref={textareaRef}
                                        className="huru-input"
                                        rows={3}
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        placeholder="Share an update, ask a question, start a conversation…"
                                        style={{ resize: 'vertical' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                                        <span style={{ color: '#57534E', fontSize: '0.75rem' }}>{body.length}/5000</span>
                                        <button
                                            type="button"
                                            onClick={submitPost}
                                            disabled={posting || !body.trim()}
                                            className="huru-btn huru-btn-primary"
                                            style={{ padding: '0.5rem 1rem', minHeight: 'unset', opacity: posting ? 0.6 : 1, cursor: posting ? 'not-allowed' : 'pointer' }}
                                        >
                                            {posting ? 'Posting…' : 'Post'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.18)', borderRadius: '12px', padding: '1rem 1.25rem', color: '#A8A29E', marginBottom: '1.25rem' }}>
                                    Join this space to view posts and participate.
                                </div>
                            )}

                            {/* Posts */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {posts.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#57534E' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
                                        <div style={{ color: '#A8A29E' }}>No posts yet</div>
                                        <div style={{ marginTop: '0.35rem' }}>Be the first to start the conversation.</div>
                                    </div>
                                ) : (
                                    posts.map((p) => (
                                        <div key={p.id} className="huru-card" style={{ padding: '1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                                                    {p.author.avatar_url ? (
                                                        <img src={p.author.avatar_url} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0C0A09', fontWeight: 800 }}>
                                                            {(p.author.username?.[0] ?? 'U').toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ color: '#FAFAF8', fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            @{p.author.username}
                                                        </div>
                                                        <div style={{ color: '#57534E', fontSize: '0.75rem' }}>{timeAgo(p.created_at)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ color: '#D4CFC9', fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{p.body}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : null}
                </main>
            </div>
        </>
    );
}
