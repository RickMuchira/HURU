<?php

use App\Models\Category;
use App\Models\Resource;
use App\Models\Submission;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('creates a submission and returns submitter token', function () {
    $category = Category::factory()->create();

    $response = $this->postJson('/api/submissions', [
        'name' => 'Test Clinic',
        'description' => 'A welcoming clinic in Nairobi.',
        'category_id' => $category->id,
        'county' => 'Nairobi',
        'phone' => '+254700000000',
        'email' => 'test@clinic.com',
        'website' => 'https://testclinic.com',
    ]);

    $response->assertCreated()
        ->assertJsonStructure(['data' => ['id', 'submitter_token']]);

    expect(Submission::count())->toBe(1);
});

it('validates required fields', function () {
    $this->postJson('/api/submissions', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'description', 'category_id', 'county']);
});

it('rejects invalid website URL', function () {
    $category = Category::factory()->create();

    $this->postJson('/api/submissions', [
        'name' => 'Test',
        'description' => 'A description.',
        'category_id' => $category->id,
        'county' => 'Nairobi',
        'website' => 'not-a-url',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['website']);
});

it('flags an approved resource', function () {
    $resource = Resource::factory()->approved()->create();

    $this->postJson("/api/resources/{$resource->id}/flag", [
        'reason' => 'This listing appears to be outdated.',
    ])->assertCreated();

    expect($resource->flags()->count())->toBe(1);
});

it('cannot flag a non-approved resource', function () {
    $resource = Resource::factory()->create(['status' => 'pending']);

    $this->postJson("/api/resources/{$resource->id}/flag", [
        'reason' => 'Wrong info.',
    ])->assertNotFound();
});
