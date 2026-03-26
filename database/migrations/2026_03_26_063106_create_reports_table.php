<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('reported_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('reason');
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'reviewed', 'resolved'])->default('pending')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
