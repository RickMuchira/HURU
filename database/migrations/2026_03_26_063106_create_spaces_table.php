<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spaces', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['public', 'private'])->default('public')->index();
            $table->foreignId('creator_id')->constrained('users')->cascadeOnDelete();
            $table->string('avatar_path')->nullable();
            $table->timestamps();
        });

        Schema::create('space_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('space_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('role', ['member', 'moderator'])->default('member');
            $table->timestamp('joined_at')->useCurrent();

            $table->unique(['space_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('space_members');
        Schema::dropIfExists('spaces');
    }
};
