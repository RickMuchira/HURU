import { Head, Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function Home() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user!;

    const displayName = user.display_name || user.username || 'there';

    return (
        <>
            <Head title="Home" />

            <div style={{ minHeight: '100vh', background: '#0C0A09', color: '#FAFAF8', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

                {/* Topbar */}
                <nav style={{
                    position: 'sticky', top: 0, zIndex: 40,
                    background: 'rgba(12,10,9,0.92)', backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    padding: '0 1.5rem', height: '60px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '1.375rem', color: '#D97706', fontWeight: 600 }}>HURU</span>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[
                            { label: 'Members', href: '/members' },
                            { label: 'Spaces', href: '/spaces' },
                            { label: 'Messages', href: '/messages' },
                        ].map(link => (
                            <Link key={link.label} href={link.href} style={{
                                padding: '0.375rem 0.875rem', borderRadius: '8px',
                                color: '#A8A29E', fontSize: '0.875rem', fontWeight: 500,
                                textDecoration: 'none', transition: 'color 0.15s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#FAFAF8')}
                                onMouseLeave={e => (e.currentTarget.style.color = '#A8A29E')}>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.875rem', fontWeight: 700, color: '#0C0A09',
                        }}>
                            {(user.username ?? user.name ?? 'U')[0].toUpperCase()}
                        </div>
                    </Link>
                </nav>

                <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

                    {/* Welcome */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#FAFAF8', fontWeight: 400, marginBottom: '0.5rem' }}>
                            Welcome, {displayName} 👋
                        </h1>
                        <p style={{ color: '#A8A29E', fontSize: '1rem' }}>Here's what's happening in your community today.</p>
                    </div>

                    {/* Quick actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
                        {[
                            { emoji: '🌍', title: 'Find members', body: 'Discover people from around the world', href: '/members' },
                            { emoji: '💬', title: 'Messages', body: 'Your private conversations', href: '/messages' },
                            { emoji: '🏠', title: 'Spaces', body: 'Join communities built for you', href: '/spaces' },
                            { emoji: '🛡️', title: 'Safety center', body: 'Ghost mode, check-in timer & more', href: '/settings/safety' },
                        ].map(card => (
                            <Link key={card.title} href={card.href} style={{ textDecoration: 'none' }}>
                                <div className="huru-card" style={{ padding: '1.5rem', cursor: 'pointer' }}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.625rem' }}>{card.emoji}</div>
                                    <div style={{ color: '#FAFAF8', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{card.title}</div>
                                    <div style={{ color: '#A8A29E', fontSize: '0.8125rem' }}>{card.body}</div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Ghost mode banner */}
                    {user.ghost_mode && (
                        <div style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.2)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>👻</span>
                            <div>
                                <span style={{ color: '#0D9488', fontWeight: 600, fontSize: '0.9rem' }}>Ghost mode is on</span>
                                <span style={{ color: '#A8A29E', fontSize: '0.875rem' }}> — you won't appear in member discovery. </span>
                                <Link href="/settings/safety" style={{ color: '#D97706', fontSize: '0.875rem', textDecoration: 'none' }}>Turn off →</Link>
                            </div>
                        </div>
                    )}

                    {/* Profile completeness nudge */}
                    {!user.bio && (
                        <div style={{ background: '#1C1917', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
                            <div>
                                <div style={{ color: '#FAFAF8', fontWeight: 600, fontSize: '0.9375rem' }}>Complete your profile</div>
                                <div style={{ color: '#A8A29E', fontSize: '0.8125rem', marginTop: '0.2rem' }}>Add a bio so people know who you are</div>
                            </div>
                            <Link href="/settings/profile" className="huru-btn huru-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', minHeight: 'unset', whiteSpace: 'nowrap', textDecoration: 'none' }}>
                                Edit profile
                            </Link>
                        </div>
                    )}

                    <div style={{ textAlign: 'center', padding: '3rem 0', color: '#57534E' }}>
                        <p style={{ fontSize: '0.9rem' }}>More features coming soon — member discovery, live spaces, and messaging are in the works.</p>
                    </div>
                </main>
            </div>
        </>
    );
}
