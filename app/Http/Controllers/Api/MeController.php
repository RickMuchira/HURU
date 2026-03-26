<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MeController extends Controller
{
    public function show(Request $request): MemberResource
    {
        return new MemberResource($request->user());
    }

    public function updateProfile(Request $request): MemberResource
    {
        $data = $request->validate([
            'display_name' => ['required', 'string', 'max:60'],
            'pronouns' => ['nullable', 'string', 'max:40'],
            'bio' => ['nullable', 'string', 'max:300'],
            'country' => ['nullable', 'string', 'max:80'],
            'city' => ['nullable', 'string', 'max:80'],
        ]);

        $request->user()->update($data);

        return new MemberResource($request->user()->fresh());
    }

    public function updatePrivacy(Request $request): MemberResource
    {
        $data = $request->validate([
            'profile_visibility' => ['required', Rule::in(['public', 'members', 'connections'])],
            'messaging_permission' => ['required', Rule::in(['everyone', 'connections', 'no_one'])],
            'show_online' => ['required', 'boolean'],
            'location_hidden' => ['required', 'boolean'],
        ]);

        $request->user()->update($data);

        return new MemberResource($request->user()->fresh());
    }

    public function updateIntents(Request $request): MemberResource
    {
        $data = $request->validate([
            'intents' => ['required', 'array', 'min:1'],
            'intents.*' => [Rule::in(['friendship', 'support', 'romance', 'community'])],
        ]);

        $request->user()->update(['intents' => $data['intents']]);

        return new MemberResource($request->user()->fresh());
    }

    public function toggleGhostMode(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->update(['ghost_mode' => ! $user->ghost_mode]);

        return response()->json([
            'data' => ['ghost_mode' => $user->fresh()->ghost_mode],
            'message' => $user->fresh()->ghost_mode ? 'Ghost mode enabled.' : 'Ghost mode disabled.',
        ]);
    }

    public function requestDeletion(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Soft delete: mark account as suspended + schedule hard delete in 14 days
        $user->update([
            'is_suspended' => true,
            'deletion_requested_at' => now(),
        ]);

        // Revoke all Sanctum tokens
        $user->tokens()->delete();

        return response()->json(['message' => 'Your account has been deactivated. It will be permanently deleted in 14 days. Log in before then to cancel.']);
    }

    public function cancelDeletion(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->update([
            'is_suspended' => false,
            'deletion_requested_at' => null,
        ]);

        return response()->json(['message' => 'Account deletion cancelled. Welcome back!']);
    }
}
