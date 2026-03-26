import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface PrivacySettings {
    ghost_mode: boolean;
    profile_visibility: 'public' | 'members' | 'connections';
    messaging_permission: 'everyone' | 'connections' | 'no_one';
    show_online: boolean;
    location_hidden: boolean;
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors duration-200 ${
                enabled ? 'bg-huru-gold border-huru-gold' : 'bg-stone-700 border-stone-600'
            }`}
        >
            <span
                className={`inline-block h-4 w-4 translate-y-0 rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${
                    enabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
            />
        </button>
    );
}

function SelectField({
    label,
    description,
    value,
    options,
    onChange,
}: {
    label: string;
    description: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-4 py-4">
            <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-stone-400 text-xs mt-0.5">{description}</p>
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="huru-input w-44 shrink-0 text-sm py-1.5"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}

export default function SettingsPrivacy() {
    const [settings, setSettings] = useState<PrivacySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState<string | null>(null);
    const [ghostSaving, setGhostSaving] = useState(false);

    useEffect(() => {
        axios.get('/api/me').then((res) => {
            const u = res.data?.data ?? res.data;
            setSettings({
                ghost_mode: u.ghost_mode,
                profile_visibility: u.profile_visibility,
                messaging_permission: u.messaging_permission,
                show_online: u.show_online,
                location_hidden: u.location_hidden,
            });
        }).finally(() => setLoading(false));
    }, []);

    async function toggleGhostMode() {
        if (!settings) return;
        setGhostSaving(true);
        try {
            const res = await axios.put('/api/me/ghost-mode');
            setSettings((s) => s ? { ...s, ghost_mode: res.data.data.ghost_mode } : s);
            setSavedMsg(res.data.message);
            setTimeout(() => setSavedMsg(null), 3000);
        } finally {
            setGhostSaving(false);
        }
    }

    async function savePrivacy() {
        if (!settings) return;
        setSaving(true);
        try {
            await axios.put('/api/me/privacy', {
                profile_visibility: settings.profile_visibility,
                messaging_permission: settings.messaging_permission,
                show_online: settings.show_online,
                location_hidden: settings.location_hidden,
            });
            setSavedMsg('Privacy settings saved.');
            setTimeout(() => setSavedMsg(null), 3000);
        } catch {
            setSavedMsg('Failed to save. Try again.');
        } finally {
            setSaving(false);
        }
    }

    if (loading || !settings) {
        return (
            <div className="min-h-screen bg-huru-bg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-huru-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <>
            <Head title="Privacy Settings — HURU" />
            <div className="min-h-screen bg-huru-bg text-huru-text">
                <header className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
                    <Link href="/home" className="text-stone-400 hover:text-white transition-colors text-sm">
                        ← Home
                    </Link>
                    <h1 className="font-display text-xl text-white">Privacy Settings</h1>
                </header>

                <div className="max-w-xl mx-auto px-4 py-8 space-y-8">

                    {savedMsg && (
                        <div className="bg-teal-500/10 border border-teal-500/30 text-teal-300 text-sm px-4 py-3 rounded-xl">
                            {savedMsg}
                        </div>
                    )}

                    {/* Ghost Mode */}
                    <div className="huru-card p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">👻</span>
                                    <p className="text-white font-medium">Ghost mode</p>
                                </div>
                                <p className="text-stone-400 text-sm mt-1">
                                    When on, you disappear from member discovery completely. Only your existing connections
                                    can still see your profile.
                                </p>
                            </div>
                            <div className="shrink-0">
                                {ghostSaving ? (
                                    <div className="w-11 h-6 bg-stone-700 rounded-full animate-pulse" />
                                ) : (
                                    <Toggle enabled={settings.ghost_mode} onChange={toggleGhostMode} />
                                )}
                            </div>
                        </div>
                        {settings.ghost_mode && (
                            <div className="mt-3 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                                You are currently invisible to member discovery.
                            </div>
                        )}
                    </div>

                    {/* Privacy controls */}
                    <div className="huru-card divide-y divide-white/5">
                        <SelectField
                            label="Who can see my profile"
                            description="Controls who can view your full profile."
                            value={settings.profile_visibility}
                            options={[
                                { value: 'public', label: 'Everyone' },
                                { value: 'members', label: 'Members only' },
                                { value: 'connections', label: 'Connections only' },
                            ]}
                            onChange={(v) => setSettings((s) => s ? { ...s, profile_visibility: v as any } : s)}
                        />
                        <SelectField
                            label="Who can message me"
                            description="Others can only start conversations if allowed."
                            value={settings.messaging_permission}
                            options={[
                                { value: 'everyone', label: 'Everyone' },
                                { value: 'connections', label: 'Connections only' },
                                { value: 'no_one', label: 'No one' },
                            ]}
                            onChange={(v) => setSettings((s) => s ? { ...s, messaging_permission: v as any } : s)}
                        />
                        <div className="flex items-start justify-between gap-4 py-4">
                            <div>
                                <p className="text-white text-sm font-medium">Show online status</p>
                                <p className="text-stone-400 text-xs mt-0.5">Let others see when you're active.</p>
                            </div>
                            <Toggle
                                enabled={settings.show_online}
                                onChange={(v) => setSettings((s) => s ? { ...s, show_online: v } : s)}
                            />
                        </div>
                        <div className="flex items-start justify-between gap-4 py-4">
                            <div>
                                <p className="text-white text-sm font-medium">Hide my location</p>
                                <p className="text-stone-400 text-xs mt-0.5">Your country/city won't appear on your profile.</p>
                            </div>
                            <Toggle
                                enabled={settings.location_hidden}
                                onChange={(v) => setSettings((s) => s ? { ...s, location_hidden: v } : s)}
                            />
                        </div>
                    </div>

                    <button onClick={savePrivacy} className="huru-btn w-full" disabled={saving}>
                        {saving ? 'Saving…' : 'Save privacy settings'}
                    </button>

                    <p className="text-stone-500 text-xs text-center">
                        All settings default to the most private option. Change any time.
                    </p>
                </div>
            </div>
        </>
    );
}
