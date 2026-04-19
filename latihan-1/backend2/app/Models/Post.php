<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /** @use HasFactory<\Database\Factories\PostFactory> */
    use HasFactory;

    protected $fillable =[
        'caption',
        'user_id'
    ];
        protected function casts(): array
    {
        return [
            'created_at'=>"datetime:Y:m:d H:i:s",
            'updated_at'=>"datetime:Y:m:d H:i:s"
        ];
    }


    public function users (){
        return $this->belongsTo(user::class);
    }

    public function attachments(){
        return $this->hasMany(PostAttachment::class);
    }
    
}
