<?php

namespace App\Models;

use Database\Factories\FollowFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Follow extends Model
{
    /** @use HasFactory<FollowFactory> */
    use HasFactory;

    protected $fillable = [
        'follower_id',
        'status',
        'following_id',
    ];
}
