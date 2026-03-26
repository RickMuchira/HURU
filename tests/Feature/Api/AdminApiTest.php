<?php

use App\Models\Report;
use App\Models\Space;
use App\Models\SpacePost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ─── Access Control ───────────────────────────────────────────────────

it('non-admin cannot access admin API', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $this->actingAs($user)
        ->getJson('/api/admin/stats')
        ->assertForbidden();
});

it('admin can access admin API', function () {
    $admin = User::factory()->create(['is_admin' => true]);

    $this->actingAs($admin)
        ->getJson('/api/admin/stats')
        ->assertOk()
        ->assertJsonStructure(['data' => ['users', 'spaces', 'connections', 'reports']]);
});

// ─── Stats ────────────────────────────────────────────────────────────

it('stats returns correct user counts', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    User::factory(3)->create(['is_admin' => false, 'is_suspended' => false, 'onboarding_completed' => true]);
    User::factory()->create(['is_admin' => false, 'is_suspended' => true]);

    $this->actingAs($admin)
        ->getJson('/api/admin/stats')
        ->assertOk()
        ->assertJsonPath('data.users.suspended', 1);
});

// ─── User Management ─────────────────────────────────────────────────

it('admin can list users', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    User::factory(5)->create();

    $this->actingAs($admin)
        ->getJson('/api/admin/users')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta']);
});

it('admin can suspend a user', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $user = User::factory()->create(['is_suspended' => false]);

    $this->actingAs($admin)
        ->putJson("/api/admin/users/{$user->id}/suspend")
        ->assertOk();

    expect($user->fresh()->is_suspended)->toBeTrue();
});

it('admin can unsuspend a user', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $user = User::factory()->create(['is_suspended' => true]);

    $this->actingAs($admin)
        ->putJson("/api/admin/users/{$user->id}/unsuspend")
        ->assertOk();

    expect($user->fresh()->is_suspended)->toBeFalse();
});

it('admin cannot suspend another admin', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $admin2 = User::factory()->create(['is_admin' => true]);

    $this->actingAs($admin)
        ->putJson("/api/admin/users/{$admin2->id}/suspend")
        ->assertForbidden();
});

// ─── Reports ─────────────────────────────────────────────────────────

it('admin can list reports', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $reporter = User::factory()->create();
    $target = User::factory()->create();

    Report::create([
        'reporter_id' => $reporter->id,
        'reported_user_id' => $target->id,
        'reason' => 'harassment',
        'status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->getJson('/api/admin/reports?status=pending')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

it('admin can resolve a report and suspend the reported user', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $reporter = User::factory()->create();
    $target = User::factory()->create(['is_suspended' => false]);

    $report = Report::create([
        'reporter_id' => $reporter->id,
        'reported_user_id' => $target->id,
        'reason' => 'harassment',
        'status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->putJson("/api/admin/reports/{$report->id}/resolve", ['action' => 'suspend'])
        ->assertOk();

    expect($report->fresh()->status)->toBe('resolved')
        ->and($target->fresh()->is_suspended)->toBeTrue();
});

it('admin can dismiss a report', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $reporter = User::factory()->create();
    $target = User::factory()->create();

    $report = Report::create([
        'reporter_id' => $reporter->id,
        'reported_user_id' => $target->id,
        'reason' => 'spam',
        'status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->putJson("/api/admin/reports/{$report->id}/dismiss")
        ->assertOk();

    expect($report->fresh()->status)->toBe('reviewed');
});

// ─── Spaces ───────────────────────────────────────────────────────────

it('admin can list spaces', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $creator = User::factory()->create();
    Space::create(['name' => 'Test Space', 'slug' => 'test-space', 'type' => 'public', 'creator_id' => $creator->id]);

    $this->actingAs($admin)
        ->getJson('/api/admin/spaces')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta']);
});

it('admin can remove a post from a space', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $creator = User::factory()->create();
    $space = Space::create(['name' => 'Test', 'slug' => 'test', 'type' => 'public', 'creator_id' => $creator->id]);
    $post = SpacePost::create(['space_id' => $space->id, 'user_id' => $creator->id, 'body' => 'Some post']);

    $this->actingAs($admin)
        ->deleteJson("/api/admin/spaces/{$space->slug}/posts/{$post->id}")
        ->assertOk();

    expect(SpacePost::find($post->id))->toBeNull();
});

it('admin can remove a member from a space', function () {
    $admin = User::factory()->create(['is_admin' => true]);
    $creator = User::factory()->create();
    $member = User::factory()->create();
    $space = Space::create(['name' => 'Test', 'slug' => 'test2', 'type' => 'public', 'creator_id' => $creator->id]);
    $space->members()->attach($member->id, ['role' => 'member', 'joined_at' => now()]);

    $this->actingAs($admin)
        ->deleteJson("/api/admin/spaces/{$space->slug}/members/{$member->id}")
        ->assertOk();

    expect($space->members()->where('users.id', $member->id)->exists())->toBeFalse();
});
