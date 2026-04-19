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
        'username',
        'full_name',
        'is_private',
        'bio',
        'email',
        'password',
    ];
}
