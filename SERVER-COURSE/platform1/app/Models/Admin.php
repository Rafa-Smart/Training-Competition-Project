<?php

namespace App\Models;

use Database\Factories\ScoreFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Score extends Model
{
    /** @use HasFactory<ScoreFactory> */
    use HasFactory;

    protected $fillable = ['game_version_id', 'user_id', 'score'];

    public function gameVersion()
    {
        return $this->belongsTo(GameVersion::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
