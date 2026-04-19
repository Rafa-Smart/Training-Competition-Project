<?php
// app/Http/Resources/PostResource.php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'caption' => $this->caption,
            'created_at' => $this->created_at_formatted,
            'deleted_at' => $this->deleted_at,
            'user' => [
                'id' => $this->user->id,
                'full_name' => $this->user->full_name,
                'username' => $this->user->username,
                'bio' => $this->user->bio,
                'is_private' => (bool) $this->user->is_private,
                'created_at' => $this->user->created_at->format('Y-m-d H:i:s'),
            ],
            'attachments' => $this->attachments->map(function ($attachment) {
                return [
                    'id' => $attachment->id,
                    'storage_path' => $attachment->storage_path,
                ];
            })->toArray(),
        ];
    }
}