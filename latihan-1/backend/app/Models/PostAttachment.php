<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostAttachment extends Model
{
    /** @use HasFactory<\Database\Factories\PostAttacmentFactory> */
    use HasFactory;
    protected $fillable = ['storage_path','post_id'];
}
