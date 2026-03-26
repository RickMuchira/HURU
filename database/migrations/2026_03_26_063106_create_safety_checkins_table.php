<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('safety_checkins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('trusted_contact_id')->nullable()->constrained('trusted_contacts')->nullOnDelete();
            $table->string('meet_description');
            $table->string('location_hint')->nullable();
            $table->timestamp('expected_end_at');
            $table->enum('status', ['active', 'safe', 'missed', 'cancelled'])->default('active')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('safety_checkins');
    }
};
