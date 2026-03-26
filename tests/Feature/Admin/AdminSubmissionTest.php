<?php

use App\Models\Category;
use App\Models\Resource;
use App\Models\Submission;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create();
    $this->token = $this->admin->createToken('admin-token')->plainTextToken;
});

it('lists submissions paginated', function () {
    Submission::factory()->count(5)->create();

    $this->withToken($this->token)
        ->getJson('/api/admin/submissions')
        ->assertSuccessful()
        ->assertJsonPath('meta.total', 5);
});

it('filters submissions by status', function () {
    Submission::factory()->count(3)->create(['status' => 'pending']);
    Submission::factory()->approved()->count(2)->create();

    $this->withToken($this->token)
        ->getJson('/api/admin/submissions?status=pending')
        ->assertSuccessful()
        ->assertJsonPath('meta.total', 3);
});

it('approves a submission and promotes it to resources table', function () {
    $category = Category::factory()->create();
    $submission = Submission::factory()->for($category)->create(['status' => 'pending']);

    $this->withToken($this->token)
        ->putJson("/api/admin/submissions/{$submission->id}", [
            'status' => 'approved',
            'admin_notes' => 'Verified by team.',
        ])->assertSuccessful();

    expect($submission->fresh()->status)->toBe('approved');
    expect(Resource::where('submitter_token', $submission->submitter_token)->exists())->toBeTrue();
    expect(Resource::where('submitter_token', $submission->submitter_token)->value('status'))->toBe('approved');
});

it('rejects a submission without creating a resource', function () {
    $submission = Submission::factory()->create(['status' => 'pending']);

    $this->withToken($this->token)
        ->putJson("/api/admin/submissions/{$submission->id}", [
            'status' => 'rejected',
            'admin_notes' => 'Not enough info.',
        ])->assertSuccessful();

    expect($submission->fresh()->status)->toBe('rejected');
    expect(Resource::count())->toBe(0);
});

it('returns dashboard stats', function () {
    Submission::factory()->count(3)->create(['status' => 'pending']);
    Resource::factory()->approved()->count(5)->create();

    $this->withToken($this->token)
        ->getJson('/api/admin/dashboard')
        ->assertSuccessful()
        ->assertJsonPath('data.pending_submissions', 3)
        ->assertJsonPath('data.total_resources', 5);
});
