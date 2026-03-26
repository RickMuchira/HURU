import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import type { PageProps } from '@/types';

export default function SettingsProfile() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user!;

    const { data, setData, patch, processing, errors } = useForm({
        name: user.name ?? '',
        email: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        patch('/settings/profile');
    }

    return (
        <>
            <Head title="Profile Settings" />
            <div style={{ minHeight: '100vh', background: '#0C0A09', color: '#FAFAF8', fontFamily: 'Plus Jakarta Sans, sans-serif', padding: '2rem 1.5rem' }}>
                <div style={{ maxWidth: '560px', margin: '0 auto' }}>
                    <Link href="/home" style={{ color: '#A8A29E', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', marginBottom: '2rem' }}>
                        ← Back to home
                    </Link>
                    <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '2rem', color: '#FAFAF8', marginBottom: '0.5rem', fontWeight: 400 }}>Profile settings</h1>
                    <p style={{ color: '#A8A29E', marginBottom: '2rem', fontSize: '0.9375rem' }}>
                        Update your display name and onboarding info from the{' '}
                        <Link href="/onboarding" style={{ color: '#D97706', textDecoration: 'none' }}>onboarding page</Link>.
                    </p>
                    <div style={{ background: '#1C1917', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2rem' }}>
                        <p style={{ color: '#A8A29E', fontSize: '0.9rem' }}>More profile settings coming soon.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
