<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Space;
use App\Models\SpacePost;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SpaceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $spaces = Space::withCount(['members', 'posts'])
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->type, fn ($q, $t) => $q->where('type', $t))
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $spaces->items(),
            'meta' => [
                'current_page' => $spaces->currentPage(),
                'last_page' => $spaces->lastPage(),
                'total' => $spaces->total(),
            ],
        ]);
    }

    public function show(Space $space): JsonResponse
    {
        $space->loadCount(['members', 'posts']);

        $members = $space->members()
            ->select('users.id', 'users.username', 'users.display_name', 'users.avatar_url', 'users.is_suspended')
            ->withPivot('role', 'joined_at')
            ->get()
            ->map(fn ($u) => [
                'id' => $u->id,
                'username' => $u->username,
                'display_name' => $u->display_name,
                'avatar_url' => $u->avatar_url,
                'is_suspended' => $u->is_suspended,
                'role' => $u->pivot->role,
                'joined_at' => $u->pivot->joined_at,
            ]);

        $posts = $space->posts()
            ->with('user:id,username,display_name,avatar_url')
            ->latest()
            ->take(30)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'body' => $p->body,
                'created_at' => $p->created_at->toISOString(),
                'user' => $p->user ? [
                    'id' => $p->user->id,
                    'username' => $p->user->username,
                    'display_name' => $p->user->display_name,
                ] : null,
            ]);

        return response()->json([
            'data' => [
                'id' => $space->id,
                'name' => $space->name,
                'slug' => $space->slug,
                'description' => $space->description,
                'type' => $space->type,
                'members_count' => $space->members_count,
                'posts_count' => $space->posts_count,
                'created_at' => $space->created_at->toISOString(),
                'members' => $members,
                'posts' => $posts,
            ],
        ]);
    }

    public function removePost(Space $space, SpacePost $post): JsonResponse
    {
        abort_if($post->space_id !== $space->id, 404);
        $post->delete();

        return response()->json(['message' => 'Post removed.']);
    }

    public function removeMember(Space $space, User $user): JsonResponse
    {
        $space->members()->detach($user->id);

        return response()->json(['message' => "Member @{$user->username} removed from space."]);
    }
}
