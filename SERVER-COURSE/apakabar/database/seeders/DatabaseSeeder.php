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
            [
                'name' => 'Ekonomi',
                'slug' => 'Ekonomi'
            ],
            [
                'name' => 'Game',
                'slug' => 'Game'
            ],
            [
                'name' => 'Ekonomi2',
                'slug' => 'Ekonomi2'
            ],
            [
                'name' => 'Game2',
                'slug' => 'Game2'
            ],
            [
                'name' => 'Ekonomi3',
                'slug' => 'Ekonomi3'
            ],
            [
                'name' => 'Game3',
                'slug' => 'Game3'
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