<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PostFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->sentence();

        return [
            'category_id' => Category::inRandomOrder()->first()->id,

            'title' => $title,

            'slug' => Str::slug($title . '-' . fake()->unique()->numberBetween(1, 9999)),

            'thumbnail' => 'https://picsum.photos/800/600?random=' . rand(1, 999),
// test
            'body' => fake()->paragraphs(10, true),

            'author_name' => fake()->name(),

            'visited_count' => rand(100, 5000),

            'published_at' => now(),
        ];
    }
}