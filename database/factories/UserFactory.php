<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->name();
        $username = Str::slug($name).fake()->numerify('##');

        return [
            'name' => $name,
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
            // HURU profile fields
            'username' => $username,
            'display_name' => fake()->firstName(),
            'pronouns' => fake()->randomElement(['he/him', 'she/her', 'they/them', 'any/all']),
            'bio' => fake()->optional(0.7)->sentence(),
            'country' => fake()->randomElement(['Kenya', 'Uganda', 'South Africa', 'Nigeria', 'United Kingdom', 'United States', 'Germany', 'Brazil', 'India', 'Canada', 'Australia', 'Ghana', 'Tanzania', 'Rwanda']),
            'city' => fake()->optional(0.6)->city(),
            'location_hidden' => fake()->boolean(30),
            'avatar_path' => null,
            'profile_visibility' => fake()->randomElement(['public', 'members', 'connections']),
            'messaging_permission' => fake()->randomElement(['everyone', 'connections', 'no_one']),
            'show_online' => fake()->boolean(60),
            'intents' => fake()->randomElements(['friendship', 'support', 'romance', 'community'], fake()->numberBetween(1, 3)),
            'ghost_mode' => false,
            'onboarding_completed' => true,
            'is_suspended' => false,
            'is_admin' => false,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the model has two-factor authentication configured.
     */
    public function withTwoFactor(): static
    {
        return $this->state(fn (array $attributes) => [
            'two_factor_secret' => encrypt('secret'),
            'two_factor_recovery_codes' => encrypt(json_encode(['recovery-code-1'])),
            'two_factor_confirmed_at' => now(),
        ]);
    }
}
