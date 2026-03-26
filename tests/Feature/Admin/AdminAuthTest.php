<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

it('admin can log in with correct credentials', function () {
    $user = User::factory()->create([
        'email' => 'admin@safespaceea.org',
        'password' => Hash::make('admin123'),
    ]);

    $response = $this->postJson('/api/admin/login', [
        'email' => 'admin@safespaceea.org',
        'password' => 'admin123',
    ]);

    $response->assertSuccessful()
        ->assertJsonStructure(['data' => ['token', 'user']]);
});

it('rejects invalid credentials', function () {
    User::factory()->create(['email' => 'admin@safespaceea.org', 'password' => Hash::make('correct')]);

    $this->postJson('/api/admin/login', [
        'email' => 'admin@safespaceea.org',
        'password' => 'wrong',
    ])->assertUnprocessable();
});

it('admin can log out', function () {
    $user = User::factory()->create();
    $token = $user->createToken('admin-token')->plainTextToken;

    $this->withToken($token)
        ->postJson('/api/admin/logout')
        ->assertSuccessful();

    expect($user->tokens()->count())->toBe(0);
});

it('protected routes require authentication', function () {
    $this->getJson('/api/admin/dashboard')->assertUnauthorized();
    $this->getJson('/api/admin/resources')->assertUnauthorized();
    $this->getJson('/api/admin/submissions')->assertUnauthorized();
});
