<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Teknologi',
                'slug' => 'teknologi'
            ],
            [
                'name' => 'Olahraga',
                'slug' => 'olahraga'
            ],
            [
                'name' => 'Bisnis',
                'slug' => 'bisnis'
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }

        $tags = [
            'AI',
            'Startup',
            'Mobile',
            'Laravel',
            'React',
            'Football',
        ];

        foreach ($tags as $tag) {
            Tag::create([
                'name' => $tag
            ]);
        }

        Post::factory(50)->create()->each(function ($post) {
            $post->tags()->attach(
                Tag::inRandomOrder()->limit(rand(1, 3))->pluck('id')
            );
        });
    }
}