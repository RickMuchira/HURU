<?php

namespace Database\Seeders;

use App\Models\Connection;
use App\Models\Space;
use App\Models\SpacePost;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MemberSeeder extends Seeder
{
    public function run(): void
    {
        // 20 varied members
        $members = User::factory(20)->create();

        // Seed a few named test accounts for easy manual login
        $testAccounts = [
            ['display_name' => 'Alex Nduru', 'pronouns' => 'he/him', 'country' => 'Kenya', 'intents' => ['friendship', 'community']],
            ['display_name' => 'Sasha Müller', 'pronouns' => 'they/them', 'country' => 'Germany', 'intents' => ['support', 'friendship']],
            ['display_name' => 'Priya Nair', 'pronouns' => 'she/her', 'country' => 'India', 'intents' => ['romance', 'friendship']],
            ['display_name' => 'Jordan Lee', 'pronouns' => 'any/all', 'country' => 'United States', 'intents' => ['community', 'support']],
        ];

        foreach ($testAccounts as $i => $data) {
            $slug = Str::slug($data['display_name']);
            User::factory()->create([
                'email' => "test{$i}@huru.app",
                'username' => $slug.rand(10, 99),
                'display_name' => $data['display_name'],
                'pronouns' => $data['pronouns'],
                'country' => $data['country'],
                'intents' => $data['intents'],
                'bio' => fake()->sentence(),
                'profile_visibility' => 'public',
                'messaging_permission' => 'everyone',
                'onboarding_completed' => true,
            ]);
        }

        $allMembers = User::where('is_admin', false)->get();

        // Seed a few accepted connections
        $pairs = $allMembers->shuffle()->chunk(2)->take(8);
        foreach ($pairs as $pair) {
            $pair = $pair->values();
            if ($pair->count() < 2) {
                continue;
            }
            Connection::firstOrCreate(
                ['requester_id' => $pair[0]->id, 'receiver_id' => $pair[1]->id],
                ['status' => 'accepted']
            );
        }

        // Seed sample spaces with posts
        $spaceData = [
            ['name' => 'Mental Health Corner', 'type' => 'public', 'description' => 'A safe space to talk about mental health, share resources, and support each other.'],
            ['name' => 'East Africa Queers', 'type' => 'public', 'description' => 'Connecting LGBTQ+ people across East Africa — Kenya, Uganda, Tanzania, Rwanda and beyond.'],
            ['name' => 'Trans Support Circle', 'type' => 'private', 'description' => 'Private, moderated space for trans and non-binary folks to share experiences.'],
            ['name' => 'Books & Chai', 'type' => 'public', 'description' => 'Book club meets chai — recommend reads, share reviews, make friends.'],
        ];

        foreach ($spaceData as $sd) {
            $creator = $allMembers->random();
            $space = Space::create([
                'name' => $sd['name'],
                'slug' => Str::slug($sd['name']),
                'description' => $sd['description'],
                'type' => $sd['type'],
                'creator_id' => $creator->id,
            ]);

            // Creator is moderator
            $space->members()->attach($creator->id, ['role' => 'moderator', 'joined_at' => now()]);

            // A few random members join
            $joiners = $allMembers->where('id', '!=', $creator->id)->random(rand(3, 8));
            foreach ($joiners as $joiner) {
                $space->members()->syncWithoutDetaching([$joiner->id => ['role' => 'member', 'joined_at' => now()]]);
            }

            // Seed posts
            $posters = $space->members()->get()->random(min(5, $space->members()->count()));
            foreach ($posters as $poster) {
                SpacePost::create([
                    'space_id' => $space->id,
                    'user_id' => $poster->id,
                    'body' => fake()->paragraph(),
                ]);
            }
        }
    }
}
