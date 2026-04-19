<?php
// app/Http/Resources/UserResource.php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'username' => $this->username,
            'bio' => $this->bio,
            'is_private' => (bool) $this->is_private,
            'created_at' => $this->created_at->format('Y-m-d\TH:i:s.u\Z'),
            'updated_at' => $this->updated_at->format('Y-m-d\TH:i:s.u\Z'),
        ];
    }

    // For detail user response
    public function toDetailArray(Request $request, bool $isYourAccount, string $followingStatus): array
    {
        $data = [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'username' => $this->username,
            'bio' => $this->bio,
            'is_private' => (bool) $this->is_private,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'is_your_account' => $isYourAccount,
            'following_status' => $followingStatus,
            'posts_count' => $this->posts_count,
            'followers_count' => $this->followers_count,
            'following_count' => $this->following_count,
        ];

        // Show posts only if user is not private OR user is followed/accepted
        $shouldShowPosts = !$this->is_private || 
                          ($followingStatus === 'following' || $followingStatus === 'requested') ||
                          $isYourAccount;

        if ($shouldShowPosts) {
            $data['posts'] = PostResource::collection($this->posts()->latest()->get());
        } else {
            $data['posts'] = [];
        }

        return $data;
    }

    // For follower/following list
    public function toFollowerFollowingArray(Request $request, bool $isRequested = false): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'username' => $this->username,
            'bio' => $this->bio,
            'is_private' => (bool) $this->is_private,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'is_requested' => $isRequested,
        ];
    }
}