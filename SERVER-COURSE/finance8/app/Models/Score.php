<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Score extends Model
{
    /** @use HasFactory<\Database\Factories\ScoreFactory> */
    use HasFactory;
    protected $fillable = ['user_id', 'game_version_id', 'score'];
    public function gameVersion(){
        return $this->belongsTo(GameVersion::class);
    }

    public function user(){
        return $this->belongsTo(User::class);
    }
}
