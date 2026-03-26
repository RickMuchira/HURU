<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpacePost extends Model
{
    protected $fillable = ['space_id', 'user_id', 'body'];

    public function space(): BelongsTo
    {
        return $this->belongsTo(Space::class);
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
