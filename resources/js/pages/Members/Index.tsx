import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps, User } from '@/types';

interface PaginatedMembers {
    data: User[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        last_page: number;
        total: number;
    };
}

interface Props extends PageProps {
    members: PaginatedMembers;
    filters: { country?: string; intent?: string; search?: string };
    countries: string[];
}

const INTENTS = [
    { value: 'friendship', label: '👋 Friendship' },
    { value: 'support', label: '💙 Support' },
    { value: 'community', label: '✊ Community' },
    { value: 'romance', label: '💛 Romance' },
];

const INTENT_COLORS: Record<string, string> = {
    friendship: '#D97706',
    support: '#3B82F6',
    romance: '#EC4899',
    community: '#8B5CF6',
};

function MemberCard({ member }: { member: User }) {
    const initials = (member.username ?? 'U')[0].toUpperCase();

    return (
        <Link href={`/members/${member.username}`} style={{ textDecoration: 'none' }}>
            <div className="huru-card" style={{ padding: '1.5rem', cursor: 'pointer' }}>
                {/* Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                    {member.avatar_url ? (
                        <img src={member.avatar_url} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #D97706, #B45309)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.1rem', fontWeight: 700, color: '#0C0A09', flexShrink: 0,
                        }}>
                            {initials}
                        </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                        <div style={{ color: '#FAFAF8', fontWeight: 600, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            @{member.username}
                        </div>
                        {member.pronouns && (
                            <div style={{ color: '#A8A29E', fontSize: '0.75rem' }}>{member.pronouns}</div>
                        )}
                    </div>
                </div>

                {/* Bio */}
                {member.bio && (
                    <p style={{ color: '#A8A29E', fontSize: '0.8125rem', lineHeight: 1.5, marginBottom: '0.875rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {member.bio}
                    </p>
                )}

                {/* Location */}
                {(member.country || member.city) && (
                    <div style={{ color: '#57534E', fontSize: '0.75rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        📍 {[member.city, member.country].filter(Boolean).join(', ')}
                    </div>
                )}

                {/* Intent pills */}
                {member.intents && member.intents.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {member.intents.slice(0, 3).map(intent => (
                            <span key={intent} style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: '100px',
                                background: `${INTENT_COLORS[intent] ?? '#6B7280'}18`,
                                border: `1px solid ${INTENT_COLORS[intent] ?? '#6B7280'}30`,
                                color: INTENT_COLORS[intent] ?? '#6B7280',
                                fontSize: '0.7rem',
                                fontWeight: 500,
                            }}>
                                {INTENTS.find(i => i.value === intent)?.label ?? intent}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}

export default function MembersIndex({ members, filters, countries }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [selectedCountry, setSelectedCountry] = useState(filters.country ?? '');
    const [selectedIntent, setSelectedIntent] = useState(filters.intent ?? '');

    function applyFilters() {
        router.get('/members', {
            ...(search && { search }),
            ...(selectedCountry && { country: selectedCountry }),
            ...(selectedIntent && { intent: selectedIntent }),
        }, { preserveState: true, replace: true });
    }

    function clearFilters() {
        setSearch('');
        setSelectedCountry('');
        setSelectedIntent('');
        router.get('/members', {}, { preserveState: true, replace: true });
    }

    const hasFilters = !!(search || selectedCountry || selectedIntent);

    return (
        <>
            <Head title="Members" />

            <div style={{ minHeight: '100vh', background: '#0C0A09', color: '#FAFAF8', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

                {/* Topbar */}
                <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(12,10,9,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/home" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '1.375rem', color: '#D97706', fontWeight: 600, textDecoration: 'none' }}>HURU</Link>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {[{ label: 'Members', href: '/members' }, { label: 'Spaces', href: '/spaces' }, { label: 'Messages', href: '/messages' }].map(link => (
                            <Link key={link.label} href={link.href} style={{ padding: '0.375rem 0.875rem', borderRadius: '8px', color: link.href === '/members' ? '#D97706' : '#A8A29E', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>{link.label}</Link>
                        ))}
                    </div>
                    <Link href="/profile" style={{ textDecoration: 'none' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 700, color: '#0C0A09' }}>
                            {(usePage<PageProps>().props.auth.user?.username ?? 'U')[0].toUpperCase()}
                        </div>
                    </Link>
                </nav>

                <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>

                    <div style={{ marginBottom: '2rem' }}>
                        <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: '#FAFAF8', fontWeight: 400, marginBottom: '0.375rem' }}>
                            Find your people
                        </h1>
                        <p style={{ color: '#A8A29E', fontSize: '0.9375rem' }}>
                            {members.meta.total.toLocaleString()} {members.meta.total === 1 ? 'member' : 'members'} worldwide
                        </p>
                    </div>

                    {/* Filters */}
                    <div style={{ background: '#1C1917', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>

                            <div style={{ flex: '1 1 200px' }}>
                                <label style={{ display: 'block', color: '#A8A29E', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.3rem' }}>Search</label>
                                <input className="huru-input" placeholder="Username or bio…" value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                    style={{ padding: '0.5rem 0.75rem' }} />
                            </div>

                            <div style={{ flex: '1 1 160px' }}>
                                <label style={{ display: 'block', color: '#A8A29E', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.3rem' }}>Country</label>
                                <select className="huru-input" value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} style={{ padding: '0.5rem 0.75rem', appearance: 'auto' }}>
                                    <option value="">All countries</option>
                                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div style={{ flex: '1 1 160px' }}>
                                <label style={{ display: 'block', color: '#A8A29E', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.3rem' }}>Looking for</label>
                                <select className="huru-input" value={selectedIntent} onChange={e => setSelectedIntent(e.target.value)} style={{ padding: '0.5rem 0.75rem', appearance: 'auto' }}>
                                    <option value="">Any</option>
                                    {INTENTS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={applyFilters} className="huru-btn huru-btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem', minHeight: 'unset' }}>
                                    Search
                                </button>
                                {hasFilters && (
                                    <button onClick={clearFilters} className="huru-btn huru-btn-ghost" style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem', minHeight: 'unset' }}>
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    {members.data.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#57534E' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌍</div>
                            <p style={{ fontSize: '1.1rem', color: '#A8A29E', marginBottom: '0.5rem' }}>No members found</p>
                            <p style={{ fontSize: '0.875rem' }}>Try adjusting your filters</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                            {members.data.map(member => (
                                <MemberCard key={member.id} member={member} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {members.meta.last_page > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
                            {members.links.prev && (
                                <Link href={members.links.prev} className="huru-btn huru-btn-ghost" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', minHeight: 'unset', textDecoration: 'none' }}>
                                    ← Previous
                                </Link>
                            )}
                            <span style={{ padding: '0.5rem 1rem', color: '#A8A29E', fontSize: '0.875rem', display: 'flex', alignItems: 'center' }}>
                                Page {members.meta.current_page} of {members.meta.last_page}
                            </span>
                            {members.links.next && (
                                <Link href={members.links.next} className="huru-btn huru-btn-ghost" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem', minHeight: 'unset', textDecoration: 'none' }}>
                                    Next →
                                </Link>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
