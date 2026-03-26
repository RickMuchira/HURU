import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps, User } from '@/types';

interface Connection {
    id: number;
    status: string;
    requester_id: number;
    receiver_id: number;
    requester?: User;
    receiver?: User;
}

interface PaginatedConnections {
    data: Connection[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props extends PageProps {
    connections: PaginatedConnections;
    pendingRequests: { data: Connection[] };
}

function ConnectionCard({ conn, viewerId, onAction }: {
    conn: Connection;
    viewerId: number;
    onAction: (id: number, action: string) => void;
}) {
    const other = conn.requester_id === viewerId ? conn.receiver : conn.requester;
    if (!other) return null;
    const initials = (other.username ?? 'U')[0].toUpperCase();

    return (
        <div className="huru-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <Link href={`/members/${other.username}`} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', textDecoration: 'none', flex: 1, minWidth: 0 }}>
                {other.avatar_url ? (
                    <img src={other.avatar_url} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#0C0A09', flexShrink: 0 }}>
                        {initials}
                    </div>
                )}
                <div style={{ minWidth: 0 }}>
                    <div style={{ color: '#FAFAF8', fontWeight: 600, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{other.username}</div>
                    {other.pronouns && <div style={{ color: '#57534E', fontSize: '0.75rem' }}>{other.pronouns}</div>}
                </div>
            </Link>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <Link href={`/messages/${other.username}`} style={{ padding: '0.375rem 0.875rem', background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.25)', borderRadius: '8px', color: '#D97706', fontSize: '0.8125rem', fontWeight: 500, textDecoration: 'none' }}>
                    Message
                </Link>
                <button onClick={() => onAction(conn.id, 'block')} style={{ padding: '0.375rem 0.625rem', background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#EF4444', fontSize: '0.75rem', cursor: 'pointer', minHeight: 'unset', minWidth: 'unset' }}>
                    Block
                </button>
            </div>
        </div>
    );
}

function PendingCard({ conn, onAction }: { conn: Connection; onAction: (id: number, action: string) => void }) {
    const requester = conn.requester;
    if (!requester) return null;
    const initials = (requester.username ?? 'U')[0].toUpperCase();

    return (
        <div style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <Link href={`/members/${requester.username}`} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', textDecoration: 'none', flex: 1, minWidth: 0 }}>
                {requester.avatar_url ? (
                    <img src={requester.avatar_url} alt="" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: '#0C0A09', flexShrink: 0 }}>
                        {initials}
                    </div>
                )}
                <div style={{ minWidth: 0 }}>
                    <div style={{ color: '#FAFAF8', fontWeight: 600, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{requester.username}</div>
                    <div style={{ color: '#D97706', fontSize: '0.75rem', marginTop: '0.1rem' }}>Wants to connect</div>
                </div>
            </Link>
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button onClick={() => onAction(conn.id, 'accept')} style={{ padding: '0.375rem 0.875rem', background: '#D97706', borderRadius: '8px', color: '#0C0A09', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', border: 'none', minHeight: 'unset', minWidth: 'unset' }}>
                    Accept
                </button>
                <button onClick={() => onAction(conn.id, 'decline')} style={{ padding: '0.375rem 0.625rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#A8A29E', fontSize: '0.8125rem', cursor: 'pointer', minHeight: 'unset', minWidth: 'unset' }}>
                    Decline
                </button>
            </div>
        </div>
    );
}

export default function Connections({ connections, pendingRequests }: Props) {
    const { auth } = usePage<PageProps>().props;
    const viewerId = auth.user!.id;

    function handleAction(id: number, action: string) {
        router.put(`/api/connections/${id}`, { action }, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Connections" />
            <div style={{ minHeight: '100vh', background: '#0C0A09', color: '#FAFAF8', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

                <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(12,10,9,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/home" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '1.375rem', color: '#D97706', fontWeight: 600, textDecoration: 'none' }}>HURU</Link>
                    <Link href="/members" style={{ color: '#A8A29E', fontSize: '0.875rem', textDecoration: 'none' }}>← Members</Link>
                </nav>

                <main style={{ maxWidth: '680px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
                    <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '2rem', color: '#FAFAF8', fontWeight: 400, marginBottom: '2rem' }}>
                        Your connections
                    </h1>

                    {/* Pending requests */}
                    {pendingRequests.data.length > 0 && (
                        <div style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ color: '#D97706', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                                Pending requests ({pendingRequests.data.length})
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {pendingRequests.data.map(conn => (
                                    <PendingCard key={conn.id} conn={conn} onAction={handleAction} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Connections list */}
                    <div>
                        <h2 style={{ color: '#A8A29E', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1rem' }}>
                            Connected ({connections.total})
                        </h2>

                        {connections.data.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem 0', color: '#57534E' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤝</div>
                                <p style={{ color: '#A8A29E', marginBottom: '0.5rem' }}>No connections yet</p>
                                <Link href="/members" style={{ color: '#D97706', fontSize: '0.875rem', textDecoration: 'none' }}>
                                    Find people to connect with →
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {connections.data.map(conn => (
                                    <ConnectionCard key={conn.id} conn={conn} viewerId={viewerId} onAction={handleAction} />
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
