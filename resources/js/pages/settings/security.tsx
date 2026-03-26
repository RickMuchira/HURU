import { Head, Link } from '@inertiajs/react';

export default function SettingsSecurity() {
    return (
        <>
            <Head title="Security Settings" />
            <div style={{ minHeight: '100vh', background: '#0C0A09', color: '#FAFAF8', fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '2rem 1.5rem' }}>
                <div style={{ maxWidth: '560px', margin: '0 auto' }}>
                    <Link href="/home" style={{ color: '#A8A29E', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2rem' }}>
                        ← Back to home
                    </Link>
                    <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '2rem', color: '#FAFAF8', marginBottom: '2rem', fontWeight: 400 }}>Security settings</h1>
                    <div style={{ background: '#1C1917', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem' }}>
                        <p style={{ color: '#A8A29E', fontSize: '0.9rem' }}>Password change and two-factor authentication — coming soon.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
