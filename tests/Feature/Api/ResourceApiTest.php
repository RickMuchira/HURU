<?php

use App\Models\Category;
use App\Models\Resource;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('lists only approved resources', function () {
    Resource::factory()->approved()->count(3)->create();
    Resource::factory()->create(['status' => 'pending']);
    Resource::factory()->create(['status' => 'rejected']);

    $response = $this->getJson('/api/resources');

    $response->assertSuccessful();
    expect($response->json('meta.total'))->toBe(3);
});

it('filters by category slug', function () {
    $category = Category::factory()->create(['slug' => 'health']);
    Resource::factory()->approved()->for($category)->count(2)->create();
    Resource::factory()->approved()->create();

    $response = $this->getJson('/api/resources?category=health');

    $response->assertSuccessful();
    expect($response->json('meta.total'))->toBe(2);
});

it('filters by county', function () {
    Resource::factory()->approved()->create(['county' => 'Nairobi']);
    Resource::factory()->approved()->create(['county' => 'Mombasa']);

    $response = $this->getJson('/api/resources?county=Nairobi');

    $response->assertSuccessful();
    expect($response->json('meta.total'))->toBe(1);
});

it('filters featured resources', function () {
    Resource::factory()->featured()->count(2)->create();
    Resource::factory()->approved()->count(3)->create();

    $response = $this->getJson('/api/resources?featured=1');

    $response->assertSuccessful();
    expect($response->json('meta.total'))->toBe(2);
});

it('searches resources by name', function () {
    Resource::factory()->approved()->create(['name' => 'Nairobi Women Hospital']);
    Resource::factory()->approved()->create(['name' => 'Mombasa Clinic']);

    $response = $this->getJson('/api/resources?search=Women');

    $response->assertSuccessful();
    expect($response->json('meta.total'))->toBe(1);
});

it('returns single approved resource', function () {
    $resource = Resource::factory()->approved()->create();

    $this->getJson("/api/resources/{$resource->id}")
        ->assertSuccessful()
        ->assertJsonPath('data.id', $resource->id);
});

it('returns 404 for pending resource', function () {
    $resource = Resource::factory()->create(['status' => 'pending']);

    $this->getJson("/api/resources/{$resource->id}")
        ->assertNotFound();
});
