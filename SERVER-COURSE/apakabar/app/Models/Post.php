<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;
    protected $fillable = [
        'category_id',
        'title',
        'slug',
        'thumbnail',
        'body',
        'author_name',
        'visited_count',
        'published_at'
    ];

    protected $casts = [
        'published_at' => 'datetime'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }
}