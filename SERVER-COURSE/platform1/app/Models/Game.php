<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    /** @use HasFactory<\Database\Factories\GameFactory> */
    use HasFactory;
    protected $fillable = ['slug', 'title', 'description', 'user_id'];
 
    // ─── Relationships ────────────────────────────────────────────
    public function user()
    {
        return $this->belongsTo(User::class);
    }
 
    public function versions()
    {
        return $this->hasMany(GameVersion::class)->orderByDesc('version');
    }
 
    public function latestVersion()
    {
        return $this->hasOne(GameVersion::class)->latestOfMany('version');
    }
 
    public function scores()
    {
        return $this->hasManyThrough(Score::class, GameVersion::class);
    }
}
