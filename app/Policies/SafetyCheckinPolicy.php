<?php

namespace App\Policies;

use App\Models\SafetyCheckin;
use App\Models\User;

class SafetyCheckinPolicy
{
    public function update(User $user, SafetyCheckin $safetyCheckin): bool
    {
        return $user->id === $safetyCheckin->user_id;
    }
}
