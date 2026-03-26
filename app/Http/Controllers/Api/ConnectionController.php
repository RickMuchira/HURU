<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConnectionResource;
use App\Models\Connection;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class ConnectionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $connections = Connection::with(['requester', 'receiver'])
            ->where(function ($q) use ($user) {
                $q->where('requester_id', $user->id)->orWhere('receiver_id', $user->id);
            })
            ->where('status', 'accepted')
            ->latest()
            ->paginate(30);

        return ConnectionResource::collection($connections);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'exists:users,username'],
        ]);

        $receiver = User::where('username', $validated['username'])
            ->where('is_suspended', false)
            ->where('onboarding_completed', true)
            ->firstOrFail();

        $requester = $request->user();

        if ($requester->id === $receiver->id) {
            return response()->json(['message' => 'You cannot connect with yourself.'], 422);
        }

        if ($requester->hasBlockedOrBeenBlockedBy($receiver)) {
            return response()->json(['message' => 'Cannot send request.'], 422);
        }

        $existing = Connection::where(function ($q) use ($requester, $receiver) {
            $q->where('requester_id', $requester->id)->where('receiver_id', $receiver->id);
        })->orWhere(function ($q) use ($requester, $receiver) {
            $q->where('requester_id', $receiver->id)->where('receiver_id', $requester->id);
        })->first();

        if ($existing) {
            return response()->json([
                'message' => 'A connection request already exists.',
                'data' => new ConnectionResource($existing),
            ], 409);
        }

        $connection = Connection::create([
            'requester_id' => $requester->id,
            'receiver_id' => $receiver->id,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Connection request sent.',
            'data' => new ConnectionResource($connection),
        ], 201);
    }

    public function update(Request $request, Connection $connection): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'action' => ['required', Rule::in(['accept', 'decline', 'block', 'withdraw'])],
        ]);

        $action = $validated['action'];

        if ($action === 'withdraw') {
            if ($connection->requester_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
            $connection->delete();

            return response()->json(['message' => 'Request withdrawn.']);
        }

        if ($action === 'block') {
            if ($connection->requester_id !== $user->id && $connection->receiver_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
            $connection->update(['status' => 'blocked']);

            return response()->json(['message' => 'User blocked.', 'data' => new ConnectionResource($connection)]);
        }

        if ($connection->receiver_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $connection->update(['status' => $action === 'accept' ? 'accepted' : 'declined']);

        return response()->json([
            'message' => $action === 'accept' ? 'Connection accepted.' : 'Request declined.',
            'data' => new ConnectionResource($connection),
        ]);
    }
}
