<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MessageController extends Controller
{
    public function index(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        if (! $conversation->participants()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->latest()
            ->paginate(50);

        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'data' => $messages->getCollection()->reverse()->values()->map(fn ($m) => [
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
            ]),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
            ],
        ]);
    }

    public function store(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        if (! $conversation->participants()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:4000'],
            'auto_delete' => ['nullable', Rule::in(['1_hour', '24_hours', '7_days', 'never'])],
        ]);

        $autoDeleteAt = match ($validated['auto_delete'] ?? 'never') {
            '1_hour' => now()->addHour(),
            '24_hours' => now()->addDay(),
            '7_days' => now()->addWeek(),
            default => null,
        };

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => $validated['body'],
            'auto_delete_at' => $autoDeleteAt,
        ]);

        $conversation->update(['last_message_at' => now()]);

        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'data' => [
                'id' => $message->id,
                'conversation_id' => $message->conversation_id,
                'sender_id' => $message->sender_id,
                'body' => $message->body,
                'read_at' => null,
                'auto_delete_at' => $message->auto_delete_at?->toISOString(),
                'created_at' => $message->created_at->toISOString(),
                'is_mine' => true,
            ],
        ], 201);
    }

    public function destroy(Request $request, Message $message): JsonResponse
    {
        if ($message->sender_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $message->delete();

        return response()->json(['message' => 'Message deleted.']);
    }
}
