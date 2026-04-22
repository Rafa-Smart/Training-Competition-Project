<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostAttachment extends Model
{
    /** @use HasFactory<\Database\Factories\PostAttachmentFactory> */
    use HasFactory;
 protected $fillable = [
        'post_id',
        'storage_path'
    ];


}
