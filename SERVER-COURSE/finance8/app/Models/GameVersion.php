<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameVersion extends Model
{
    /** @use HasFactory<\Database\Factories\GameVersionFactory> */
    use HasFactory;
    protected $fillable = ['game_id', 'version', 'has_thumbnail'];
    protected $casts = ['has_thumbnail' => 'boolean'];

    public function game(){
        return $this->belongsTo(Game::class);
    }

    public function scores(){
        return $this->hasMany(Score::class);
    }

    public function gamePath(){
        return "/games/{$this->game->slug}/{$this->version}/";
    }

    public function thumbnailUrl(){
        if(!$this->has_thumbnail){
            return null;
        }
        return "/games/{$this->game->slug}/{$this->version}/";
    }

}
