<?php

use App\Http\Controllers\Api\Admin\StatsController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\ConnectionController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SafetyCheckinController;
use App\Http\Controllers\Api\SpaceController;
use App\Http\Controllers\Api\SpacePostController;
use App\Http\Controllers\Api\TrustedContactController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    // Me
    Route::get('/me', [MeController::class, 'show']);
    Route::put('/me/profile', [MeController::class, 'updateProfile']);
    Route::put('/me/privacy', [MeController::class, 'updatePrivacy']);
    Route::put('/me/intents', [MeController::class, 'updateIntents']);
    Route::put('/me/ghost-mode', [MeController::class, 'toggleGhostMode']);

    // Members
    Route::get('/members', [MemberController::class, 'index']);
    Route::get('/members/{username}', [MemberController::class, 'show']);

    // Connections
    Route::get('/connections', [ConnectionController::class, 'index']);
    Route::post('/connections', [ConnectionController::class, 'store']);
    Route::put('/connections/{connection}', [ConnectionController::class, 'update']);

    // Conversations & Messages
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations/find-or-create', [ConversationController::class, 'findOrCreate']);
    Route::get('/conversations/{conversation}/messages', [MessageController::class, 'index']);
    Route::post('/conversations/{conversation}/messages', [MessageController::class, 'store'])
        ->middleware('throttle:60,1');
    Route::delete('/messages/{message}', [MessageController::class, 'destroy']);

    // Spaces
    Route::get('/spaces', [SpaceController::class, 'index']);
    Route::post('/spaces', [SpaceController::class, 'store']);
    Route::get('/spaces/{slug}', [SpaceController::class, 'show']);
    Route::post('/spaces/{slug}/join', [SpaceController::class, 'join']);
    Route::get('/spaces/{slug}/posts', [SpacePostController::class, 'index']);
    Route::post('/spaces/{slug}/posts', [SpacePostController::class, 'store']);

    // Me — profile, privacy, account deletion
    Route::post('/me/request-deletion', [MeController::class, 'requestDeletion']);
    Route::post('/me/cancel-deletion', [MeController::class, 'cancelDeletion']);

    // Reports
    Route::post('/reports', [ReportController::class, 'store']);

    // ── Admin API ─────────────────────────────────────────────────────────
    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/stats', [StatsController::class, 'index']);
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::put('/users/{user}/suspend', [UserController::class, 'suspend']);
        Route::put('/users/{user}/unsuspend', [UserController::class, 'unsuspend']);
        Route::delete('/users/{user}/tokens', [UserController::class, 'revokeTokens']);
        Route::get('/reports', [App\Http\Controllers\Api\Admin\ReportController::class, 'index']);
        Route::put('/reports/{report}/resolve', [App\Http\Controllers\Api\Admin\ReportController::class, 'resolve']);
        Route::put('/reports/{report}/dismiss', [App\Http\Controllers\Api\Admin\ReportController::class, 'dismiss']);
        Route::get('/spaces', [App\Http\Controllers\Api\Admin\SpaceController::class, 'index']);
        Route::get('/spaces/{space:slug}', [App\Http\Controllers\Api\Admin\SpaceController::class, 'show']);
        Route::delete('/spaces/{space:slug}/posts/{post}', [App\Http\Controllers\Api\Admin\SpaceController::class, 'removePost']);
        Route::delete('/spaces/{space:slug}/members/{user}', [App\Http\Controllers\Api\Admin\SpaceController::class, 'removeMember']);
    });

    // Safety
    Route::get('/safety/trusted-contacts', [TrustedContactController::class, 'index']);
    Route::post('/safety/trusted-contacts', [TrustedContactController::class, 'store']);
    Route::put('/safety/trusted-contacts/{contact}', [TrustedContactController::class, 'update']);
    Route::delete('/safety/trusted-contacts/{contact}', [TrustedContactController::class, 'destroy']);
    Route::get('/safety/checkins', [SafetyCheckinController::class, 'index']);
    Route::post('/safety/checkins', [SafetyCheckinController::class, 'store']);
    Route::put('/safety/checkins/{checkin}', [SafetyCheckinController::class, 'update']);
});
