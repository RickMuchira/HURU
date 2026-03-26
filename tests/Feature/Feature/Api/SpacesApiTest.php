<?php

use App\Models\Space;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function makeOnboardedUser(array $overrides = []): User
{
    return User::factory()->create(array_merge([
        'username' => fake()->unique()->userName(),
        'onboarding_completed' => true,
        'is_suspended' => false,
    ], $overrides));
}

test('user can create a public space and becomes moderator member', function () {
    $user = makeOnboardedUser();

    $this->actingAs($user)
        ->postJson('/api/spaces', [
            'name' => 'Mental Health',
            'description' => 'A calm place to talk.',
            'type' => 'public',
        ])
        ->assertCreated()
        ->assertJsonPath('data.slug', 'mental-health')
        ->assertJsonPath('data.is_member', true)
        ->assertJsonPath('data.role', 'moderator');

    $space = Space::where('slug', 'mental-health')->firstOrFail();
    expect($space->members()->where('users.id', $user->id)->exists())->toBeTrue();
});

test('user can join a public space and then post', function () {
    $creator = makeOnboardedUser();
    $space = Space::create([
        'name' => 'Book Club',
        'slug' => 'book-club',
        'description' => null,
        'type' => 'public',
        'creator_id' => $creator->id,
    ]);
    $space->members()->attach($creator->id, ['role' => 'moderator', 'joined_at' => now()]);

    $user = makeOnboardedUser();

    $this->actingAs($user)
        ->postJson("/api/spaces/{$space->slug}/join")
        ->assertCreated()
        ->assertJsonPath('data.is_member', true);

    $this->actingAs($user)
        ->postJson("/api/spaces/{$space->slug}/posts", [
            'body' => 'Hello everyone.',
        ])
        ->assertCreated()
        ->assertJsonPath('data.body', 'Hello everyone.');
});

test('cannot join a private space', function () {
    $creator = makeOnboardedUser();
    $space = Space::create([
        'name' => 'Private Circle',
        'slug' => 'private-circle',
        'description' => null,
        'type' => 'private',
        'creator_id' => $creator->id,
    ]);
    $space->members()->attach($creator->id, ['role' => 'moderator', 'joined_at' => now()]);

    $user = makeOnboardedUser();

    $this->actingAs($user)
        ->postJson("/api/spaces/{$space->slug}/join")
        ->assertStatus(403);
});
