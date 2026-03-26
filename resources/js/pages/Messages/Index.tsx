import { Head, Link, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

interface OtherUser {
    id: number;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    pronouns: string | null;
}

interface ConversationItem {
    id: number;
    last_message_at: string | null;
    other_user: OtherUser | null;
    latest_message: {
        body: string;
        sender_id: number;
        created_at: string;
        is_mine: boolean;
    } | null;
    unread_count: number;
}

interface Props extends PageProps {
    conversations: ConversationItem[];
}

function timeAgo(iso: string): string {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function MessagesIndex({ conversations }: Props) {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Messages" />

            <div style={{ minHeight: '100vh', background: '#0C0A09', color: '#FAFAF8', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

                <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(12,10,9,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/home" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '1.375rem', color: '#D97706', fontWeight: 600, textDecoration: 'none' }}>HURU</Link>
                    <Link href="/members" style={{ color: '#A8A29E', fontSize: '0.875rem', textDecoration: 'none' }}>Find people →</Link>
                </nav>

                <main style={{ maxWidth: '680px', margin: '0 auto', padding: '2rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '2rem', color: '#FAFAF8', fontWeight: 400 }}>
                            Messages
                        </h1>
                    </div>

                    {conversations.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                            <p style={{ color: '#A8A29E', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No conversations yet</p>
                            <p style={{ color: '#57534E', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Connect with someone to start a private, encrypted conversation</p>
                            <Link href="/members" className="huru-btn huru-btn-primary" style={{ textDecoration: 'none', padding: '0.625rem 1.5rem' }}>
                                Find people
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {conversations.map(conv => {
                                const other = conv.other_user;
                                if (!other) return null;
                                const initials = (other.username ?? 'U')[0].toUpperCase();
                                const hasUnread = conv.unread_count > 0;

                                return (
                                    <Link key={conv.id} href={`/messages/${other.username}`} style={{ textDecoration: 'none' }}>
                                        <div className="huru-card" style={{ padding: '1.125rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {/* Avatar */}
                                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                                {other.avatar_url ? (
                                                    <img src={other.avatar_url} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#0C0A09' }}>
                                                        {initials}
                                                    </div>
                                                )}
                                                {hasUnread && (
                                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', background: '#D97706', border: '2px solid #0C0A09' }} />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
                                                    <span style={{ color: hasUnread ? '#FAFAF8' : '#D4CFC9', fontWeight: hasUnread ? 700 : 500, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        @{other.username}
                                                    </span>
                                                    {conv.last_message_at && (
                                                        <span style={{ color: '#57534E', fontSize: '0.75rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                                                            {timeAgo(conv.last_message_at)}
                                                        </span>
                                                    )}
                                                </div>
                                                {conv.latest_message ? (
                                                    <p style={{ color: hasUnread ? '#A8A29E' : '#57534E', fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                                                        {conv.latest_message.is_mine ? 'You: ' : ''}{conv.latest_message.body}
                                                    </p>
                                                ) : (
                                                    <p style={{ color: '#57534E', fontSize: '0.8125rem', margin: 0, fontStyle: 'italic' }}>No messages yet</p>
                                                )}
                                            </div>

                                            {hasUnread && (
                                                <div style={{ flexShrink: 0, background: '#D97706', borderRadius: '100px', minWidth: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#0C0A09', padding: '0 5px' }}>
                                                    {conv.unread_count}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(13,148,136,0.06)', border: '1px solid rgba(13,148,136,0.15)', borderRadius: '10px', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔒</span>
                        <p style={{ color: '#57534E', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                            All messages are encrypted and private. You control how long they're kept.
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
}
