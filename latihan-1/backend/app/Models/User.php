<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

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
        'full_name',
        'bio',
        'username',
        'is_private',
        'password',
        'email',
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
            'is_private' => 'boolean',
        ];
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    // untuk dapetin followers

    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')->withPivot('status')->withTimestamps();
    }

    public function following()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')->withPivot('status')->withTimestamps();
    }

    // cek apakah saya mengikuti dia

    // ini penjelasan lengapnya
    // https://chat.deepseek.com/a/chat/s/e3140b07-1f5d-406e-8bdc-b9806492e0c9

    public function isFollowing(User $userTarget)
    {
        // gini doangkan dapetin yang kita follow kan gini
        // return $this->following();

        // disni cek apakah kita follow dia jadi
        // following_id kita set jadi id kita,
        // dangna cara nanti tuh pake misla $userSaatIni->following() -> dia follower_id nya pake id saat ini
        // nah biasanya kan kalo ktia engga pake where, nanti dia itu akan cari semua yang kita ikutin
        // makanya disini kita cek
        // lalu kita cek juga yang dia itu

        // jadi si following_idnya itu dari si parameter $userTarget
        // dan kita ceck juga apakah dia accept statusya, kalo iya true kalo engga false
        return $this->following()->where('following_id', $userTarget->id)
            ->where('status', 'accepted')->exists();
    }

    public function hasRequestedFollow(User $targetUser)
    {

        // nah dinsi tuh kita cek apakahkita pernah kirim permintaan follow
        // ke user ayng lagi di private ini
        return $this->following()->where('following_id', $targetUser)->where('status', 'pending')->exists();
    }
}
