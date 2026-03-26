<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Connection;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request): JsonResponse
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

        return response()->json(['data' => $conversations]);
    }

    public function findOrCreate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'exists:users,username'],
        ]);

        $other = User::where('username', $validated['username'])
            ->where('is_suspended', false)
            ->firstOrFail();

        $user = $request->user();

        if ($user->id === $other->id) {
            return response()->json(['message' => 'Cannot message yourself.'], 422);
        }

        if ($user->hasBlockedOrBeenBlockedBy($other)) {
            return response()->json(['message' => 'Cannot send message.'], 403);
        }

        $canMessage = match ($other->messaging_permission) {
            'everyone' => true,
            'connections' => $user->isConnectedTo($other),
            'no_one' => false,
        };

        if (! $canMessage) {
            return response()->json(['message' => 'This user is not accepting messages.'], 403);
        }

        $existing = Conversation::whereHas('participants', fn ($q) => $q->where('users.id', $user->id))
            ->whereHas('participants', fn ($q) => $q->where('users.id', $other->id))
            ->first();

        if ($existing) {
            return response()->json(['data' => ['conversation_id' => $existing->id]]);
        }

        $conversation = Conversation::create();
        $conversation->participants()->attach([
            $user->id => ['joined_at' => now()],
            $other->id => ['joined_at' => now()],
        ]);

        return response()->json(['data' => ['conversation_id' => $conversation->id]], 201);
    }
}
