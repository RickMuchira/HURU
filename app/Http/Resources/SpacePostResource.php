<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\MiniUserResource;

class SpacePostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'space_id' => $this->space_id,
            'user_id' => $this->user_id,
            'body' => $this->body,
            'created_at' => $this->created_at?->toISOString(),
            'author' => new MiniUserResource($this->whenLoaded('author')),
        ];
    }
}
