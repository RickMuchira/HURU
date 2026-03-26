import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface TrustedContact {
    id: number;
    name: string;
    safe_channel: string;
    notes: string | null;
}

interface Checkin {
    id: number;
    meet_description: string;
    location_hint: string | null;
    expected_end_at: string;
    status: 'active' | 'safe' | 'missed' | 'cancelled';
    trusted_contact_id: number | null;
    created_at: string;
}

export default function SettingsSafety() {
    const [contacts, setContacts] = useState<TrustedContact[]>([]);
    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingCheckins, setLoadingCheckins] = useState(true);

    // Add contact form
    const [showAddContact, setShowAddContact] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', safe_channel: '', notes: '' });
    const [contactSaving, setContactSaving] = useState(false);
    const [contactError, setContactError] = useState<string | null>(null);

    // Add check-in form
    const [showAddCheckin, setShowAddCheckin] = useState(false);
    const [checkinForm, setCheckinForm] = useState({
        meet_description: '',
        location_hint: '',
        expected_end_at: '',
        trusted_contact_id: '',
    });
    const [checkinSaving, setCheckinSaving] = useState(false);
    const [checkinError, setCheckinError] = useState<string | null>(null);

    // Account deletion
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deletePending, setDeletePending] = useState(false);

    useEffect(() => {
        loadContacts();
        loadCheckins();
    }, []);

    async function loadContacts() {
        setLoadingContacts(true);
        try {
            const res = await axios.get('/api/safety/trusted-contacts');
            setContacts(res.data?.data ?? []);
        } finally {
            setLoadingContacts(false);
        }
    }

    async function loadCheckins() {
        setLoadingCheckins(true);
        try {
            const res = await axios.get('/api/safety/checkins');
            setCheckins(res.data?.data ?? []);
        } finally {
            setLoadingCheckins(false);
        }
    }

    async function addContact(e: React.FormEvent) {
        e.preventDefault();
        setContactError(null);
        setContactSaving(true);
        try {
            await axios.post('/api/safety/trusted-contacts', contactForm);
            setContactForm({ name: '', safe_channel: '', notes: '' });
            setShowAddContact(false);
            loadContacts();
        } catch (err: any) {
            setContactError(err.response?.data?.message ?? 'Failed to add contact.');
        } finally {
            setContactSaving(false);
        }
    }

    async function removeContact(id: number) {
        if (!confirm('Remove this trusted contact?')) return;
        await axios.delete(`/api/safety/trusted-contacts/${id}`);
        setContacts((prev) => prev.filter((c) => c.id !== id));
    }

    async function startCheckin(e: React.FormEvent) {
        e.preventDefault();
        setCheckinError(null);
        setCheckinSaving(true);
        try {
            await axios.post('/api/safety/checkins', {
                ...checkinForm,
                trusted_contact_id: checkinForm.trusted_contact_id || null,
            });
            setCheckinForm({ meet_description: '', location_hint: '', expected_end_at: '', trusted_contact_id: '' });
            setShowAddCheckin(false);
            loadCheckins();
        } catch (err: any) {
            setCheckinError(err.response?.data?.message ?? 'Failed to start check-in.');
        } finally {
            setCheckinSaving(false);
        }
    }

    async function updateCheckinStatus(id: number, status: 'safe' | 'cancelled') {
        try {
            const res = await axios.put(`/api/safety/checkins/${id}`, { status });
            setCheckins((prev) => prev.map((c) => (c.id === id ? res.data.data : c)));
        } catch {
            alert('Failed to update check-in.');
        }
    }

    async function requestDeletion(e: React.FormEvent) {
        e.preventDefault();
        setDeleteError(null);
        setDeletePending(true);
        try {
            await axios.post('/api/me/request-deletion', { password: deletePassword });
            window.location.href = '/';
        } catch (err: any) {
            setDeleteError(err.response?.data?.message ?? 'Failed to request deletion. Check your password.');
        } finally {
            setDeletePending(false);
        }
    }

    const statusBadge = (status: Checkin['status']) => {
        const map: Record<Checkin['status'], string> = {
            active: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
            safe: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
            missed: 'bg-red-500/20 text-red-300 border border-red-500/30',
            cancelled: 'bg-stone-500/20 text-stone-400 border border-stone-500/30',
        };
        return map[status];
    };

    return (
        <>
            <Head title="Safety Centre — HURU" />
            <div className="min-h-screen bg-huru-bg text-huru-text">
                {/* Header */}
                <header className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
                    <Link href="/home" className="text-stone-400 hover:text-white transition-colors text-sm">
                        ← Home
                    </Link>
                    <h1 className="font-display text-xl text-white">Safety Centre</h1>
                </header>

                <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">

                    {/* Ghost Mode reminder */}
                    <div className="huru-card p-4 flex items-start gap-3">
                        <span className="text-2xl">👻</span>
                        <div>
                            <p className="font-medium text-white text-sm">Ghost mode</p>
                            <p className="text-stone-400 text-sm mt-0.5">
                                Toggle ghost mode in{' '}
                                <Link href="/settings/privacy" className="text-huru-gold underline underline-offset-2">
                                    Privacy Settings
                                </Link>{' '}
                                to disappear from member discovery instantly.
                            </p>
                        </div>
                    </div>

                    {/* Trusted Contacts */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-display text-lg text-white">Trusted Contacts</h2>
                                <p className="text-stone-400 text-sm mt-0.5">
                                    People you trust to check in with before a physical meetup.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddContact((v) => !v)}
                                className="huru-btn-sm"
                            >
                                {showAddContact ? 'Cancel' : '+ Add'}
                            </button>
                        </div>

                        {showAddContact && (
                            <form onSubmit={addContact} className="huru-card p-4 mb-4 space-y-3">
                                <div>
                                    <label className="huru-label">Name</label>
                                    <input
                                        className="huru-input"
                                        placeholder="e.g. Maria"
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="huru-label">Safe contact channel</label>
                                    <input
                                        className="huru-input"
                                        placeholder="e.g. Signal: +254700000000"
                                        value={contactForm.safe_channel}
                                        onChange={(e) => setContactForm((f) => ({ ...f, safe_channel: e.target.value }))}
                                        required
                                    />
                                    <p className="text-stone-500 text-xs mt-1">
                                        Use Signal, WhatsApp number, email — whatever is safe for them.
                                    </p>
                                </div>
                                <div>
                                    <label className="huru-label">Notes (optional)</label>
                                    <textarea
                                        className="huru-input resize-none"
                                        rows={2}
                                        placeholder="Anything they should know..."
                                        value={contactForm.notes}
                                        onChange={(e) => setContactForm((f) => ({ ...f, notes: e.target.value }))}
                                    />
                                </div>
                                {contactError && <p className="text-red-400 text-sm">{contactError}</p>}
                                <button type="submit" className="huru-btn w-full" disabled={contactSaving}>
                                    {contactSaving ? 'Saving…' : 'Save contact'}
                                </button>
                            </form>
                        )}

                        {loadingContacts ? (
                            <div className="space-y-2">
                                {[1, 2].map((i) => (
                                    <div key={i} className="huru-card p-4 animate-pulse h-16" />
                                ))}
                            </div>
                        ) : contacts.length === 0 ? (
                            <div className="huru-card p-6 text-center text-stone-400 text-sm">
                                No trusted contacts yet. Add someone you trust before meeting anyone.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {contacts.map((c) => (
                                    <div key={c.id} className="huru-card p-4 flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-medium text-white text-sm">{c.name}</p>
                                            <p className="text-stone-400 text-xs mt-0.5">{c.safe_channel}</p>
                                            {c.notes && <p className="text-stone-500 text-xs mt-1 italic">{c.notes}</p>}
                                        </div>
                                        <button
                                            onClick={() => removeContact(c.id)}
                                            className="text-stone-500 hover:text-red-400 transition-colors text-xs shrink-0"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Safety Check-ins */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-display text-lg text-white">Safety Check-ins</h2>
                                <p className="text-stone-400 text-sm mt-0.5">
                                    Planning to meet someone? Start a check-in. Mark yourself safe when you're done.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddCheckin((v) => !v)}
                                className="huru-btn-sm"
                            >
                                {showAddCheckin ? 'Cancel' : '+ Start'}
                            </button>
                        </div>

                        {showAddCheckin && (
                            <form onSubmit={startCheckin} className="huru-card p-4 mb-4 space-y-3">
                                <div>
                                    <label className="huru-label">What's the plan?</label>
                                    <input
                                        className="huru-input"
                                        placeholder="e.g. Coffee at a café downtown"
                                        value={checkinForm.meet_description}
                                        onChange={(e) => setCheckinForm((f) => ({ ...f, meet_description: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="huru-label">Rough location (optional)</label>
                                    <input
                                        className="huru-input"
                                        placeholder="e.g. Westlands, Nairobi"
                                        value={checkinForm.location_hint}
                                        onChange={(e) => setCheckinForm((f) => ({ ...f, location_hint: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="huru-label">Expected to be done by</label>
                                    <input
                                        type="datetime-local"
                                        className="huru-input"
                                        value={checkinForm.expected_end_at}
                                        onChange={(e) => setCheckinForm((f) => ({ ...f, expected_end_at: e.target.value }))}
                                        required
                                    />
                                </div>
                                {contacts.length > 0 && (
                                    <div>
                                        <label className="huru-label">Notify trusted contact (optional)</label>
                                        <select
                                            className="huru-input"
                                            value={checkinForm.trusted_contact_id}
                                            onChange={(e) => setCheckinForm((f) => ({ ...f, trusted_contact_id: e.target.value }))}
                                        >
                                            <option value="">None</option>
                                            {contacts.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {checkinError && <p className="text-red-400 text-sm">{checkinError}</p>}
                                <button type="submit" className="huru-btn w-full" disabled={checkinSaving}>
                                    {checkinSaving ? 'Starting…' : 'Start check-in'}
                                </button>
                            </form>
                        )}

                        {loadingCheckins ? (
                            <div className="space-y-2">
                                {[1, 2].map((i) => <div key={i} className="huru-card p-4 animate-pulse h-20" />)}
                            </div>
                        ) : checkins.length === 0 ? (
                            <div className="huru-card p-6 text-center text-stone-400 text-sm">
                                No check-ins yet. Always start one before meeting someone new.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {checkins.map((c) => (
                                    <div key={c.id} className="huru-card p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white text-sm truncate">{c.meet_description}</p>
                                                {c.location_hint && (
                                                    <p className="text-stone-400 text-xs mt-0.5">📍 {c.location_hint}</p>
                                                )}
                                                <p className="text-stone-500 text-xs mt-1">
                                                    Expected end:{' '}
                                                    {new Date(c.expected_end_at).toLocaleString(undefined, {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short',
                                                    })}
                                                </p>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusBadge(c.status)}`}>
                                                {c.status}
                                            </span>
                                        </div>
                                        {c.status === 'active' && (
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => updateCheckinStatus(c.id, 'safe')}
                                                    className="flex-1 text-xs py-1.5 rounded-lg bg-teal-600/20 text-teal-300 border border-teal-600/30 hover:bg-teal-600/30 transition-colors"
                                                >
                                                    ✓ I'm safe
                                                </button>
                                                <button
                                                    onClick={() => updateCheckinStatus(c.id, 'cancelled')}
                                                    className="flex-1 text-xs py-1.5 rounded-lg bg-stone-700/30 text-stone-400 border border-stone-600/20 hover:bg-stone-700/50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Account Deletion */}
                    <section>
                        <h2 className="font-display text-lg text-white mb-2">Delete Account</h2>
                        <p className="text-stone-400 text-sm mb-4">
                            Deleting your account deactivates it immediately. After 14 days it is permanently erased —
                            including all messages and posts. You can log in within 14 days to cancel.
                        </p>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="text-sm text-red-400 border border-red-500/30 rounded-lg px-4 py-2 hover:bg-red-500/10 transition-colors"
                            >
                                Request account deletion
                            </button>
                        ) : (
                            <form onSubmit={requestDeletion} className="huru-card p-4 space-y-3 border border-red-500/20">
                                <p className="text-red-300 text-sm font-medium">
                                    Are you sure? Enter your password to confirm.
                                </p>
                                <input
                                    type="password"
                                    className="huru-input"
                                    placeholder="Your password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    required
                                />
                                {deleteError && <p className="text-red-400 text-sm">{deleteError}</p>}
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 rounded-lg bg-red-600/20 text-red-300 border border-red-500/30 hover:bg-red-600/30 text-sm transition-colors"
                                        disabled={deletePending}
                                    >
                                        {deletePending ? 'Processing…' : 'Yes, delete my account'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError(null); }}
                                        className="flex-1 py-2 rounded-lg bg-stone-700/30 text-stone-400 text-sm hover:bg-stone-700/50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
