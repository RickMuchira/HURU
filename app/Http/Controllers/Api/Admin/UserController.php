<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::where('is_admin', false)
            ->when($request->search, fn ($q, $s) => $q->where(function ($inner) use ($s) {
                $inner->where('username', 'like', "%{$s}%")
                    ->orWhere('display_name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%");
            }))
            ->when($request->status === 'suspended', fn ($q) => $q->where('is_suspended', true))
            ->when($request->status === 'ghost', fn ($q) => $q->where('ghost_mode', true))
            ->when($request->status === 'pending_delete', fn ($q) => $q->whereNotNull('deletion_requested_at'))
            ->latest()
            ->paginate(30);

        return response()->json([
            'data' => $users->map(fn ($u) => $this->formatUser($u)),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'data' => array_merge($this->formatUser($user), [
                'email' => $user->email,
                'created_at' => $user->created_at->toISOString(),
                'deletion_requested_at' => $user->deletion_requested_at?->toISOString(),
                'connections_count' => $user->connections()->where('status', 'accepted')->count() +
                    $user->receivedConnections()->where('status', 'accepted')->count(),
                'spaces_count' => $user->spaces()->count(),
            ]),
        ]);
    }

    public function suspend(User $user): JsonResponse
    {
        abort_if($user->is_admin, 403, 'Cannot suspend an admin.');
        $user->update(['is_suspended' => true]);
        $user->tokens()->delete();

        return response()->json(['message' => "User @{$user->username} suspended."]);
    }

    public function unsuspend(User $user): JsonResponse
    {
        $user->update(['is_suspended' => false]);

        return response()->json(['message' => "User @{$user->username} unsuspended."]);
    }

    public function revokeTokens(User $user): JsonResponse
    {
        $count = $user->tokens()->count();
        $user->tokens()->delete();

        return response()->json(['message' => "{$count} session(s) revoked for @{$user->username}."]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username,
            'display_name' => $user->display_name,
            'pronouns' => $user->pronouns,
            'country' => $user->country,
            'bio' => $user->bio,
            'avatar_url' => $user->avatar_url,
            'is_suspended' => $user->is_suspended,
            'ghost_mode' => $user->ghost_mode,
            'onboarding_completed' => $user->onboarding_completed,
            'intents' => $user->intents,
            'created_at' => $user->created_at->toISOString(),
        ];
    }
}
