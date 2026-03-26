<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->nullable()->after('id');
            $table->string('display_name')->nullable()->after('username');
            $table->string('pronouns')->nullable()->after('display_name');
            $table->string('bio', 160)->nullable()->after('pronouns');
            $table->string('country')->nullable()->after('bio');
            $table->string('city')->nullable()->after('country');
            $table->boolean('location_hidden')->default(false)->after('city');
            $table->string('avatar_path')->nullable()->after('location_hidden');
            $table->enum('profile_visibility', ['public', 'members', 'connections'])->default('members')->after('avatar_path');
            $table->enum('messaging_permission', ['everyone', 'connections', 'no_one'])->default('connections')->after('profile_visibility');
            $table->boolean('show_online')->default(false)->after('messaging_permission');
            $table->json('intents')->nullable()->after('show_online');
            $table->boolean('ghost_mode')->default(false)->after('intents');
            $table->boolean('onboarding_completed')->default(false)->after('ghost_mode');
            $table->boolean('is_suspended')->default(false)->after('onboarding_completed');
            $table->boolean('is_admin')->default(false)->after('is_suspended');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username', 'display_name', 'pronouns', 'bio',
                'country', 'city', 'location_hidden', 'avatar_path',
                'profile_visibility', 'messaging_permission', 'show_online',
                'intents', 'ghost_mode', 'onboarding_completed',
                'is_suspended', 'is_admin',
            ]);
        });
    }
};
