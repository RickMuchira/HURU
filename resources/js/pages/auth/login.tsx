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

interface Props {
    status?: string;
    canResetPassword?: boolean;
}

export default function Login({ status, canResetPassword }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });
    const [showPassword, setShowPassword] = useState(false);

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/login');
    }

    return (
        <>
            <Head title="Sign in to HURU" />

            <div style={{ minHeight: '100vh', background: '#0C0A09', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>

                <div style={{ width: '100%', maxWidth: '440px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <Link href="/" style={{ textDecoration: 'none' }}>
                            <span style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '2rem', color: '#D97706', fontWeight: 600 }}>HURU</span>
                        </Link>
                        <p style={{ color: '#A8A29E', fontSize: '0.9375rem', marginTop: '0.5rem' }}>Welcome back.</p>
                    </div>

                    {status && (
                        <div style={{ background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', color: '#0D9488', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                            {status}
                        </div>
                    )}

                    <div style={{ background: '#1C1917', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem' }}>
                        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            <div>
                                <label style={{ display: 'block', color: '#A8A29E', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.4rem' }}>Email</label>
                                <input
                                    className="huru-input"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    autoFocus
                                    autoComplete="email"
                                />
                                {errors.email && <p style={{ color: '#EF4444', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.email}</p>}
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <label style={{ color: '#A8A29E', fontSize: '0.8125rem', fontWeight: 500 }}>Password</label>
                                    {canResetPassword && (
                                        <Link href="/forgot-password" style={{ color: '#D97706', fontSize: '0.8125rem', textDecoration: 'none' }}>
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="huru-input"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Your password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        autoComplete="current-password"
                                        style={{ paddingRight: '2.75rem' }}
                                    />
                                    <button type="button" onClick={() => setShowPassword(v => !v)}
                                        style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#A8A29E', cursor: 'pointer', padding: '0', display: 'flex', alignItems: 'center', minHeight: 'unset', minWidth: 'unset' }}>
                                        <EyeIcon visible={showPassword} />
                                    </button>
                                </div>
                                {errors.password && <p style={{ color: '#EF4444', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.password}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="huru-btn huru-btn-primary"
                                style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', opacity: processing ? 0.6 : 1, cursor: processing ? 'not-allowed' : 'pointer' }}
                            >
                                {processing ? 'Signing in…' : 'Sign in'}
                            </button>
                        </form>
                    </div>

                    <p style={{ textAlign: 'center', color: '#57534E', fontSize: '0.875rem', marginTop: '1.5rem' }}>
                        New to HURU?{' '}
                        <Link href="/join" style={{ color: '#D97706', textDecoration: 'none', fontWeight: 500 }}>Create your profile</Link>
                    </p>
                </div>
            </div>
        </>
    );
}
