<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Space extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'type', 'creator_id', 'avatar_path'];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'space_members')
            ->withPivot('role', 'joined_at');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(SpacePost::class);
    }

    public function getMemberCountAttribute(): int
    {
        return $this->members()->count();
    }
}
