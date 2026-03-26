<?php

use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [PageController::class, 'landing'])->name('landing');
Route::redirect('/join', '/register')->name('join');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    // Onboarding — forced until completed
    Route::get('/onboarding', [OnboardingController::class, 'show'])->name('onboarding');
    Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

    // Main app pages — require onboarding complete
    Route::middleware(['onboarding.complete'])->group(function () {
        Route::get('/home', [PageController::class, 'home'])->name('home');
        Route::get('/members', [PageController::class, 'members'])->name('members');
        Route::get('/members/{username}', [PageController::class, 'memberShow'])->name('members.show');
        Route::get('/connections', [PageController::class, 'connections'])->name('connections');
        Route::get('/messages', [PageController::class, 'messages'])->name('messages');
        Route::get('/messages/{username}', [PageController::class, 'messageThread'])->name('messages.show');
        Route::get('/spaces', [PageController::class, 'spaces'])->name('spaces');
        Route::get('/spaces/create', [PageController::class, 'spacesCreate'])->name('spaces.create');
        Route::get('/spaces/{slug}', [PageController::class, 'spaceShow'])->name('spaces.show');
        Route::get('/profile', [PageController::class, 'profile'])->name('profile');

        // Settings
        Route::redirect('/settings', '/settings/profile');
        Route::get('/settings/profile', [ProfileController::class, 'edit'])->name('settings.profile');
        Route::patch('/settings/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::get('/settings/privacy', [PageController::class, 'settingsPrivacy'])->name('settings.privacy');
        Route::get('/settings/safety', [PageController::class, 'settingsSafety'])->name('settings.safety');
        Route::get('/settings/security', [SecurityController::class, 'edit'])->name('security.edit');
        Route::put('/settings/password', [SecurityController::class, 'update'])
            ->middleware('throttle:6,1')
            ->name('user-password.update');
        Route::delete('/settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
| NOTE: Change /admin prefix before going to production (see README).
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/login', [PageController::class, 'adminLogin'])->name('login');

    Route::middleware(['auth', 'admin'])->group(function () {
        Route::get('/dashboard', [PageController::class, 'adminDashboard'])->name('dashboard');
        Route::get('/users', [PageController::class, 'adminUsers'])->name('users');
        Route::get('/reports', [PageController::class, 'adminReports'])->name('reports');
        Route::get('/spaces', [PageController::class, 'adminSpaces'])->name('spaces');
    });
});
