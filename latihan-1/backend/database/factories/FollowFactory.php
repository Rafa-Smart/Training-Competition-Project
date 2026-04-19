<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Follow>
 */
class FollowFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $follower = User::factory()->create();
        $following = User::factory()->create();
        
        return [
            'follower_id' => $follower->id,
            'following_id' => $following->id,
            'status' => 'accepted',
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * State for specific follower and following
     */
    public function specificUsers(int $followerId, int $followingId): Factory
    {
        return $this->state(function (array $attributes) use ($followerId, $followingId) {
            return [
                'follower_id' => $followerId,
                'following_id' => $followingId,
            ];
        });
    }

    /**
     * State for accepted status
     */
    public function accepted(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'accepted',
            ];
        });
    }

    /**
     * State for requested status
     */
    public function requested(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'requested',
            ];
        });
    }
}