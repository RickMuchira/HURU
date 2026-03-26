<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TrustedContact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrustedContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $contacts = $request->user()->trustedContacts()->latest()->get();

        return response()->json(['data' => $contacts]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'safe_channel' => ['required', 'string', 'max:200'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $contact = $request->user()->trustedContacts()->create($data);

        return response()->json(['data' => $contact, 'message' => 'Trusted contact added.'], 201);
    }

    public function update(Request $request, TrustedContact $contact): JsonResponse
    {
        abort_if($contact->user_id !== $request->user()->id, 403);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'safe_channel' => ['sometimes', 'string', 'max:200'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $contact->update($data);

        return response()->json(['data' => $contact->fresh(), 'message' => 'Contact updated.']);
    }

    public function destroy(Request $request, TrustedContact $contact): JsonResponse
    {
        abort_if($contact->user_id !== $request->user()->id, 403);
        $contact->delete();

        return response()->json(['message' => 'Trusted contact removed.']);
    }
}
