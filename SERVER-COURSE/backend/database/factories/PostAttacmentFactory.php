<?php

namespace Database\Factories;

use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PostAttachment>
 */
class PostAttachmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'post_id' => Post::factory(),
            'storage_path' => 'posts/' . $this->faker->uuid . '.jpg',
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * State for specific post
     */
    public function forPost(Post $post): Factory
    {
        return $this->state(function (array $attributes) use ($post) {
            return [
                'post_id' => $post->id,
            ];
        });
    }
}