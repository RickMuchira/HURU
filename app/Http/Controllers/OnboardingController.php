<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        if ($request->user()->onboarding_completed) {
            return redirect()->route('home');
        }

        return Inertia::render('Onboarding/Index');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'step' => ['required', 'integer', 'between:1,4'],
            // Step 1
            'username' => ['sometimes', 'string', 'max:30', 'unique:users,username,'.$request->user()->id, 'regex:/^[a-zA-Z0-9_]+$/'],
            'display_name' => ['sometimes', 'nullable', 'string', 'max:50'],
            'pronouns' => ['sometimes', 'nullable', 'string', 'max:30'],
            // Step 2
            'bio' => ['sometimes', 'nullable', 'string', 'max:160'],
            'country' => ['sometimes', 'nullable', 'string', 'max:100'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'location_hidden' => ['sometimes', 'boolean'],
            // Step 3
            'intents' => ['sometimes', 'array'],
            'intents.*' => ['string', 'in:friendship,support,dating,community,browsing'],
            // Step 4
            'ghost_mode' => ['sometimes', 'boolean'],
            'complete' => ['sometimes', 'boolean'],
        ]);

        $request->user()->fill(collect($validated)->except(['step', 'complete'])->toArray())->save();

        if (! empty($validated['complete'])) {
            $request->user()->update(['onboarding_completed' => true]);

            return redirect()->route('home');
        }

        return back();
    }
}
