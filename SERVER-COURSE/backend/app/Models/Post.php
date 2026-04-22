<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /** @use HasFactory<\Database\Factories\PostFactory> */
    use HasFactory;
    protected $fillable = [
        'user_id',
        'caption'
    ];

    protected $casts = [
        'created_at'=>'datetime:Y-m-d H:i:s',
        'updated_at'=>'datetime:Y-m-d H:i:s'
    ];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function attachments(){
        return $this->hasMany(PostAttachment::class);
    }
}


