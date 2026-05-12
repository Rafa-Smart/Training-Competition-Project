<?php

namespace App\Models;
 
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameVersion extends Model
{
    /** @use HasFactory<GameVersionFactory> */
    use HasFactory;

    protected $fillable = ['game_id', 'version', 'has_thumbnail'];

    protected $casts = ['has_thumbnail' => 'boolean'];

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

    public function scores()
    {
        return $this->hasMany(Score::class);
    }

    // Returns the public URL path to serve this version's files
    public function gamePath(): string
    {
        return "/games/{$this->game->slug}/{$this->version}/";
    }

    // Returns thumbnail URL or null
    public function thumbnailUrl(): ?string
    {
        if (! $this->has_thumbnail) {
            return null;
        }

        return "/games/{$this->game->slug}/{$this->version}/thumbnail.png";
    }
}
