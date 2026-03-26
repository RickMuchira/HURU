import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import type { PageProps } from '@/types';

const COUNTRIES = [
    'Afghanistan','Albania','Algeria','Angola','Argentina','Australia','Austria','Bangladesh','Belgium',
    'Bolivia','Brazil','Cameroon','Canada','Chile','China','Colombia','Congo','Cuba','Denmark','Ecuador',
    'Egypt','Ethiopia','Finland','France','Germany','Ghana','Greece','Guatemala','India','Indonesia',
    'Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kenya','Lebanon','Malaysia',
    'Mexico','Morocco','Mozambique','Myanmar','Netherlands','New Zealand','Nigeria','Norway','Pakistan',
    'Peru','Philippines','Poland','Portugal','Romania','Russia','Rwanda','Saudi Arabia','Senegal',
    'Sierra Leone','Somalia','South Africa','South Korea','Spain','Sri Lanka','Sudan','Sweden',
    'Switzerland','Tanzania','Thailand','Trinidad and Tobago','Tunisia','Turkey','Uganda','Ukraine',
    'United Kingdom','United States','Uruguay','Venezuela','Vietnam','Zambia','Zimbabwe',
];

const PRONOUNS_OPTIONS = [
    'he/him', 'she/her', 'they/them', 'he/they', 'she/they', 'any/all', 'xe/xem', 'ze/zir',
];

const INTENTS = [
    { value: 'friendship', label: 'Friendship', emoji: '👋' },
    { value: 'support', label: 'Support', emoji: '💙' },
    { value: 'romance', label: 'Romance', emoji: '💛' },
    { value: 'community', label: 'Community', emoji: '✊' },
];

const INTENT_COLORS: Record<string, string> = {
    friendship: '#D97706',
    support: '#3B82F6',
    romance: '#EC4899',
    community: '#8B5CF6',
};

