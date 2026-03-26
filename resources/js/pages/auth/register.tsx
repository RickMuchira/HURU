import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

function EyeIcon({ visible }: { visible: boolean }) {
    return visible ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false as boolean,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/register');
    }

    return (
        <>
            <Head title="Join HURU" />

            <div style={{ minHeight: '100vh', background: '#0C0A09', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>

                <div style={{ width: '100%', maxWidth: '440px' }}>
                    {/* Logo */}
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '2rem', color: '#D97706', fontWeight: 600 }}>HURU</span>
                        </Link>
                        <p style={{ color: '#A8A29E', fontSize: '0.9375rem', marginTop: '0.5rem' }}>Create your profile. No real name needed.</p>
                    </div>

                    {/* Card */}
                    <div style={{ background: '#1C1917', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem' }}>
                        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            <div>
                                <label style={{ display: 'block', color: '#A8A29E', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.4rem' }}>
                                    Name <span style={{ color: '#57534E' }}>(not shown publicly — just for account recovery)</span>
                                </label>
                                <input
                                    className="huru-input"
                                    type="text"
                                    placeholder="Any name is fine"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    autoComplete="name"
                                />
                                {errors.name && <p style={{ color: '#EF4444', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.name}</p>}
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#A8A29E', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.4rem' }}>
                                    Email <span style={{ color: '#57534E' }}>(for account recovery only, never shown to anyone)</span>
                                </label>
                                <input
                                    className="huru-input"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    autoComplete="email"
                                />
                                {errors.email && <p style={{ color: '#EF4444', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.email}</p>}
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#A8A29E', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.4rem' }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="huru-input"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="At least 8 characters"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        autoComplete="new-password"
                                        style={{ paddingRight: '2.75rem' }}
                                    />
                                    <button type="button" onClick={() => setShowPassword(v => !v)}
                                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A8A29E', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', minHeight: 'unset', minWidth: 'unset' }}>
                                        <EyeIcon visible={showPassword} />
                                    </button>
                                </div>
                                {errors.password && <p style={{ color: '#EF4444', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.password}</p>}
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#A8A29E', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.4rem' }}>Confirm password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="huru-input"
                                        type={showConfirm ? 'text' : 'password'}
                                        placeholder="Repeat password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        autoComplete="new-password"
                                        style={{ paddingRight: '2.75rem' }}
                                    />
                                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A8A29E', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', minHeight: 'unset', minWidth: 'unset' }}>
                                        <EyeIcon visible={showConfirm} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={data.terms}
                                    onChange={e => setData('terms', e.target.checked)}
                                    style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#D97706', cursor: 'pointer', flexShrink: 0 }}
                                />
                                <label htmlFor="terms" style={{ color: '#A8A29E', fontSize: '0.875rem', lineHeight: 1.5, cursor: 'pointer' }}>
                                    I confirm I am 18 or older and agree to the{' '}
                                    <a href="#" style={{ color: '#D97706', textDecoration: 'none' }}>Terms</a> and{' '}
                                    <a href="#" style={{ color: '#D97706', textDecoration: 'none' }}>Privacy Policy</a>
                                </label>
                            </div>
                            {errors.terms && <p style={{ color: '#EF4444', fontSize: '0.8125rem' }}>{errors.terms}</p>}

                            <button
                                type="submit"
                                disabled={processing}
                                className="huru-btn huru-btn-primary"
                                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', opacity: processing ? 0.6 : 1, cursor: processing ? 'not-allowed' : 'pointer' }}
                            >
                                {processing ? 'Creating your profile…' : 'Create profile'}
                            </button>
                        </form>
                    </div>

                    <p style={{ textAlign: 'center', color: '#57534E', fontSize: '0.875rem', marginTop: '1.5rem' }}>
                        Already on HURU?{' '}
                        <Link href="/login" style={{ color: '#D97706', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </>
    );
}
