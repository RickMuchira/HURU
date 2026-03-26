<?php

namespace App\Policies;

use App\Models\TrustedContact;
use App\Models\User;

class TrustedContactPolicy
{
    public function update(User $user, TrustedContact $trustedContact): bool
    {
        return $user->id === $trustedContact->user_id;
    }

    public function delete(User $user, TrustedContact $trustedContact): bool
    {
        return $user->id === $trustedContact->user_id;
    }
}
