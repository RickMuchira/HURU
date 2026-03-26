import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { PageProps } from '@/types';
import axios from 'axios';

interface OtherUser {
    id: number;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    pronouns: string | null;
}

interface MessageData {
    id: number;
    conversation_id: number;
    sender_id: number;
    body: string;
    read_at: string | null;
    auto_delete_at: string | null;
    created_at: string;
    is_mine: boolean;
    sender: { username: string; avatar_url: string | null };
}

interface Props extends PageProps {
    otherUser: OtherUser;
    conversation: { id: number; messages: MessageData[] } | null;
    canMessage: boolean;
}

const AUTO_DELETE_OPTIONS = [
    { value: 'never', label: 'Keep forever' },
    { value: '1_hour', label: 'Delete after 1 hour' },
    { value: '24_hours', label: 'Delete after 24 hours' },
    { value: '7_days', label: 'Delete after 7 days' },
];

function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function MessageShow({ otherUser, conversation: initialConversation, canMessage }: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user!;

    const [messages, setMessages] = useState<MessageData[]>(initialConversation?.messages ?? []);
    const [conversationId, setConversationId] = useState<number | null>(initialConversation?.id ?? null);
    const [body, setBody] = useState('');
    const [autoDelete, setAutoDelete] = useState('never');
    const [sending, setSending] = useState(false);
    const [showAutoDelete, setShowAutoDelete] = useState(false);
    const [echoSubscribed, setEchoSubscribed] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Subscribe to Reverb channel once we have a conversationId
    useEffect(() => {
        if (!conversationId || echoSubscribed) return;

        const echoInstance = (window as any).Echo;
        if (!echoInstance) return;

        echoInstance.private(`conversation.${conversationId}`)
            .listen('.message.sent', (data: MessageData) => {
                setMessages(prev => [...prev, { ...data, is_mine: data.sender_id === user.id }]);
                // Mark as read automatically
                axios.get(`/api/conversations/${conversationId}/messages`).catch(() => {});
            });

        setEchoSubscribed(true);

        return () => {
            echoInstance.leave(`conversation.${conversationId}`);
        };
    }, [conversationId]);

    async function ensureConversation(): Promise<number | null> {
        if (conversationId) return conversationId;

        try {
            const res = await axios.post('/api/conversations/find-or-create', {
                username: otherUser.username,
            });
            const id = res.data.data.conversation_id;
            setConversationId(id);
            return id;
        } catch {
            return null;
        }
    }

    async function sendMessage() {
        if (!body.trim() || sending) return;

        setSending(true);
        const convId = await ensureConversation();
        if (!convId) { setSending(false); return; }

        try {
            const res = await axios.post(`/api/conversations/${convId}/messages`, {
                body: body.trim(),
                auto_delete: autoDelete,
            });
            setMessages(prev => [...prev, res.data.data]);
            setBody('');
        } catch (err: any) {
            console.error('Send failed', err);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    }

    async function deleteMessage(id: number) {
        await axios.delete(`/api/messages/${id}`);
        setMessages(prev => prev.filter(m => m.id !== id));
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    // Group messages by date
    const grouped: { date: string; msgs: MessageData[] }[] = [];
    messages.forEach(m => {
        const label = formatDate(m.created_at);
        const last = grouped[grouped.length - 1];
        if (last && last.date === label) {
            last.msgs.push(m);
        } else {
            grouped.push({ date: label, msgs: [m] });
        }
    });

    const initials = (otherUser.username ?? 'U')[0].toUpperCase();

    return (
        <>
            <Head title={`@${otherUser.username}`} />

            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0C0A09', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

                {/* Header */}
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1rem', height: '60px', display: 'flex', alignItems: 'center', gap: '0.875rem', background: 'rgba(12,10,9,0.95)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
                    <Link href="/messages" style={{ color: '#A8A29E', fontSize: '1.25rem', textDecoration: 'none', lineHeight: 1, minHeight: 'unset', minWidth: 'unset', display: 'flex', alignItems: 'center' }}>←</Link>

                    {otherUser.avatar_url ? (
                        <img src={otherUser.avatar_url} alt="" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#0C0A09', flexShrink: 0 }}>
                            {initials}
                        </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <Link href={`/members/${otherUser.username}`} style={{ textDecoration: 'none' }}>
                            <div style={{ color: '#FAFAF8', fontWeight: 600, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@{otherUser.username}</div>
                        </Link>
                        {otherUser.pronouns && <div style={{ color: '#57534E', fontSize: '0.75rem' }}>{otherUser.pronouns}</div>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.2)', borderRadius: '100px', padding: '0.25rem 0.625rem' }}>
                            <span style={{ fontSize: '0.65rem' }}>🔒</span>
                            <span style={{ color: '#0D9488', fontSize: '0.7rem', fontWeight: 500 }}>Encrypted</span>
                        </div>
                    </div>
                </div>

                {/* Messages area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1rem' }}>

                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👋</div>
                            <p style={{ color: '#A8A29E', fontSize: '0.9rem' }}>This is the beginning of your conversation with <strong style={{ color: '#FAFAF8' }}>@{otherUser.username}</strong></p>
                            <p style={{ color: '#57534E', fontSize: '0.8rem', marginTop: '0.375rem' }}>Messages are encrypted and private.</p>
                        </div>
                    )}

                    {grouped.map(group => (
                        <div key={group.date}>
                            {/* Date divider */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0 0.875rem' }}>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                                <span style={{ color: '#57534E', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{group.date}</span>
                                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                            </div>

                            {group.msgs.map((msg, i) => {
                                const prevMsg = i > 0 ? group.msgs[i - 1] : null;
                                const isConsecutive = prevMsg && prevMsg.sender_id === msg.sender_id;

                                return (
                                    <div key={msg.id} style={{ display: 'flex', flexDirection: msg.is_mine ? 'row-reverse' : 'row', gap: '0.5rem', alignItems: 'flex-end', marginBottom: isConsecutive ? '0.25rem' : '0.75rem' }}>

                                        {/* Avatar (only on first of a run) */}
                                        {!msg.is_mine && (
                                            <div style={{ width: '28px', flexShrink: 0 }}>
                                                {!isConsecutive ? (
                                                    otherUser.avatar_url ? (
                                                        <img src={otherUser.avatar_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#0C0A09' }}>
                                                            {initials}
                                                        </div>
                                                    )
                                                ) : null}
                                            </div>
                                        )}

                                        {/* Bubble */}
                                        <div style={{ maxWidth: '72%', position: 'relative' }}
                                            onMouseEnter={e => { if (msg.is_mine) e.currentTarget.querySelector<HTMLElement>('.del-btn')!.style.opacity = '1'; }}
                                            onMouseLeave={e => { if (msg.is_mine) { const el = e.currentTarget.querySelector<HTMLElement>('.del-btn'); if (el) el.style.opacity = '0'; } }}>

                                            <div style={{
                                                padding: '0.5rem 0.875rem',
                                                borderRadius: msg.is_mine
                                                    ? `12px 12px 3px 12px`
                                                    : `12px 12px 12px 3px`,
                                                background: msg.is_mine ? '#D97706' : '#1C1917',
                                                border: msg.is_mine ? 'none' : '1px solid rgba(255,255,255,0.08)',
                                                color: msg.is_mine ? '#0C0A09' : '#FAFAF8',
                                                fontSize: '0.9rem',
                                                lineHeight: 1.5,
                                                wordBreak: 'break-word',
                                                whiteSpace: 'pre-wrap',
                                            }}>
                                                {msg.body}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: msg.is_mine ? 'flex-end' : 'flex-start', marginTop: '0.15rem' }}>
                                                <span style={{ color: '#57534E', fontSize: '0.7rem' }}>{formatTime(msg.created_at)}</span>
                                                {msg.is_mine && msg.read_at && <span style={{ color: '#0D9488', fontSize: '0.7rem' }}>✓ Seen</span>}
                                                {msg.auto_delete_at && <span style={{ color: '#A8A29E', fontSize: '0.65rem' }}>⏱</span>}
                                            </div>

                                            {msg.is_mine && (
                                                <button className="del-btn" onClick={() => deleteMessage(msg.id)}
                                                    style={{ position: 'absolute', top: '-6px', left: '-28px', opacity: 0, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', color: '#EF4444', fontSize: '0.65rem', padding: '2px 6px', cursor: 'pointer', transition: 'opacity 0.15s', minHeight: 'unset', minWidth: 'unset' }}>
                                                    del
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Input area */}
                {canMessage ? (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '0.875rem 1rem', background: '#0C0A09', flexShrink: 0 }}>

                        {/* Auto-delete selector */}
                        {showAutoDelete && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
                                {AUTO_DELETE_OPTIONS.map(opt => (
                                    <button key={opt.value} type="button"
                                        onClick={() => { setAutoDelete(opt.value); setShowAutoDelete(false); }}
                                        style={{
                                            padding: '0.25rem 0.625rem', borderRadius: '100px', fontSize: '0.75rem',
                                            background: autoDelete === opt.value ? 'rgba(217,119,6,0.15)' : 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${autoDelete === opt.value ? 'rgba(217,119,6,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                            color: autoDelete === opt.value ? '#D97706' : '#A8A29E',
                                            cursor: 'pointer', minHeight: 'unset', minWidth: 'unset',
                                        }}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-end' }}>
                            <button type="button" onClick={() => setShowAutoDelete(v => !v)} title="Set message expiry"
                                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: autoDelete !== 'never' ? '#D97706' : '#57534E', fontSize: '1rem', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, minHeight: 'unset', minWidth: 'unset', transition: 'color 0.15s' }}>
                                ⏱
                            </button>

                            <textarea
                                ref={inputRef}
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                                rows={1}
                                style={{
                                    flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#FAFAF8', padding: '0.625rem 0.875rem', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '0.9375rem', resize: 'none', outline: 'none', lineHeight: 1.5, maxHeight: '120px', overflowY: 'auto', transition: 'border-color 0.15s',
                                }}
                                onFocus={e => (e.target.style.borderColor = '#D97706')}
                                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                            />

                            <button type="button" onClick={sendMessage} disabled={sending || !body.trim()}
                                style={{ width: '42px', height: '42px', borderRadius: '10px', background: body.trim() ? '#D97706' : 'rgba(255,255,255,0.06)', border: 'none', color: body.trim() ? '#0C0A09' : '#57534E', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: body.trim() ? 'pointer' : 'default', flexShrink: 0, transition: 'background 0.15s', minHeight: 'unset', minWidth: 'unset' }}>
                                {sending ? '…' : '↑'}
                            </button>
                        </div>

                        {autoDelete !== 'never' && (
                            <p style={{ color: '#57534E', fontSize: '0.7rem', marginTop: '0.375rem', textAlign: 'center' }}>
                                ⏱ Messages will {AUTO_DELETE_OPTIONS.find(o => o.value === autoDelete)?.label.toLowerCase()}
                            </p>
                        )}
                    </div>
                ) : (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem', textAlign: 'center', color: '#57534E', fontSize: '0.875rem' }}>
                        @{otherUser.username} is not accepting messages right now.
                    </div>
                )}
            </div>
        </>
    );
}
