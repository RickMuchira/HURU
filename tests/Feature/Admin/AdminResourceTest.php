<?php

use App\Models\Category;
use App\Models\Resource;
use App\Models\User;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

beforeEach(function () {
    $this->admin = User::factory()->create();
    $this->token = $this->admin->createToken('admin-token')->plainTextToken;
});

it('lists all resources regardless of status', function () {
    Resource::factory()->approved()->count(2)->create();
    Resource::factory()->create(['status' => 'pending']);

    $this->withToken($this->token)
        ->getJson('/api/admin/resources')
        ->assertSuccessful()
        ->assertJsonPath('meta.total', 3);
});

it('creates a resource', function () {
    $category = Category::factory()->create();

    $this->withToken($this->token)
        ->postJson('/api/admin/resources', [
            'name' => 'New Clinic',
            'description' => 'A great clinic.',
            'category_id' => $category->id,
            'county' => 'Nairobi',
            'status' => 'approved',
        ])->assertCreated();

    expect(Resource::count())->toBe(1);
});

it('updates a resource', function () {
    $resource = Resource::factory()->create(['status' => 'pending']);

    $this->withToken($this->token)
        ->putJson("/api/admin/resources/{$resource->id}", [
            'status' => 'approved',
            'is_featured' => true,
        ])->assertSuccessful();

    expect($resource->fresh()->status)->toBe('approved');
    expect($resource->fresh()->is_featured)->toBeTrue();
});

it('soft deletes a resource', function () {
    $resource = Resource::factory()->approved()->create();

    $this->withToken($this->token)
        ->deleteJson("/api/admin/resources/{$resource->id}")
        ->assertSuccessful();

    expect(Resource::count())->toBe(0);
    expect(Resource::withTrashed()->count())->toBe(1);
});
