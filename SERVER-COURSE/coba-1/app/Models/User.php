<?php
// app/Models/User.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'full_name',
        'username',
        'bio',
        'password',
        'is_private',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_private' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'followers', 'following_id', 'follower_id')
            ->withPivot('status')
            ->withTimestamps();
    }

    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'followers', 'follower_id', 'following_id')
            ->withPivot('status')
            ->withTimestamps();
    }

    // Helper methods
    public function isFollowing(User $user): bool
    {
        return $this->following()
            ->where('following_id', $user->id)
            ->where('status', 'accepted')
            ->exists();
    }

    public function hasRequestedFollow(User $user): bool
    {
        return $this->following()
            ->where('following_id', $user->id)
            ->where('status', 'pending')
            ->exists();
    }

    public function isFollowedBy(User $user): bool
    {
        return $this->followers()
            ->where('follower_id', $user->id)
            ->where('status', 'accepted')
            ->exists();
    }

    public function hasFollowRequestFrom(User $user): bool
    {
        return $this->followers()
            ->where('follower_id', $user->id)
            ->where('status', 'pending')
            ->exists();
    }

    public function getFollowersCountAttribute(): int
    {
        return $this->followers()->where('status', 'accepted')->count();
    }

    public function getFollowingCountAttribute(): int
    {
        return $this->following()->where('status', 'accepted')->count();
    }

    public function getPostsCountAttribute(): int
    {
        return $this->posts()->count();
    }
}