<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'password',
        'full_name',
        'username',
        'bio',
        'is_private',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function posts(){
        return $this->hasMany(Post::class);
    }

    public function follower(){
        return $this->belongsToMany(User::class, 'follows', "following_id", 'follower_id')->withPivot('status')->withTimestamps();
        // pivot itu adalh data yang dadi dalam tabel pivot / penghubugnya
    }

    public function following(){
        return $this->belongsToMany(User::class, 'follows', "follower_id", 
            // nah kalo kita ga pake pivot nanti dat ayang di hasillkan itu hanya
            // followingid dan field followerid nya saja karena hanya field yang berelasinya aja yang diambil, nah kalo kita pake pivot maka field yang berelasi itu akan diambil semua termasuk statusnya
        'following_id')->withPivot('status')->withTimestamps();
    }
}
