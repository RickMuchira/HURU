import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { FormEvent, useState } from 'react';

export default function SpaceCreate() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'public' | 'private'>('public');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    async function submit(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        try {
            const res = await axios.post('/api/spaces', {
                name: name.trim(),
                description: description.trim() || null,
                type,
            });
            const slug = res.data.data.slug;
            router.visit(`/spaces/${slug}`);
        } catch (err: any) {
            const serverErrors = err?.response?.data?.errors;
            if (serverErrors) {
                const flat: Record<string, string> = {};
                for (const key of Object.keys(serverErrors)) {
                    flat[key] = serverErrors[key]?.[0] ?? 'Invalid';
                }
                setErrors(flat);
            } else {
                alert(err?.response?.data?.message ?? 'Could not create space.');
            }
        } finally {
            setProcessing(false);
        }
    }

    return (
        <>
            <Head title="Create Space" />
            <div style={{ minHeight: '100vh', background: '#0C0A09', color: '#FAFAF8', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <nav style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(12,10,9,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/home" style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '1.375rem', color: '#D97706', fontWeight: 600, textDecoration: 'none' }}>HURU</Link>
                    <Link href="/spaces" style={{ color: '#A8A29E', fontSize: '0.875rem', textDecoration: 'none' }}>← Back to spaces</Link>
                </nav>

                <main style={{ maxWidth: '680px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
                    <h1 style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: '2.25rem', fontWeight: 400, margin: 0 }}>Create a space</h1>
                    <p style={{ color: '#A8A29E', marginTop: '0.5rem', marginBottom: '2rem' }}>
                        Spaces are group communities. Public spaces are visible to everyone; private spaces are members-only.
                    </p>

                    <div className="huru-card" style={{ padding: '1.75rem' }}>
                        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={labelStyle}>Name</label>
                                <input className="huru-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mental Health" />
                                {errors.name && <p style={errStyle}>{errors.name}</p>}
                            </div>

                            <div>
                                <label style={labelStyle}>Description <span style={{ color: '#57534E', fontWeight: 400 }}>(optional)</span></label>
                                <textarea className="huru-input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this space for?" style={{ resize: 'vertical' }} />
                                {errors.description && <p style={errStyle}>{errors.description}</p>}
                            </div>

                            <div>
                                <label style={labelStyle}>Visibility</label>
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    <button
                                        type="button"
                                        onClick={() => setType('public')}
                                        style={pill(type === 'public')}
                                    >
                                        🌍 Public
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('private')}
                                        style={pill(type === 'private')}
                                    >
                                        🔒 Private
                                    </button>
                                </div>
                                {errors.type && <p style={errStyle}>{errors.type}</p>}
                                <p style={{ color: '#57534E', fontSize: '0.8125rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                                    Private spaces are hidden from non-members and cannot be joined without an invite (we’ll add invites next).
                                </p>
                            </div>

                            <button type="submit" className="huru-btn huru-btn-primary" disabled={processing || !name.trim()}
                                style={{ width: '100%', padding: '0.75rem 1rem', opacity: processing ? 0.6 : 1, cursor: processing ? 'not-allowed' : 'pointer' }}>
                                {processing ? 'Creating…' : 'Create space'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
}

const labelStyle: React.CSSProperties = { display: 'block', color: '#A8A29E', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' };
const errStyle: React.CSSProperties = { color: '#EF4444', fontSize: '0.8125rem', marginTop: '0.3rem' };
const pill = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 1rem',
    borderRadius: '999px',
    background: active ? 'rgba(217,119,6,0.12)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? 'rgba(217,119,6,0.30)' : 'rgba(255,255,255,0.10)'}`,
    color: active ? '#D97706' : '#A8A29E',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    minHeight: 'unset',
    minWidth: 'unset',
});
