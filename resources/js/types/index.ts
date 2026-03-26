export interface User {
    id: number;
    name: string;
    username: string | null;
    display_name: string | null;
    pronouns: string | null;
    bio: string | null;
    country: string | null;
    city: string | null;
    location_hidden: boolean;
    avatar_url: string | null;
    profile_visibility: 'public' | 'members' | 'connections';
    messaging_permission: 'everyone' | 'connections' | 'no_one';
    show_online: boolean;
    intents: string[] | null;
    ghost_mode: boolean;
    onboarding_completed: boolean;
    is_admin: boolean;
    email_verified_at: string | null;
}

export interface Connection {
    id: number;
    requester_id: number;
    receiver_id: number;
    status: 'pending' | 'accepted' | 'declined' | 'blocked';
    requester?: User;
    receiver?: User;
}

export interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    body: string;
    read_at: string | null;
    auto_delete_at: string | null;
    created_at: string;
    sender?: User;
}

export interface Conversation {
    id: number;
    last_message_at: string | null;
    participants?: User[];
    latest_message?: Message;
}

export interface Space {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: 'public' | 'private';
    creator_id: number;
    avatar_path: string | null;
    member_count: number;
    creator?: User;
}

export interface SpacePost {
    id: number;
    space_id: number;
    user_id: number;
    body: string;
    created_at: string;
    author?: User;
}

export interface TrustedContact {
    id: number;
    user_id: number;
    name: string;
    phone: string;
}

export interface SafetyCheckin {
    id: number;
    user_id: number;
    trusted_contact_id: number;
    check_in_at: string;
    status: 'active' | 'safe' | 'alerted';
}

export type Intent = 'friendship' | 'support' | 'dating' | 'community' | 'browsing';

export interface PageProps {
    auth: {
        user: User | null;
    };
    name: string;
    [key: string]: unknown;
}
