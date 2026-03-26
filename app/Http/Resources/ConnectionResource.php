<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConnectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'requester_id' => $this->requester_id,
            'receiver_id' => $this->receiver_id,
            'requester' => new MemberResource($this->whenLoaded('requester')),
            'receiver' => new MemberResource($this->whenLoaded('receiver')),
            'created_at' => $this->created_at,
        ];
    }
}