export default function ProfileIndex() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user!;

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);

    const [form, setForm] = useState({
        display_name: user.display_name ?? '',
        pronouns: user.pronouns ?? '',
        bio: user.bio ?? '',
        country: user.country ?? '',
        city: user.city ?? '',
        intents: user.intents ?? [],
    });

    // custom pronouns entry
    const [customPronouns, setCustomPronouns] = useState(
        !PRONOUNS_OPTIONS.includes(user.pronouns ?? '') && !!user.pronouns
    );

    function toggleIntent(val: string) {
        setForm(f => ({
            ...f,
            intents: f.intents.includes(val)
                ? f.intents.filter(i => i !== val)
                : [...f.intents, val],
        }));
    }

    async function save() {
        setSaving(true);
        try {
            await axios.put('/api/me/profile', form);
            setSaveMsg('Profile updated!');
            setTimeout(() => setSaveMsg(null), 3000);
            setEditing(false);
        } catch (err: any) {
            setSaveMsg(err.response?.data?.message ?? 'Failed to save.');
        } finally {
            setSaving(false);
        }
    }

    function cancelEdit() {
        setForm({
            display_name: user.display_name ?? '',
            pronouns: user.pronouns ?? '',
            bio: user.bio ?? '',
            country: user.country ?? '',
            city: user.city ?? '',
            intents: user.intents ?? [],
        });
        setEditing(false);
    }

    const initials = (user.display_name ?? user.username ?? 'U')[0].toUpperCase();

    return (
        <>
            <Head title="My Profile — HURU" />
            <div style={{ minHeight: '100vh', background: '#0C0A09', color: '#FAFAF8', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

                {/* Topbar */}
                <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(12,10,9,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/home" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '1.375rem', color: '#D97706', fontWeight: 600, textDecoration: 'none' }}>HURU</Link>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link href="/members" style={{ color: '#A8A29E', fontSize: '0.875rem', textDecoration: 'none' }}>Members</Link>
                        <Link href="/spaces" style={{ color: '#A8A29E', fontSize: '0.875rem', textDecoration: 'none' }}>Spaces</Link>
                        <Link href="/messages" style={{ color: '#A8A29E', fontSize: '0.875rem', textDecoration: 'none' }}>Messages</Link>
                    </div>
                </nav>

                <main style={{ maxWidth: '680px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

                    {saveMsg && (
                        <div style={{ background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', color: '#2DD4BF', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                            {saveMsg}
                        </div>
                    )}

                    {/* Profile card */}
                    <div style={{ background: '#1C1917', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden' }}>

                        {/* Header strip */}
                        <div style={{ background: 'linear-gradient(135deg, rgba(217,119,6,0.15), rgba(180,83,9,0.08))', padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                    {/* Avatar */}
                                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #B45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700, color: '#0C0A09', flexShrink: 0 }}>
                                        {initials}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '1.5rem', color: '#FAFAF8', fontWeight: 400, margin: 0 }}>
                                                {user.display_name || user.username}
                                            </h1>
                                            {user.ghost_mode && (
                                                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '100px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#A8A29E' }}>
                                                    👻 ghost mode
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ color: '#A8A29E', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>@{user.username}</p>
                                        {user.pronouns && (
                                            <p style={{ color: '#78716C', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>{user.pronouns}</p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => editing ? cancelEdit() : setEditing(true)}
                                    style={{ background: editing ? 'transparent' : 'rgba(217,119,6,0.12)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: '8px', color: '#D97706', padding: '0.4rem 0.9rem', fontSize: '0.8125rem', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                                >
                                    {editing ? 'Cancel' : 'Edit profile'}
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '2rem' }}>

                            {!editing ? (
                                /* ── View mode ── */
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {user.bio && (
                                        <div>
                                            <p style={{ color: '#A8A29E', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>About</p>
                                            <p style={{ color: '#D6D3D1', fontSize: '0.9375rem', lineHeight: 1.65 }}>{user.bio}</p>
                                        </div>
                                    )}

                                    {(user.country || user.city) && !user.location_hidden && (
                                        <div>
                                            <p style={{ color: '#A8A29E', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Location</p>
                                            <p style={{ color: '#D6D3D1', fontSize: '0.9375rem' }}>
                                                📍 {[user.city, user.country].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    )}

                                    {user.intents && user.intents.length > 0 && (
                                        <div>
                                            <p style={{ color: '#A8A29E', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Here for</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {user.intents.map(intent => {
                                                    const found = INTENTS.find(i => i.value === intent);
                                                    const color = INTENT_COLORS[intent] ?? '#6B7280';
                                                    return (
                                                        <span key={intent} style={{ padding: '0.35rem 0.9rem', borderRadius: '100px', background: `${color}18`, border: `1px solid ${color}30`, color, fontSize: '0.8125rem', fontWeight: 500 }}>
                                                            {found ? `${found.emoji} ${found.label}` : intent}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {!user.bio && !user.country && (!user.intents || user.intents.length === 0) && (
                                        <p style={{ color: '#57534E', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>
                                            Your profile is looking a bit empty — tap <strong style={{ color: '#D97706' }}>Edit profile</strong> to fill it in.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                /* ── Edit mode ── */
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                    <div>
                                        <label className="huru-label">Display name</label>
                                        <input className="huru-input" value={form.display_name} maxLength={60}
                                            onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} />
                                    </div>

                                    <div>
                                        <label className="huru-label">Pronouns</label>
                                        {!customPronouns ? (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                {PRONOUNS_OPTIONS.map(p => (
                                                    <button key={p} type="button"
                                                        onClick={() => setForm(f => ({ ...f, pronouns: p }))}
                                                        style={{ padding: '0.35rem 0.85rem', borderRadius: '100px', border: `1px solid ${form.pronouns === p ? '#D97706' : 'rgba(255,255,255,0.1)'}`, background: form.pronouns === p ? 'rgba(217,119,6,0.15)' : 'transparent', color: form.pronouns === p ? '#D97706' : '#A8A29E', fontSize: '0.8125rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                                                        {p}
                                                    </button>
                                                ))}
                                                <button type="button" onClick={() => { setCustomPronouns(true); setForm(f => ({ ...f, pronouns: '' })); }}
                                                    style={{ padding: '0.35rem 0.85rem', borderRadius: '100px', border: '1px dashed rgba(255,255,255,0.15)', background: 'transparent', color: '#78716C', fontSize: '0.8125rem', cursor: 'pointer' }}>
                                                    Write my own…
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <input className="huru-input" placeholder="e.g. fae/faer" value={form.pronouns} maxLength={40}
                                                    onChange={e => setForm(f => ({ ...f, pronouns: e.target.value }))} style={{ flex: 1 }} />
                                                <button type="button" onClick={() => setCustomPronouns(false)}
                                                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#A8A29E', fontSize: '0.8125rem', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>
                                                    ← Presets
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="huru-label">Bio <span style={{ color: '#57534E', fontWeight: 400 }}>({300 - form.bio.length} left)</span></label>
                                        <textarea className="huru-input" value={form.bio} maxLength={300} rows={3}
                                            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                                            style={{ resize: 'vertical' }} placeholder="Say something about yourself..." />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div>
                                            <label className="huru-label">Country</label>
                                            <select className="huru-input" value={form.country}
                                                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                                                <option value="">Not specified</option>
                                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="huru-label">City <span style={{ color: '#57534E', fontWeight: 400 }}>(optional)</span></label>
                                            <input className="huru-input" value={form.city} maxLength={80}
                                                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                                placeholder="e.g. Nairobi" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="huru-label">Here for <span style={{ color: '#57534E', fontWeight: 400 }}>(pick all that apply)</span></label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                                            {INTENTS.map(intent => {
                                                const active = form.intents.includes(intent.value);
                                                const color = INTENT_COLORS[intent.value];
                                                return (
                                                    <button key={intent.value} type="button" onClick={() => toggleIntent(intent.value)}
                                                        style={{ padding: '0.4rem 1rem', borderRadius: '100px', border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`, background: active ? `${color}18` : 'transparent', color: active ? color : '#A8A29E', fontSize: '0.8125rem', fontWeight: active ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                                                        {intent.emoji} {intent.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                                        <button onClick={save} disabled={saving}
                                            className="huru-btn huru-btn-primary"
                                            style={{ flex: 1, opacity: saving ? 0.6 : 1 }}>
                                            {saving ? 'Saving…' : 'Save changes'}
                                        </button>
                                        <button onClick={cancelEdit}
                                            className="huru-btn huru-btn-ghost"
                                            style={{ flex: 1 }}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1.25rem' }}>
                        {[
                            { href: '/settings/privacy', icon: '🔒', label: 'Privacy settings' },
                            { href: '/settings/safety', icon: '🛡️', label: 'Safety centre' },
                            { href: '/settings/security', icon: '🔑', label: 'Change password' },
                        ].map(link => (
                            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                                <div style={{ background: '#1C1917', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '1rem', textAlign: 'center', transition: 'border-color 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(217,119,6,0.3)')}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}>
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{link.icon}</div>
                                    <p style={{ color: '#A8A29E', fontSize: '0.75rem', margin: 0 }}>{link.label}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}
