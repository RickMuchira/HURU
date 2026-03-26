<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Connection;
use App\Models\Report;
use App\Models\Space;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $totalUsers = User::where('is_admin', false)->count();
        $activeUsers = User::where('is_admin', false)
            ->where('is_suspended', false)
            ->where('onboarding_completed', true)
            ->count();
        $ghostUsers = User::where('ghost_mode', true)->count();
        $suspendedUsers = User::where('is_suspended', true)->count();
        $pendingDeletion = User::whereNotNull('deletion_requested_at')->count();
        $totalSpaces = Space::count();
        $publicSpaces = Space::where('type', 'public')->count();
        $totalConnections = Connection::where('status', 'accepted')->count();
        $pendingReports = Report::where('status', 'pending')->count();
        $totalReports = Report::count();

        // New signups in the last 7 days
        $newUsersThisWeek = User::where('is_admin', false)
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        return response()->json([
            'data' => [
                'users' => [
                    'total' => $totalUsers,
                    'active' => $activeUsers,
                    'ghost' => $ghostUsers,
                    'suspended' => $suspendedUsers,
                    'pending_delete' => $pendingDeletion,
                    'new_this_week' => $newUsersThisWeek,
                ],
                'spaces' => [
                    'total' => $totalSpaces,
                    'public' => $publicSpaces,
                ],
                'connections' => $totalConnections,
                'reports' => [
                    'total' => $totalReports,
                    'pending' => $pendingReports,
                ],
            ],
        ]);
    }
}
