<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\JoinSpaceRequest;
use App\Http\Requests\Api\StoreSpaceRequest;
use App\Http\Resources\SpaceResource;
use App\Models\Space;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SpaceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $spaces = Space::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type, fn ($q, $t) => $q->where('type', $t))
            ->withCount('members')
            ->orderByDesc('members_count')
            ->latest()
            ->paginate(24)
            ->withQueryString();

        $spaces->getCollection()->transform(function (Space $space) use ($user) {
            $space->member_count = $space->members_count;
            $space->is_member = $space->members()->where('users.id', $user->id)->exists();
            $space->role = $space->is_member
                ? $space->members()->where('users.id', $user->id)->first()?->pivot?->role
                : null;

            return $space;
        });

        return response()->json([
            'data' => SpaceResource::collection($spaces),
            'message' => null,
        ]);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $user = $request->user();

        $space = Space::where('slug', $slug)->firstOrFail();

        $isMember = $space->members()->where('users.id', $user->id)->exists();
        $role = $isMember ? $space->members()->where('users.id', $user->id)->first()?->pivot?->role : null;

        if ($space->type === 'private' && ! $isMember) {
            return response()->json([
                'data' => null,
                'message' => 'This space is private.',
            ], 403);
        }

        $space->member_count = $space->members()->count();
        $space->is_member = $isMember;
        $space->role = $role;

        return response()->json([
            'data' => new SpaceResource($space),
            'message' => null,
        ]);
    }

    public function store(StoreSpaceRequest $request): JsonResponse
    {
        $user = $request->user();

        $baseSlug = Str::slug($request->string('name')->toString());
        $slug = $baseSlug;
        $i = 1;
        while (Space::where('slug', $slug)->exists()) {
            $i++;
            $slug = $baseSlug.'-'.$i;
        }

        $space = Space::create([
            'name' => $request->string('name')->toString(),
            'slug' => $slug,
            'description' => $request->input('description'),
            'type' => $request->input('type'),
            'creator_id' => $user->id,
        ]);

        $space->members()->attach($user->id, [
            'role' => 'moderator',
            'joined_at' => now(),
        ]);

        $space->member_count = 1;
        $space->is_member = true;
        $space->role = 'moderator';

        return response()->json([
            'data' => new SpaceResource($space),
            'message' => 'Space created.',
        ], 201);
    }

    public function join(JoinSpaceRequest $request, string $slug): JsonResponse
    {
        $user = $request->user();
        $space = Space::where('slug', $slug)->firstOrFail();

        if ($space->type === 'private') {
            return response()->json([
                'data' => null,
                'message' => 'This space is private.',
            ], 403);
        }

        if ($space->members()->where('users.id', $user->id)->exists()) {
            $space->member_count = $space->members()->count();
            $space->is_member = true;
            $space->role = $space->members()->where('users.id', $user->id)->first()?->pivot?->role;

            return response()->json([
                'data' => new SpaceResource($space),
                'message' => 'Already a member.',
            ]);
        }

        $space->members()->attach($user->id, [
            'role' => 'member',
            'joined_at' => now(),
        ]);

        $space->member_count = $space->members()->count();
        $space->is_member = true;
        $space->role = 'member';

        return response()->json([
            'data' => new SpaceResource($space),
            'message' => 'Joined space.',
        ], 201);
    }
}
