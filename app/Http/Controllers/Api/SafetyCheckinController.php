<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SafetyCheckin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SafetyCheckinController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $checkins = $request->user()
            ->safetyCheckins()
            ->with('trustedContact')
            ->latest()
            ->take(10)
            ->get();

        return response()->json(['data' => $checkins]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'meet_description' => ['required', 'string', 'max:300'],
            'expected_end_at' => ['required', 'date', 'after:now'],
            'trusted_contact_id' => ['nullable', 'exists:trusted_contacts,id'],
            'location_hint' => ['nullable', 'string', 'max:200'],
        ]);

        if (isset($data['trusted_contact_id'])) {
            $belongs = $request->user()->trustedContacts()->where('id', $data['trusted_contact_id'])->exists();
            abort_if(! $belongs, 403, 'That trusted contact does not belong to you.');
        }

        $checkin = $request->user()->safetyCheckins()->create(array_merge($data, ['status' => 'active']));

        return response()->json(['data' => $checkin, 'message' => 'Check-in started. Stay safe!'], 201);
    }

    public function update(Request $request, SafetyCheckin $checkin): JsonResponse
    {
        abort_if($checkin->user_id !== $request->user()->id, 403);

        $data = $request->validate([
            'status' => ['required', 'in:safe,missed,cancelled'],
        ]);

        $checkin->update($data);

        $message = match ($data['status']) {
            'safe' => 'Great — marked as safe!',
            'cancelled' => 'Check-in cancelled.',
            default => 'Status updated.',
        };

        return response()->json(['data' => $checkin->fresh(), 'message' => $message]);
    }
}
