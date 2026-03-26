import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';

const PRONOUN_OPTIONS = [
    { value: '', label: 'Select pronouns…' },
    { value: 'he/him', label: 'he/him' },
    { value: 'she/her', label: 'she/her' },
    { value: 'they/them', label: 'they/them' },
    { value: 'he/they', label: 'he/they' },
    { value: 'she/they', label: 'she/they' },
    { value: 'xe/xem', label: 'xe/xem' },
    { value: 'any/all', label: 'any/all' },
    { value: 'prefer not to say', label: 'prefer not to say' },
    { value: '__custom__', label: 'Write my own…' },
];

const INTENTS = [
    { value: 'friendship', label: '👋 Friendship' },
    { value: 'support', label: '💙 Support' },
    { value: 'dating', label: '💛 Dating' },
    { value: 'community', label: '✊ Community' },
    { value: 'browsing', label: '👀 Just browsing' },
];

const COUNTRIES = [
    'Afghanistan','Albania','Algeria','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan',
    'Bangladesh','Belarus','Belgium','Benin','Bolivia','Bosnia and Herzegovina','Botswana','Brazil',
    'Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Chile','China','Colombia',
    'Congo','Costa Rica','Croatia','Cuba','Czech Republic','Denmark','Ecuador','Egypt','Ethiopia',
    'Finland','France','Germany','Ghana','Greece','Guatemala','Guinea','Haiti','Honduras','Hungary',
    'India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan',
    'Kazakhstan','Kenya','Kuwait','Laos','Lebanon','Libya','Malaysia','Mali','Mexico','Morocco',
    'Mozambique','Myanmar','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','Norway',
    'Oman','Pakistan','Panama','Paraguay','Peru','Philippines','Poland','Portugal','Romania','Russia',
    'Rwanda','Saudi Arabia','Senegal','Sierra Leone','Somalia','South Africa','South Korea','Spain',
    'Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Tanzania','Thailand','Turkey',
    'Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
    'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

export default function Onboarding() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user!;

    const [step, setStep] = useState(1);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [customPronouns, setCustomPronouns] = useState(false);
    const [pronounOpen, setPronounOpen] = useState(false);
    const [countryOpen, setCountryOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');

    const [form, setForm] = useState({
        username: user.username ?? '',
        display_name: user.display_name ?? '',
        pronouns: user.pronouns ?? '',
        bio: user.bio ?? '',
        country: user.country ?? '',
        city: user.city ?? '',
        location_hidden: user.location_hidden ?? false,
        intents: (user.intents as string[]) ?? [],
        ghost_mode: user.ghost_mode ?? false,
    });

    function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    function toggleIntent(val: string) {
        setForm(prev => ({
            ...prev,
            intents: prev.intents.includes(val)
                ? prev.intents.filter(i => i !== val)
                : [...prev.intents, val],
        }));
    }

    function saveStep(extra: Record<string, unknown> = {}) {
        setProcessing(true);
        setErrors({});

        router.post('/onboarding', { ...form, step, ...extra }, {
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                if (!extra.complete) {
                    setStep(s => s + 1);
                }
            },
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
        });
    }

    const stepTitles = ['Your identity', 'About you', 'Your intentions', 'Stay safe'];

    const filteredCountries = COUNTRIES.filter((c) =>
        c.toLowerCase().includes(countrySearch.trim().toLowerCase()),
    );

    return (
        <>
            <Head title="Set up your profile" />

            <div style={{ minHeight: '100vh', background: '#0C0A09', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>

                {/* Logo */}
                <div style={{ marginBottom: '2rem' }}>
                    <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '1.75rem', color: '#D97706', fontWeight: 600 }}>HURU</span>
                </div>

                {/* Progress dots */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} style={{
                            width: n === step ? '24px' : '8px',
                            height: '8px',
                            borderRadius: '100px',
                            background: n <= step ? '#D97706' : '#292524',
                            transition: 'all 0.3s ease',
                        }} />
                    ))}
                </div>

                <div style={{ width: '100%', maxWidth: '480px' }}>
                    <div style={{ background: '#1C1917', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem' }}>

                        <p style={{ color: '#57534E', fontSize: '0.8125rem', marginBottom: '0.375rem', fontWeight: 500 }}>
                            Step {step} of 4
                        </p>
                        <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '1.75rem', color: '#FAFAF8', marginBottom: '1.75rem', fontWeight: 400 }}>
                            {stepTitles[step - 1]}
                        </h1>

                        {/* ── Step 1 ── */}
                        {step === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={labelStyle}>Username <span style={{ color: '#D97706' }}>*</span></label>
                                    <p style={hintStyle}>This is the only name anyone on HURU will ever see</p>
                                    <input className="huru-input" type="text" placeholder="e.g. starlight_leo" value={form.username}
                                        onChange={e => set('username', e.target.value)} />
                                    {errors.username && <p style={errStyle}>{errors.username}</p>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Display name <span style={optStyle}>(optional)</span></label>
                                    <input className="huru-input" type="text" placeholder="A friendly name" value={form.display_name}
                                        onChange={e => set('display_name', e.target.value)} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Pronouns <span style={optStyle}>(optional)</span></label>
                                    {!customPronouns ? (
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                type="button"
                                                onClick={() => setPronounOpen(v => !v)}
                                                className="huru-input"
                                                style={{
                                                    textAlign: 'left',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '0.75rem',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <span style={{ color: form.pronouns ? '#FAFAF8' : '#A8A29E' }}>
                                                    {form.pronouns
                                                        ? (PRONOUN_OPTIONS.find(o => o.value === form.pronouns)?.label ?? form.pronouns)
                                                        : 'Select pronouns…'}
                                                </span>
                                                <span style={{ color: '#57534E', fontSize: '0.75rem' }}>{pronounOpen ? '▲' : '▼'}</span>
                                            </button>

                                            {pronounOpen && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPronounOpen(false)}
                                                        style={{
                                                            position: 'fixed',
                                                            inset: 0,
                                                            background: 'transparent',
                                                            border: 'none',
                                                            padding: 0,
                                                            margin: 0,
                                                            cursor: 'default',
                                                        }}
                                                        aria-label="Close pronouns dropdown"
                                                    />
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            zIndex: 60,
                                                            left: 0,
                                                            right: 0,
                                                            marginTop: '0.5rem',
                                                            background: '#1C1917',
                                                            border: '1px solid rgba(255,255,255,0.10)',
                                                            borderRadius: '12px',
                                                            padding: '0.35rem',
                                                            boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
                                                            maxHeight: '240px',
                                                            overflow: 'auto',
                                                        }}
                                                    >
                                                        {PRONOUN_OPTIONS.map((o) => {
                                                            const active = (o.value !== '__custom__' && o.value === form.pronouns) || (!form.pronouns && o.value === '');
                                                            return (
                                                                <button
                                                                    key={o.value}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (o.value === '__custom__') {
                                                                            setCustomPronouns(true);
                                                                            set('pronouns', '');
                                                                        } else {
                                                                            set('pronouns', o.value);
                                                                        }
                                                                        setPronounOpen(false);
                                                                    }}
                                                                    style={{
                                                                        width: '100%',
                                                                        textAlign: 'left',
                                                                        padding: '0.6rem 0.75rem',
                                                                        borderRadius: '10px',
                                                                        background: active ? 'rgba(217,119,6,0.12)' : 'transparent',
                                                                        border: active ? '1px solid rgba(217,119,6,0.30)' : '1px solid transparent',
                                                                        color: active ? '#D97706' : '#D4CFC9',
                                                                        cursor: 'pointer',
                                                                        fontSize: '0.9rem',
                                                                        minHeight: 'unset',
                                                                        minWidth: 'unset',
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        if (!active) e.currentTarget.style.background = 'transparent';
                                                                    }}
                                                                >
                                                                    {o.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <input className="huru-input" type="text" placeholder="e.g. fae/faer" value={form.pronouns}
                                                onChange={e => set('pronouns', e.target.value)} autoFocus />
                                            <button type="button" onClick={() => { setCustomPronouns(false); set('pronouns', ''); }}
                                                style={{ padding: '0 0.875rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#A8A29E', fontSize: '0.8125rem', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 'unset', minWidth: 'unset' }}>
                                                ← List
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Step 2 ── */}
                        {step === 2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={labelStyle}>Bio <span style={optStyle}>(optional)</span></label>
                                    <textarea className="huru-input" rows={3} placeholder="Tell people a little about yourself…"
                                        value={form.bio} onChange={e => set('bio', e.target.value.slice(0, 160))}
                                        style={{ resize: 'vertical' }} />
                                    <p style={{ color: '#57534E', fontSize: '0.75rem', textAlign: 'right', marginTop: '0.25rem' }}>
                                        {form.bio.length}/160
                                    </p>
                                </div>
                                <div>
                                    <label style={labelStyle}>Country <span style={optStyle}>(optional)</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCountryOpen((v) => !v);
                                                setCountrySearch('');
                                            }}
                                            className="huru-input"
                                            style={{
                                                textAlign: 'left',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '0.75rem',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <span style={{ color: form.country ? '#FAFAF8' : '#A8A29E' }}>
                                                {form.country || 'Select country…'}
                                            </span>
                                            <span style={{ color: '#57534E', fontSize: '0.75rem' }}>{countryOpen ? '▲' : '▼'}</span>
                                        </button>

                                        {countryOpen && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setCountryOpen(false)}
                                                    style={{
                                                        position: 'fixed',
                                                        inset: 0,
                                                        background: 'transparent',
                                                        border: 'none',
                                                        padding: 0,
                                                        margin: 0,
                                                        cursor: 'default',
                                                    }}
                                                    aria-label="Close country dropdown"
                                                />
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        zIndex: 60,
                                                        left: 0,
                                                        right: 0,
                                                        marginTop: '0.5rem',
                                                        background: '#1C1917',
                                                        border: '1px solid rgba(255,255,255,0.10)',
                                                        borderRadius: '12px',
                                                        padding: '0.5rem',
                                                        boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
                                                    }}
                                                >
                                                    <input
                                                        className="huru-input"
                                                        value={countrySearch}
                                                        onChange={(e) => setCountrySearch(e.target.value)}
                                                        placeholder="Search country…"
                                                        autoFocus
                                                        style={{ padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}
                                                    />
                                                    <div
                                                        style={{
                                                            maxHeight: '220px',
                                                            overflow: 'auto',
                                                            paddingRight: '0.15rem',
                                                        }}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                set('country', '');
                                                                setCountryOpen(false);
                                                            }}
                                                            style={{
                                                                width: '100%',
                                                                textAlign: 'left',
                                                                padding: '0.6rem 0.75rem',
                                                                borderRadius: '10px',
                                                                background: !form.country ? 'rgba(217,119,6,0.12)' : 'transparent',
                                                                border: !form.country ? '1px solid rgba(217,119,6,0.30)' : '1px solid transparent',
                                                                color: !form.country ? '#D97706' : '#D4CFC9',
                                                                cursor: 'pointer',
                                                                fontSize: '0.9rem',
                                                                minHeight: 'unset',
                                                                minWidth: 'unset',
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (form.country) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (form.country) e.currentTarget.style.background = 'transparent';
                                                            }}
                                                        >
                                                            All / Prefer not to say
                                                        </button>

                                                        {filteredCountries.length === 0 ? (
                                                            <div style={{ color: '#57534E', fontSize: '0.8125rem', padding: '0.75rem' }}>
                                                                No matches.
                                                            </div>
                                                        ) : (
                                                            filteredCountries.map((c) => {
                                                                const active = c === form.country;
                                                                return (
                                                                    <button
                                                                        key={c}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            set('country', c);
                                                                            setCountryOpen(false);
                                                                        }}
                                                                        style={{
                                                                            width: '100%',
                                                                            textAlign: 'left',
                                                                            padding: '0.6rem 0.75rem',
                                                                            borderRadius: '10px',
                                                                            background: active ? 'rgba(217,119,6,0.12)' : 'transparent',
                                                                            border: active ? '1px solid rgba(217,119,6,0.30)' : '1px solid transparent',
                                                                            color: active ? '#D97706' : '#D4CFC9',
                                                                            cursor: 'pointer',
                                                                            fontSize: '0.9rem',
                                                                            minHeight: 'unset',
                                                                            minWidth: 'unset',
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            if (!active) e.currentTarget.style.background = 'transparent';
                                                                        }}
                                                                    >
                                                                        {c}
                                                                    </button>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>City <span style={optStyle}>(optional)</span></label>
                                    <input className="huru-input" type="text" placeholder="e.g. Nairobi" value={form.city}
                                        onChange={e => set('city', e.target.value)} />
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.location_hidden} onChange={e => set('location_hidden', e.target.checked)}
                                        style={{ width: '16px', height: '16px', accentColor: '#D97706', flexShrink: 0 }} />
                                    <span style={{ color: '#A8A29E', fontSize: '0.875rem' }}>Hide my location from my profile</span>
                                </label>
                            </div>
                        )}

                        {/* ── Step 3 ── */}
                        {step === 3 && (
                            <div>
                                <p style={{ color: '#A8A29E', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                                    What brings you to HURU? Pick all that apply. This is private — it's used to show you relevant people and spaces.
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                                    {INTENTS.map(intent => {
                                        const active = form.intents.includes(intent.value);
                                        return (
                                            <button key={intent.value} type="button" onClick={() => toggleIntent(intent.value)}
                                                style={{
                                                    padding: '0.5rem 1.1rem',
                                                    borderRadius: '100px',
                                                    border: `1.5px solid ${active ? '#D97706' : 'rgba(255,255,255,0.12)'}`,
                                                    background: active ? 'rgba(217,119,6,0.12)' : 'transparent',
                                                    color: active ? '#D97706' : '#A8A29E',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s ease',
                                                    minHeight: 'unset',
                                                    minWidth: 'unset',
                                                }}>
                                                {intent.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* ── Step 4 ── */}
                        {step === 4 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.2)', borderRadius: '10px', padding: '1.25rem' }}>
                                    <h3 style={{ color: '#0D9488', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>🛡️ Ghost mode</h3>
                                    <p style={{ color: '#A8A29E', fontSize: '0.875rem', lineHeight: 1.6 }}>
                                        When ghost mode is on, you won't appear in member discovery, your online status is hidden, and your profile shows as private to non-connections. You can toggle this any time from Settings → Safety.
                                    </p>
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: '#292524', borderRadius: '10px', padding: '1rem' }}>
                                    <div style={{
                                        width: '44px', height: '24px', borderRadius: '100px', flexShrink: 0, position: 'relative',
                                        background: form.ghost_mode ? '#D97706' : 'rgba(255,255,255,0.12)',
                                        transition: 'background 0.2s ease',
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: '3px',
                                            left: form.ghost_mode ? '23px' : '3px',
                                            width: '18px', height: '18px', borderRadius: '50%', background: '#FAFAF8',
                                            transition: 'left 0.2s ease',
                                        }} />
                                        <input type="checkbox" checked={form.ghost_mode} onChange={e => set('ghost_mode', e.target.checked)}
                                            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                                    </div>
                                    <div>
                                        <div style={{ color: '#FAFAF8', fontSize: '0.9375rem', fontWeight: 500 }}>Enable ghost mode</div>
                                        <div style={{ color: '#57534E', fontSize: '0.8125rem' }}>You can change this any time</div>
                                    </div>
                                </label>

                                <div style={{ background: '#292524', borderRadius: '10px', padding: '1rem' }}>
                                    <h3 style={{ color: '#A8A29E', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.375rem' }}>🔒 Check-in timer</h3>
                                    <p style={{ color: '#57534E', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                                        When you plan a physical meetup, set a timer. If you don't tap "I'm safe" before it expires, your trusted contact is notified. Set this up later in Settings → Safety.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
                            {step > 1 && (
                                <button type="button" onClick={() => setStep(s => s - 1)}
                                    className="huru-btn huru-btn-ghost"
                                    style={{ flex: 1, padding: '0.75rem', fontSize: '0.9375rem', minHeight: 'unset' }}>
                                    Back
                                </button>
                            )}
                            {step < 4 ? (
                                <button type="button" onClick={() => saveStep()}
                                    disabled={processing}
                                    className="huru-btn huru-btn-primary"
                                    style={{ flex: 2, padding: '0.75rem', fontSize: '0.9375rem', opacity: processing ? 0.6 : 1, cursor: processing ? 'not-allowed' : 'pointer', minHeight: 'unset' }}>
                                    {processing ? 'Saving…' : 'Continue →'}
                                </button>
                            ) : (
                                <button type="button" onClick={() => saveStep({ complete: true })}
                                    disabled={processing}
                                    className="huru-btn huru-btn-primary"
                                    style={{ flex: 2, padding: '0.75rem', fontSize: '0.9375rem', opacity: processing ? 0.6 : 1, cursor: processing ? 'not-allowed' : 'pointer', minHeight: 'unset' }}>
                                    {processing ? 'Setting up…' : 'Finish setup →'}
                                </button>
                            )}
                        </div>
                    </div>

                    <p style={{ textAlign: 'center', color: '#57534E', fontSize: '0.8125rem', marginTop: '1.25rem' }}>
                        You can edit all of this later from your profile settings.
                    </p>
                </div>
            </div>
        </>
    );
}

const labelStyle: React.CSSProperties = { display: 'block', color: '#A8A29E', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.25rem' };
const hintStyle: React.CSSProperties = { color: '#57534E', fontSize: '0.75rem', marginBottom: '0.4rem' };
const optStyle: React.CSSProperties = { color: '#57534E', fontWeight: 400 };
const errStyle: React.CSSProperties = { color: '#EF4444', fontSize: '0.8125rem', marginTop: '0.25rem' };
