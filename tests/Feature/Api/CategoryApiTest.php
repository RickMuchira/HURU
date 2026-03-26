<?php

use App\Models\Category;
use App\Models\Resource;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('returns all categories with approved resource count', function () {
    $category = Category::factory()->create();
    Resource::factory()->count(3)->approved()->for($category)->create();
    Resource::factory()->create(['category_id' => $category->id, 'status' => 'pending']);

    $response = $this->getJson('/api/categories');

    $response->assertSuccessful()
        ->assertJsonStructure([
            'data' => [['id', 'name', 'slug', 'icon', 'color', 'resources_count']],
            'message',
        ]);

    $match = collect($response->json('data'))->firstWhere('id', $category->id);
    expect($match['resources_count'])->toBe(3);
});
