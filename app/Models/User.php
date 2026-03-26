<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
        'display_name',
        'pronouns',
        'bio',
        'country',
        'city',
        'location_hidden',
        'avatar_path',
        'profile_visibility',
        'messaging_permission',
        'show_online',
        'intents',
        'ghost_mode',
        'onboarding_completed',
        'is_suspended',
        'is_admin',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
        'email',
        'is_admin',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'intents' => 'array',
            'location_hidden' => 'boolean',
            'show_online' => 'boolean',
            'ghost_mode' => 'boolean',
            'onboarding_completed' => 'boolean',
            'is_suspended' => 'boolean',
            'is_admin' => 'boolean',
        ];
    }

    public function connections(): HasMany
    {
        return $this->hasMany(Connection::class, 'requester_id');
    }

    public function receivedConnections(): HasMany
    {
        return $this->hasMany(Connection::class, 'receiver_id');
    }

    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants')
            ->withPivot('joined_at')
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function spaces(): BelongsToMany
    {
        return $this->belongsToMany(Space::class, 'space_members')
            ->withPivot('role', 'joined_at');
    }

    public function createdSpaces(): HasMany
    {
        return $this->hasMany(Space::class, 'creator_id');
    }

    public function spacePosts(): HasMany
    {
        return $this->hasMany(SpacePost::class);
    }

    public function trustedContacts(): HasMany
    {
        return $this->hasMany(TrustedContact::class);
    }

    public function safetyCheckins(): HasMany
    {
        return $this->hasMany(SafetyCheckin::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    public function isConnectedTo(User $user): bool
    {
        return Connection::where(function ($q) use ($user) {
            $q->where('requester_id', $this->id)->where('receiver_id', $user->id);
        })->orWhere(function ($q) use ($user) {
            $q->where('requester_id', $user->id)->where('receiver_id', $this->id);
        })->where('status', 'accepted')->exists();
    }

    public function hasBlockedOrBeenBlockedBy(User $user): bool
    {
        return Connection::where(function ($q) use ($user) {
            $q->where('requester_id', $this->id)->where('receiver_id', $user->id);
        })->orWhere(function ($q) use ($user) {
            $q->where('requester_id', $user->id)->where('receiver_id', $this->id);
        })->where('status', 'blocked')->exists();
    }

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar_path ? asset('storage/'.$this->avatar_path) : null;
    }
}
