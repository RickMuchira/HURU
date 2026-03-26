<?php

use App\Models\SafetyCheckin;
use App\Models\TrustedContact;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ─── Trusted Contacts ───────────────────────────────────────────────

it('user can list their trusted contacts', function () {
    $user = User::factory()->create();
    TrustedContact::create(['user_id' => $user->id, 'name' => 'Maria', 'safe_channel' => 'Signal: +1234']);

    $this->actingAs($user)
        ->getJson('/api/safety/trusted-contacts')
        ->assertOk()
        ->assertJsonPath('data.0.name', 'Maria');
});

it('user can add a trusted contact', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/safety/trusted-contacts', [
            'name' => 'Sam',
            'safe_channel' => 'WhatsApp: +254700000000',
            'notes' => 'Knows the situation',
        ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Sam');

    expect(TrustedContact::where('user_id', $user->id)->count())->toBe(1);
});

it('user cannot add a contact without required fields', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/safety/trusted-contacts', ['name' => 'Sam'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['safe_channel']);
});

it('user can delete their own trusted contact', function () {
    $user = User::factory()->create();
    $contact = TrustedContact::create(['user_id' => $user->id, 'name' => 'Sam', 'safe_channel' => 'Signal']);

    $this->actingAs($user)
        ->deleteJson("/api/safety/trusted-contacts/{$contact->id}")
        ->assertOk();

    expect(TrustedContact::find($contact->id))->toBeNull();
});

it('user cannot delete another user\'s trusted contact', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $contact = TrustedContact::create(['user_id' => $owner->id, 'name' => 'Sam', 'safe_channel' => 'Signal']);

    $this->actingAs($other)
        ->deleteJson("/api/safety/trusted-contacts/{$contact->id}")
        ->assertForbidden();
});

// ─── Safety Check-ins ────────────────────────────────────────────────

it('user can start a safety check-in', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/safety/checkins', [
            'meet_description' => 'Coffee date downtown',
            'expected_end_at' => now()->addHours(2)->toDateTimeString(),
        ])
        ->assertCreated()
        ->assertJsonPath('data.status', 'active')
        ->assertJsonPath('data.meet_description', 'Coffee date downtown');
});

it('user can mark a check-in as safe', function () {
    $user = User::factory()->create();
    $checkin = SafetyCheckin::create([
        'user_id' => $user->id,
        'meet_description' => 'Walk in the park',
        'expected_end_at' => now()->addHour(),
        'status' => 'active',
    ]);

    $this->actingAs($user)
        ->putJson("/api/safety/checkins/{$checkin->id}", ['status' => 'safe'])
        ->assertOk()
        ->assertJsonPath('data.status', 'safe');
});

it('user cannot update another user\'s check-in', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $checkin = SafetyCheckin::create([
        'user_id' => $owner->id,
        'meet_description' => 'Walk in the park',
        'expected_end_at' => now()->addHour(),
        'status' => 'active',
    ]);

    $this->actingAs($other)
        ->putJson("/api/safety/checkins/{$checkin->id}", ['status' => 'safe'])
        ->assertForbidden();
});

// ─── Ghost Mode ───────────────────────────────────────────────────────

it('user in ghost mode does not appear in member discovery', function () {
    $viewer = User::factory()->create();
    $ghost = User::factory()->create(['ghost_mode' => true]);

    $this->actingAs($viewer)
        ->getJson('/api/members')
        ->assertOk()
        ->assertJsonMissing(['username' => $ghost->username]);
});

it('user can toggle ghost mode on and off', function () {
    $user = User::factory()->create(['ghost_mode' => false]);

    $this->actingAs($user)
        ->putJson('/api/me/ghost-mode')
        ->assertOk()
        ->assertJsonPath('data.ghost_mode', true);

    $this->actingAs($user)
        ->putJson('/api/me/ghost-mode')
        ->assertOk()
        ->assertJsonPath('data.ghost_mode', false);
});

// ─── Account Deletion ─────────────────────────────────────────────────

it('user can request account deletion with correct password', function () {
    $user = User::factory()->create(['password' => bcrypt('Secret1234!')]);

    $this->actingAs($user)
        ->postJson('/api/me/request-deletion', ['password' => 'Secret1234!'])
        ->assertOk();

    expect($user->fresh()->is_suspended)->toBeTrue()
        ->and($user->fresh()->deletion_requested_at)->not->toBeNull();
});

it('user cannot request deletion with wrong password', function () {
    $user = User::factory()->create(['password' => bcrypt('Secret1234!')]);

    $this->actingAs($user)
        ->postJson('/api/me/request-deletion', ['password' => 'wrongpassword'])
        ->assertUnprocessable();
});
