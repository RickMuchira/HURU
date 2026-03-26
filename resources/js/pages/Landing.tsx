import { Head, Link } from '@inertiajs/react';

export default function Landing() {
    return (
        <>
            <Head title="HURU — Find your people. Find your safe place." />

            <div className="min-h-screen" style={{ background: '#0C0A09', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

                {/* ── Navbar ── */}
                <nav style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    background: 'rgba(12,10,9,0.92)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    padding: '0 1.5rem',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '1.625rem', fontWeight: 600, color: '#D97706', letterSpacing: '-0.02em' }}>
                        HURU
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div style={{ display: 'flex', gap: '1.5rem' }} className="hidden md:flex">
                            {['About', 'Spaces', 'Safety'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase()}`} style={{ color: '#A8A29E', fontSize: '0.9rem', fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#FAFAF8')}
                                    onMouseLeave={e => (e.currentTarget.style.color = '#A8A29E')}>
                                    {item}
                                </a>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <Link href="/join" className="huru-btn huru-btn-outline" style={{ padding: '0.45rem 1.1rem', fontSize: '0.875rem', minHeight: 'unset' }}>
                                Join
                            </Link>
                            <Link href="/login" className="huru-btn huru-btn-ghost" style={{ padding: '0.45rem 1.1rem', fontSize: '0.875rem', minHeight: 'unset' }}>
                                Login
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* ── Hero ── */}
                <section style={{
                    minHeight: 'calc(100vh - 64px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '4rem 1.5rem 6rem',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Ambient glow */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -60%)',
                        width: '800px',
                        height: '800px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(217,119,6,0.12) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div style={{ position: 'relative', maxWidth: '780px' }}>
                        <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.03em', margin: 0 }}>
                            <span className="animate-fade-up" style={{ display: 'block', fontSize: 'clamp(3rem, 8vw, 6.5rem)', color: '#FAFAF8' }}>
                                You deserve
                            </span>
                            <span className="animate-fade-up animate-delay-1" style={{ display: 'block', fontSize: 'clamp(3rem, 8vw, 6.5rem)', color: '#FAFAF8' }}>
                                a safe place
                            </span>
                            <span className="animate-fade-up animate-delay-2" style={{ display: 'block', fontSize: 'clamp(3rem, 8vw, 6.5rem)', color: '#D97706' }}>
                                to just be.
                            </span>
                        </h1>

                        <p className="animate-fade-up animate-delay-3" style={{ color: '#A8A29E', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: 300, lineHeight: 1.7, marginTop: '1.75rem', maxWidth: '560px', margin: '1.75rem auto 0' }}>
                            HURU connects LGBTQ+ people worldwide —<br />
                            privately, safely, without compromise.
                        </p>

                        <div className="animate-fade-up animate-delay-4" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2.5rem' }}>
                            <Link href="/join" className="huru-btn huru-btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                                Create your profile
                            </Link>
                            <a href="#how" className="huru-btn huru-btn-ghost" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                                See how it works
                            </a>
                        </div>

                        <p className="animate-fade-up animate-delay-4" style={{ color: '#57534E', fontSize: '0.8125rem', marginTop: '1.25rem' }}>
                            No real name required. No data sold. Ever.
                        </p>
                    </div>

                    {/* Member count badge */}
                    <div style={{
                        position: 'absolute',
                        bottom: '3rem',
                        right: '2rem',
                        background: '#1C1917',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '100px',
                        padding: '0.5rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.8125rem',
                        color: '#A8A29E',
                    }}>
                        <span className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                        2,400+ members worldwide
                    </div>
                </section>

                {/* ── How It Works ── */}
                <section id="how" style={{ padding: '6rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
                    <h2 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#FAFAF8', textAlign: 'center', marginBottom: '3.5rem', fontWeight: 400 }}>
                        Built differently. On purpose.
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {[
                            {
                                icon: '🕶️',
                                title: 'Stay anonymous',
                                body: 'A username is all anyone ever sees. No real name, no phone number, no linked social accounts.',
                            },
                            {
                                icon: '🌍',
                                title: 'Find your people',
                                body: 'Filter by country, what you\'re looking for, and vibe. From Nairobi to São Paulo to Bangkok — everyone is here.',
                            },
                            {
                                icon: '🛡️',
                                title: 'Stay safe',
                                body: 'Ghost mode, encrypted messages, a check-in timer for physical meetups, and a trusted contact system.',
                            },
                        ].map((item) => (
                            <div key={item.title} className="huru-card" style={{ padding: '2rem' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{item.icon}</div>
                                <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: '1.3rem', color: '#FAFAF8', marginBottom: '0.625rem', fontWeight: 600 }}>
                                    {item.title}
                                </h3>
                                <p style={{ color: '#A8A29E', lineHeight: 1.7, fontSize: '0.9375rem' }}>{item.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Spaces Preview ── */}
                <section id="spaces" style={{ padding: '5rem 0', overflow: 'hidden' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
                        <h2 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#FAFAF8', marginBottom: '2.5rem', fontWeight: 400 }}>
                            Join spaces built for you
                        </h2>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', paddingLeft: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                        {[
                            { name: 'Mental Health', members: '842', emoji: '💙' },
                            { name: 'Coming Out', members: '1.2k', emoji: '🌱' },
                            { name: 'Nairobi Meetups', members: '364', emoji: '🇰🇪' },
                            { name: 'Trans Support', members: '617', emoji: '🤍' },
                            { name: 'Book Club', members: '289', emoji: '📚' },
                        ].map((space) => (
                            <div key={space.name} className="huru-card" style={{
                                minWidth: '200px',
                                padding: '1.5rem',
                                flexShrink: 0,
                                cursor: 'pointer',
                            }}>
                                <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{space.emoji}</div>
                                <div style={{ color: '#FAFAF8', fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>{space.name}</div>
                                <div style={{ color: '#A8A29E', fontSize: '0.8125rem', marginBottom: '1rem' }}>{space.members} members</div>
                                <Link href="/join" style={{
                                    display: 'inline-block',
                                    padding: '0.375rem 0.875rem',
                                    background: 'rgba(217,119,6,0.12)',
                                    border: '1px solid rgba(217,119,6,0.25)',
                                    borderRadius: '6px',
                                    color: '#D97706',
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                }}>
                                    Join
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Safety Promise ── */}
                <section id="safety" style={{ padding: '5rem 1.5rem', background: '#0D2D2A' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                        <h2 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', color: '#FAFAF8', marginBottom: '1rem', fontWeight: 400 }}>
                            Safety is not a feature.<br />It's the foundation.
                        </h2>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', margin: '2rem 0' }}>
                            {['No real names', 'Messages encrypted', 'Ghost mode'].map((badge) => (
                                <span key={badge} style={{
                                    background: 'rgba(13,148,136,0.12)',
                                    border: '1px solid rgba(13,148,136,0.3)',
                                    borderRadius: '100px',
                                    padding: '0.4rem 1rem',
                                    color: '#0D9488',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                }}>
                                    ✓ {badge}
                                </span>
                            ))}
                        </div>

                        <p style={{ color: '#A8A29E', lineHeight: 1.8, fontSize: '1rem' }}>
                            In many parts of the world, being yourself is dangerous.
                            HURU was built with that reality at its core — not as an afterthought.
                            Every decision, from how we store data to how we let you disappear instantly,
                            is made with your safety first.
                        </p>
                    </div>
                </section>

                {/* ── Support ── */}
                <section style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: '#FAFAF8', marginBottom: '1rem', fontWeight: 400 }}>
                            Built by one developer.<br />Powered by community.
                        </h2>
                        <p style={{ color: '#A8A29E', lineHeight: 1.8, marginBottom: '2rem' }}>
                            HURU is free, ad-free, and built in Nairobi for the world.
                            Your support keeps it running and independent.
                        </p>
                        <a href="https://buymeacoffee.com/huruapp" target="_blank" rel="noopener noreferrer"
                            className="huru-btn huru-btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem', textDecoration: 'none' }}>
                            ☕ Buy us a coffee
                        </a>
                        <p style={{ color: '#57534E', fontSize: '0.8125rem', marginTop: '0.875rem' }}>
                            M-Pesa and card accepted
                        </p>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2.5rem 1.5rem' }}>
                    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                        <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '1.375rem', color: '#D97706' }}>
                            HURU
                        </span>
                        <p style={{ color: '#57534E', fontSize: '0.8125rem' }}>Find your people. Find your safe place.</p>

                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {[['Privacy', '#'], ['Safety', '#safety'], ['Contact', '#'], ['GitHub', '#']].map(([label, href]) => (
                                <a key={label} href={href} style={{ color: '#57534E', fontSize: '0.8125rem', textDecoration: 'none' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#A8A29E')}
                                    onMouseLeave={e => (e.currentTarget.style.color = '#57534E')}>
                                    {label}
                                </a>
                            ))}
                        </div>

                        <p style={{ color: '#3B3330', fontSize: '0.75rem' }}>Built in Nairobi 🇰🇪 for the world</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
