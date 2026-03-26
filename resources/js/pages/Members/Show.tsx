import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps, User } from '@/types';

interface Props extends PageProps {
    member: User;
    connectionStatus: 'pending' | 'accepted' | 'declined' | 'blocked' | null;
    connectionId: number | null;
    iAmRequester: boolean;
    isOwnProfile: boolean;
}

const INTENT_LABELS: Record<string, string> = {
    friendship: '👋 Friendship',
    support: '💙 Support',
    dating: '💛 Dating',
    community: '✊ Community',
    browsing: '👀 Browsing',
};

const INTENT_COLORS: Record<string, string> = {
    friendship: '#D97706',
    support: '#3B82F6',
    dating: '#EC4899',
    community: '#8B5CF6',
    browsing: '#6B7280',
};

export default function MemberShow({ member, connectionStatus, connectionId, iAmRequester, isOwnProfile }: Props) {
    const { auth } = usePage<PageProps>().props;
    const viewer = auth.user!;
    const [status, setStatus] = useState(connectionStatus);
    const [connId, setConnId] = useState(connectionId);
    const [processing, setProcessing] = useState(false);

    const initials = (member.username ?? 'U')[0].toUpperCase();

    function sendRequest() {
        setProcessing(true);
        router.post('/api/connections', { username: member.username }, {
            preserveScroll: true,
            onSuccess: (page: any) => {
                const data = (page as any).props?.flash?.data;
                setStatus('pending');
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    }

    function doAction(action: string) {
        if (!connId) return;
        setProcessing(true);
        router.put(`/api/connections/${connId}`, { action }, {
            preserveScroll: true,
            onSuccess: () => {
                if (action === 'accept') setStatus('accepted');
                if (action === 'decline') setStatus('declined');
                if (action === 'block') setStatus('blocked');
                if (action === 'withdraw') { setStatus(null); setConnId(null); }
                setProcessing(false);
            },
            onError: () => setProcessing(false),
        });
    }

    function renderConnectionButton() {
        if (isOwnProfile) {
            return (
                <Link href="/settings/profile" className="huru-btn huru-btn-outline" style={{ padding: '0.625rem 1.5rem', textDecoration: 'none' }}>
                    Edit profile
                </Link>
            );
        }

        if (status === 'blocked') {
            return <span style={{ color: '#EF4444', fontSize: '0.875rem' }}>Blocked</span>;
        }

        if (status === 'accepted') {
            return (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link href={`/messages/${member.username}`} className="huru-btn huru-btn-primary" style={{ padding: '0.625rem 1.5rem', textDecoration: 'none' }}>
                        💬 Message
                    </Link>
                    <button onClick={() => doAction('block')} disabled={processing}
                        className="huru-btn huru-btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', minHeight: 'unset', color: '#EF4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                        Block
                    </button>
                </div>
            );
        }

        if (status === 'pending' && iAmRequester) {
            return (
                <button onClick={() => doAction('withdraw')} disabled={processing}
                    className="huru-btn huru-btn-ghost" style={{ padding: '0.625rem 1.5rem' }}>
                    Request sent — Withdraw
                </button>
            );
        }

        if (status === 'pending' && !iAmRequester) {
            return (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => doAction('accept')} disabled={processing}
                        className="huru-btn huru-btn-primary" style={{ padding: '0.625rem 1.25rem' }}>
                        Accept
                    </button>
                    <button onClick={() => doAction('decline')} disabled={processing}
                        className="huru-btn huru-btn-ghost" style={{ padding: '0.625rem 1.25rem' }}>
                        Decline
                    </button>
                </div>
            );
        }

        return (
            <button onClick={sendRequest} disabled={processing}
                className="huru-btn huru-btn-primary" style={{ padding: '0.625rem 1.5rem', opacity: processing ? 0.6 : 1 }}>
                {processing ? 'Sending…' : '+ Connect'}
            </button>
        );
    }

    return (
        <>
            <Head title={`@${member.username}`} />

            <div style={{ minHeight: '100vh', background: '#0C0A09', color: '#FAFAF8', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

                {/* Topbar */}
                <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(12,10,9,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/home" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '1.375rem', color: '#D97706', fontWeight: 600, textDecoration: 'none' }}>HURU</Link>
                    <Link href="/members" style={{ color: '#A8A29E', fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        ← Members
                    </Link>
                </nav>

                <main style={{ maxWidth: '680px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

                    {/* Profile card */}
                    <div style={{ background: '#1C1917', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem' }}>

                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                {member.avatar_url ? (
                                    <img src={member.avatar_url} alt="" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{
                                        width: '72px', height: '72px', borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #D97706, #B45309)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.75rem', fontWeight: 700, color: '#0C0A09', flexShrink: 0,
                                    }}>
                                        {initials}
                                    </div>
                                )}

                                <div>
                                    <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.625rem', color: '#FAFAF8', fontWeight: 600, margin: 0 }}>
                                        @{member.username}
                                    </h1>
                                    {member.display_name && (
                                        <div style={{ color: '#A8A29E', fontSize: '0.9rem', marginTop: '0.2rem' }}>{member.display_name}</div>
                                    )}
                                    {member.pronouns && (
                                        <div style={{ color: '#57534E', fontSize: '0.8rem', marginTop: '0.1rem' }}>{member.pronouns}</div>
                                    )}
                                </div>
                            </div>

                            {status === 'accepted' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.25)', borderRadius: '100px', padding: '0.3rem 0.75rem' }}>
                                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0D9488', display: 'inline-block' }} />
                                    <span style={{ color: '#0D9488', fontSize: '0.75rem', fontWeight: 500 }}>Connected</span>
                                </div>
                            )}
                        </div>

                        {/* Bio */}
                        {member.bio && (
                            <p style={{ color: '#D4CFC9', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                                {member.bio}
                            </p>
                        )}

                        {/* Location */}
                        {(member.country || member.city) && (
                            <div style={{ color: '#57534E', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                📍 {[member.city, member.country].filter(Boolean).join(', ')}
                            </div>
                        )}

                        {/* Intents */}
                        {member.intents && member.intents.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                {member.intents.map(intent => (
                                    <span key={intent} style={{
                                        padding: '0.3rem 0.8rem', borderRadius: '100px',
                                        background: `${INTENT_COLORS[intent] ?? '#6B7280'}18`,
                                        border: `1px solid ${INTENT_COLORS[intent] ?? '#6B7280'}35`,
                                        color: INTENT_COLORS[intent] ?? '#6B7280',
                                        fontSize: '0.8125rem', fontWeight: 500,
                                    }}>
                                        {INTENT_LABELS[intent] ?? intent}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Connection CTA */}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}>
                            {renderConnectionButton()}
                        </div>
                    </div>

                    {/* Safety note for non-connections */}
                    {!isOwnProfile && status !== 'accepted' && (
                        <div style={{ background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.15)', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.1rem' }}>🛡️</span>
                            <p style={{ color: '#A8A29E', fontSize: '0.8125rem', lineHeight: 1.6, margin: 0 }}>
                                Connect with {member.username} to start a private, encrypted conversation.
                                You can always block or report a member from the connections page.
                            </p>
                        </div>
                    )}

                    {/* Report link */}
                    {!isOwnProfile && (
                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <button style={{ background: 'none', border: 'none', color: '#57534E', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => alert('Report system coming soon')}>
                                Report @{member.username}
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
