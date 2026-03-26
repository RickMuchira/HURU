<?php

namespace App\Http\Controllers;

use App\Http\Resources\ConnectionResource;
use App\Http\Resources\MemberResource;
use App\Models\Connection;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function landing(): Response
    {
        return Inertia::render('Landing');
    }

    public function home(): Response
    {
        return Inertia::render('Home');
    }

    public function members(Request $request): Response
    {
        $viewer = $request->user();

        $blockedIds = Connection::where(function ($q) use ($viewer) {
            $q->where('requester_id', $viewer->id)->orWhere('receiver_id', $viewer->id);
        })->where('status', 'blocked')->get()->flatMap(function ($c) use ($viewer) {
            return [$c->requester_id, $c->receiver_id];
        })->filter(fn ($id) => $id !== $viewer->id)->unique()->values()->all();

        $members = User::where('id', '!=', $viewer->id)
            ->where('ghost_mode', false)
            ->where('is_suspended', false)
            ->where('onboarding_completed', true)
            ->whereNotIn('id', $blockedIds)
            ->where(function ($q) {
                $q->where('profile_visibility', 'public')
                    ->orWhere('profile_visibility', 'members');
            })
            ->when($request->country, fn ($q, $v) => $q->where('country', $v))
            ->when($request->intent, fn ($q, $v) => $q->whereJsonContains('intents', $v))
            ->when($request->search, fn ($q, $s) => $q->where(function ($inner) use ($s) {
                $inner->where('username', 'like', "%{$s}%")
                    ->orWhere('display_name', 'like', "%{$s}%");
            }))
            ->latest()
            ->paginate(24)
            ->withQueryString();

        $countries = User::where('ghost_mode', false)
            ->where('is_suspended', false)
            ->where('onboarding_completed', true)
            ->where('location_hidden', false)
            ->whereNotNull('country')
            ->distinct()
            ->orderBy('country')
            ->pluck('country');

        return Inertia::render('Members/Index', [
            'members' => MemberResource::collection($members),
            'filters' => $request->only(['country', 'intent', 'search']),
            'countries' => $countries,
        ]);
    }

    public function memberShow(Request $request, string $username): Response
    {
        $viewer = $request->user();
        $member = User::where('username', $username)
            ->where('is_suspended', false)
            ->where('onboarding_completed', true)
            ->firstOrFail();

        $connectionStatus = null;
        $connectionId = null;
        $iAmRequester = false;

        if ($member->id !== $viewer->id) {
            $conn = Connection::where(function ($q) use ($viewer, $member) {
                $q->where('requester_id', $viewer->id)->where('receiver_id', $member->id);
            })->orWhere(function ($q) use ($viewer, $member) {
                $q->where('requester_id', $member->id)->where('receiver_id', $viewer->id);
            })->first();

            $connectionStatus = $conn?->status;
            $connectionId = $conn?->id;
            $iAmRequester = $conn?->requester_id === $viewer->id;
        }

        return Inertia::render('Members/Show', [
            'member' => new MemberResource($member),
            'connectionStatus' => $connectionStatus,
            'connectionId' => $connectionId,
            'iAmRequester' => $iAmRequester,
            'isOwnProfile' => $member->id === $viewer->id,
        ]);
    }

    public function connections(Request $request): Response
    {
        $user = $request->user();

        $connections = Connection::with(['requester', 'receiver'])
            ->where(function ($q) use ($user) {
                $q->where('requester_id', $user->id)->orWhere('receiver_id', $user->id);
            })
            ->where('status', 'accepted')
            ->latest()
            ->paginate(30);

        $pending = Connection::with(['requester'])
            ->where('receiver_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->get();

        return Inertia::render('Connections', [
            'connections' => ConnectionResource::collection($connections),
            'pendingRequests' => ConnectionResource::collection($pending),
        ]);
    }

    public function messages(Request $request): Response
    {
        $user = $request->user();

        $conversations = $user->conversations()
            ->with(['participants', 'messages' => fn ($q) => $q->latest()->limit(1)])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function ($conv) use ($user) {
                $other = $conv->participants->firstWhere('id', '!=', $user->id);
                $latest = $conv->messages->first();

                return [
                    'id' => $conv->id,
                    'last_message_at' => $conv->last_message_at,
                    'other_user' => $other ? [
                        'id' => $other->id,
                        'username' => $other->username,
                        'display_name' => $other->display_name,
                        'avatar_url' => $other->avatar_url,
                        'pronouns' => $other->pronouns,
                    ] : null,
                    'latest_message' => $latest ? [
                        'body' => $latest->body,
                        'sender_id' => $latest->sender_id,
                        'created_at' => $latest->created_at->toISOString(),
                        'is_mine' => $latest->sender_id === $user->id,
                    ] : null,
                    'unread_count' => $conv->messages()
                        ->where('sender_id', '!=', $user->id)
                        ->whereNull('read_at')
                        ->count(),
                ];
            });

        return Inertia::render('Messages/Index', [
            'conversations' => $conversations,
        ]);
    }

    public function messageThread(Request $request, string $username): Response
    {
        $other = User::where('username', $username)
            ->where('is_suspended', false)
            ->firstOrFail();

        $user = $request->user();

        $conversation = null;
        $conv = \App\Models\Conversation::whereHas('participants', fn ($q) => $q->where('users.id', $user->id))
            ->whereHas('participants', fn ($q) => $q->where('users.id', $other->id))
            ->first();

        if ($conv) {
            $messages = $conv->messages()
                ->with('sender')
                ->latest()
                ->take(50)
                ->get()
                ->reverse()
                ->values()
                ->map(fn ($m) => [
                    'id' => $m->id,
                    'conversation_id' => $m->conversation_id,
                    'sender_id' => $m->sender_id,
                    'body' => $m->body,
                    'read_at' => $m->read_at?->toISOString(),
                    'auto_delete_at' => $m->auto_delete_at?->toISOString(),
                    'created_at' => $m->created_at->toISOString(),
                    'is_mine' => $m->sender_id === $user->id,
                    'sender' => [
                        'username' => $m->sender->username,
                        'avatar_url' => $m->sender->avatar_url,
                    ],
                ]);

            $conv->messages()
                ->where('sender_id', '!=', $user->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            $conversation = ['id' => $conv->id, 'messages' => $messages];
        }

        $canMessage = match ($other->messaging_permission) {
            'everyone' => true,
            'connections' => $user->isConnectedTo($other),
            'no_one' => false,
        };

        return Inertia::render('Messages/Show', [
            'otherUser' => [
                'id' => $other->id,
                'username' => $other->username,
                'display_name' => $other->display_name,
                'avatar_url' => $other->avatar_url,
                'pronouns' => $other->pronouns,
            ],
            'conversation' => $conversation,
            'canMessage' => $canMessage && ! $user->hasBlockedOrBeenBlockedBy($other),
        ]);
    }

    public function spaces(): Response
    {
        return Inertia::render('Spaces/Index');
    }

    public function spacesCreate(): Response
    {
        return Inertia::render('Spaces/Create');
    }

    public function spaceShow(string $slug): Response
    {
        return Inertia::render('Spaces/Show', ['slug' => $slug]);
    }

    public function profile(): Response
    {
        return Inertia::render('Profile/Index');
    }

    public function settingsPrivacy(): Response
    {
        return Inertia::render('Settings/Privacy');
    }

    public function settingsSafety(): Response
    {
        return Inertia::render('Settings/Safety');
    }

    public function adminLogin(): Response
    {
        return Inertia::render('Admin/Login');
    }

    public function adminDashboard(): Response
    {
        return Inertia::render('Admin/Dashboard');
    }

    public function adminUsers(): Response
    {
        return Inertia::render('Admin/Users');
    }

    public function adminReports(): Response
    {
        return Inertia::render('Admin/Reports');
    }

    public function adminSpaces(): Response
    {
        return Inertia::render('Admin/Spaces');
    }
}
