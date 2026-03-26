<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SpaceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'type' => $this->type,
            'avatar_path' => $this->avatar_path,
            'creator_id' => $this->creator_id,
            'member_count' => $this->when(isset($this->member_count), $this->member_count, fn () => $this->members()->count()),
            'is_member' => $this->when(isset($this->is_member), $this->is_member),
            'role' => $this->when(isset($this->role), $this->role),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
