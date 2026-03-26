<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SafetyCheckin extends Model
{
    protected $fillable = [
        'user_id',
        'trusted_contact_id',
        'meet_description',
        'location_hint',
        'expected_end_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'expected_end_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trustedContact(): BelongsTo
    {
        return $this->belongsTo(TrustedContact::class);
    }
}
