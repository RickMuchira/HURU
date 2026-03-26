<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberResource;
use App\Models\Connection;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MemberController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
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
            ->when($request->country, fn ($q, $country) => $q->where('country', $country))
            ->when($request->intent, fn ($q, $intent) => $q->whereJsonContains('intents', $intent))
            ->when($request->search, fn ($q, $s) => $q->where(function ($inner) use ($s) {
                $inner->where('username', 'like', "%{$s}%")
                    ->orWhere('display_name', 'like', "%{$s}%")
                    ->orWhere('bio', 'like', "%{$s}%");
            }))
            ->latest()
            ->paginate(24);

        return MemberResource::collection($members);
    }

    public function show(Request $request, string $username): MemberResource|JsonResponse
    {
        $viewer = $request->user();

        $member = User::where('username', $username)
            ->where('is_suspended', false)
            ->where('onboarding_completed', true)
            ->firstOrFail();

        if ($member->id === $viewer->id) {
            return new MemberResource($member);
        }

        if ($member->hasBlockedOrBeenBlockedBy($viewer)) {
            return response()->json(['data' => null, 'message' => 'Profile not found.'], 404);
        }

        if ($member->ghost_mode && ! $member->isConnectedTo($viewer)) {
            return response()->json(['data' => null, 'message' => 'This profile is private.'], 403);
        }

        if ($member->profile_visibility === 'connections' && ! $member->isConnectedTo($viewer)) {
            return response()->json(['data' => null, 'message' => 'This profile is only visible to connections.'], 403);
        }

        $connectionStatus = Connection::where(function ($q) use ($viewer, $member) {
            $q->where('requester_id', $viewer->id)->where('receiver_id', $member->id);
        })->orWhere(function ($q) use ($viewer, $member) {
            $q->where('requester_id', $member->id)->where('receiver_id', $viewer->id);
        })->first();

        return (new MemberResource($member))->additional([
            'meta' => [
                'connection_status' => $connectionStatus?->status,
                'connection_id' => $connectionStatus?->id,
                'i_am_requester' => $connectionStatus?->requester_id === $viewer->id,
            ],
        ]);
    }
}
