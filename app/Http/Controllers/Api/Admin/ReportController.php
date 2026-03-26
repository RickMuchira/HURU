<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $reports = Report::with(['reporter:id,username,display_name,avatar_url', 'reportedUser:id,username,display_name,avatar_url,is_suspended'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $reports->items(),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'total' => $reports->total(),
            ],
        ]);
    }

    public function resolve(Request $request, Report $report): JsonResponse
    {
        $data = $request->validate([
            'action' => ['required', 'in:warn,suspend,none'],
        ]);

        $report->update(['status' => 'resolved']);

        if ($data['action'] === 'suspend' && $report->reportedUser) {
            $report->reportedUser->update(['is_suspended' => true]);
            $report->reportedUser->tokens()->delete();
        }

        $actionMsg = match ($data['action']) {
            'suspend' => ' Reported user suspended.',
            'warn' => ' Reported user noted for review.',
            default => '',
        };

        return response()->json(['message' => "Report resolved.{$actionMsg}"]);
    }

    public function dismiss(Report $report): JsonResponse
    {
        $report->update(['status' => 'reviewed']);

        return response()->json(['message' => 'Report dismissed — no action taken.']);
    }
}
