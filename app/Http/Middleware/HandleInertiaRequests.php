<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'display_name' => $user->display_name,
                    'pronouns' => $user->pronouns,
                    'bio' => $user->bio,
                    'country' => $user->country,
                    'city' => $user->city,
                    'location_hidden' => $user->location_hidden,
                    'avatar_url' => $user->avatar_url,
                    'profile_visibility' => $user->profile_visibility,
                    'messaging_permission' => $user->messaging_permission,
                    'show_online' => $user->show_online,
                    'intents' => $user->intents,
                    'ghost_mode' => $user->ghost_mode,
                    'onboarding_completed' => $user->onboarding_completed,
                    'is_admin' => $user->is_admin,
                    'email_verified_at' => $user->email_verified_at,
                ] : null,
            ],
        ];
    }
}
