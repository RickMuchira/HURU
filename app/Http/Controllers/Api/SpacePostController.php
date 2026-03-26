<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreSpacePostRequest;
use App\Http\Resources\SpacePostResource;
use App\Models\Space;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SpacePostController extends Controller
{
    public function index(Request $request, string $slug): JsonResponse
    {
        $user = $request->user();
        $space = Space::where('slug', $slug)->firstOrFail();

        $isMember = $space->members()->where('users.id', $user->id)->exists();

        if ($space->type === 'private' && ! $isMember) {
            return response()->json([
                'data' => null,
                'message' => 'This space is private.',
            ], 403);
        }

        $posts = $space->posts()
            ->with('author')
            ->latest()
            ->paginate(30);

        return response()->json([
            'data' => SpacePostResource::collection($posts),
            'message' => null,
        ]);
    }

    public function store(StoreSpacePostRequest $request, string $slug): JsonResponse
    {
        $user = $request->user();
        $space = Space::where('slug', $slug)->firstOrFail();

        $isMember = $space->members()->where('users.id', $user->id)->exists();

        if (! $isMember) {
            return response()->json([
                'data' => null,
                'message' => 'You must join this space to post.',
            ], 403);
        }

        $post = $space->posts()->create([
            'user_id' => $user->id,
            'body' => $request->string('body')->toString(),
        ]);

        $post->load('author');

        return response()->json([
            'data' => new SpacePostResource($post),
            'message' => 'Posted.',
        ], 201);
    }
}
