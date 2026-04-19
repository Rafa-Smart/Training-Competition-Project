<?php

namespace App\Models;

use Database\Factories\PostFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /** @use HasFactory<PostFactory> */
    use HasFactory;
     protected $fillable = [
        'caption',
        'user_id'
    ];


    protected function users()
    {
        return $this->belongsTo(User::class);
    }

    protected function attachments()
    {
        return $this->hasMany(PostAttachment::class);
    }
        protected function casts(): array
    {
        return [
            'created_at' => 'datetime:Y:m:d H:i:s',
            'updated_at' => 'datetime:Y:m:d H:i:s',
        ];
    }
}
