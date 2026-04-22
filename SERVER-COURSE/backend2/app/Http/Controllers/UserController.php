<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function follow($username)
    {
        try {
            DB::beginTransaction();

            $userOther = User::where('username', $username)->first();
            if (! $userOther) {
                return response()->json(['message' => 'User not found'], 404);
            }

            if (Auth::id() === $userOther->id) {
                return response()->json([
                    'message' => 'You are not allowed to follow yourself',
                ], 422);
            }

            $existingFollow = Follow::where('follower_id', Auth::id())
                ->where('following_id', $userOther->id)
                ->first();

            if ($existingFollow) {
                return response()->json([
                    'message' => 'Already followed',
                    'status' => $existingFollow->status === 'pending'
                        ? 'requested'
                        : 'following',
                ], 422);
            }
            // return 44;
            $status = $userOther->is_private ? 'pending' : 'accepted';
            // return $status;
            Follow::create([
                'follower_id' => Auth::id(),
                'following_id' => $userOther->id,
                'status' => $status,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Follow success',
                'status' => $status === 'pending' ? 'requested' : 'following',
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function unFollow($username)
    {
        try {
            DB::beginTransaction();
            $userOther = User::where('username', $username)->first();
            if (! $userOther) {
                return response()->json([
                    'message' => 'User not found',
                ], 404);

            }

            $isImFollow = Follow::where('follower_id', Auth::user()->id)
                ->where('following_id', $userOther->id)->first();

            if (! $isImFollow) {
                return response()->json([
                    'message' => 'You are not following the user',
                ], 422);
            }

            $isImFollow->delete();

            DB::commit();

            return response()->json(null, 204);

        } catch (Exception $e) {
            throw $e;
        }
    }


    public function getFollowing()
    {
        try {
            DB::beginTransaction();
            $user = User::where('username', Auth()->user()->username)->first();
            if (! $user) {
                return response()->json([
                    'message' => 'User not found',
                ], 404);

            }

            $following = $user->following()->get()

            // ji fungis get itu untuk eksekusi ke db
            // kemudian untuk pivot itu adalah objek berisi staus dan timestamp (ada di model)
            // penjelasannya
                ->each(function ($following) {
                    $following->is_requested = $following->pivot->status !== 'accepted';

                    // unset iin artinya untuk menghilangkan atribut pivot di dalam objek user
                    unset($following->pivot);

                    // jadi kita akn dapat data user objek
                });

            DB::commit();

            return response()->json([
                'following' => $following,
            ], 200);

        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getFollower()
    {
        try {
            DB::beginTransaction();
            $user = User::where('username', Auth()->user()->username)->first();
            if (! $user) {
                return response()->json([
                    'message' => 'User not found',
                ], 404);

            }

            $followers = $user->follower()->get()
                ->each(function ($follower) {
                    $follower->is_requested = $follower->pivot->status !== 'accepted';
                    unset($follower->pivot);
                });

            DB::commit();

            return response()->json([
                'followers' => $followers,
            ], 200);

        } catch (Exception $e) {
            throw $e;
        }
    }


    public function acceptFollowRequest($username)
    {
        try {
            DB::beginTransaction();
            $user = User::where('username', $username)->first();
            if (! $user) {
                return response()->json([
                    'message' => 'User not found',
                ], 404); 
            }

            $isFollowed = Follow::where('follower_id', $user->id)
                ->where('status', 'accepted')->first();
            if ($isFollowed) {
                return response()->json([
                    'message' => 'Follow request is already accepted',
                ], 422);

            }

            $isFollowedYou = Follow::where('following_id', Auth::user()->id)
                ->where('follower_id', $user->id)->first();
            if (! $isFollowedYou) {
                return response()->json([
                    'message' => 'The user is not following you',
                ], 422);
            }

            $isFollowedYou->status = 'accepted';
            $isFollowedYou->save();
            DB::commit();
            // return $isFollowedYou;

            return response()->json([
                'message' => 'Follow request accepted',
            ], 200);

        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getFollowerOther($username)
    {
        try {
            DB::beginTransaction();
            $user = User::where('username', $username)->first();
            if (! $user) {
                return response()->json([
                    'message' => 'User not found',
                ], 404);

            }

            $followers = $user->follower()->get()
                ->each(function ($follower) {
                    $follower->is_requested = $follower->pivot->status !== 'accepted';
                    unset($follower->pivot);
                });

            DB::commit();

            return response()->json([
                'followers' => $followers,
            ], 200);

        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getFollowingOther($username)
    {
        try {
            DB::beginTransaction();
            $user = User::where('username', $username)->first();
            if (! $user) {
                return response()->json([
                    'message' => 'User not found',
                ], 404);

            }

            $followings = $user->following()->get()
                ->each(function ($following) {
                    $following->is_requested = $following->pivot->status !== 'accepted';
                    unset($following->pivot);
                });

            DB::commit();

            return response()->json([
                'followings' => $followings,
            ], 200);

        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getUsers()
    {
        try {
            DB::beginTransaction();
            $user = User::where('username', Auth::user()->username)->first();
            if (! $user) {
                return response()->json([
                    'message' => 'User not found',
                ], 404);

            }

            // ini tuh following_id ya isi dari users.id kenapa ketika syaseperti
            // karena kalo ktia pake following maka parameter pertamanya itu 
            // follower_id 
            // karena daru $user -> ini sudah masukin follower_id kao dia chain
            // pake method following
            // 
            
            // nah jdai kenapa dia itu sekarang pluck (hanya ambil yang ada di pluck)
            // dari users.id kenapa ga following_id aja yaga ? nah karena return dari fugnsi relasi ini adalah user
            // makaya kao kta pake following_id itu akan return model follow, jadi akna error
            $myFollowing = $user->following()->pluck('users.id')->toArray();
            $myFollowing[] = $user->id;

            $users = User::whereNotIn('id', $myFollowing)->get();

            DB::commit();

            return response()->json([
                'users' => $users,
            ], 200);

        } catch (Exception $e) {
            throw $e;
        }
    }

    // public function detailUser($username)
    // {
    //     try {
    //         DB::beginTransaction();
    //         $user = User::where('username', $username)->first();
    //         if (! $user) {
    //             return response()->json([
    //                 'message' => 'User not found',
    //             ], 404);

    //         }

    //         $is_your_account = false;
    //         $following_status = 'not-following';
    //         if (Auth::user()->username == $username) {
    //             $following_status = 'your-account';
    //             $is_your_account = true;
    //         } else {
    //             $isFollow = Follow::where('follower_id', Auth::user()->id)
    //                 ->where('following_id', $user->id)->where('status', 'accepted')->first();
    //             $isRequest = Follow::where('follower_id', Auth::user()->id)
    //                 ->where('following_id', $user->id)->where('status', 'pending')->first();
    //         }

    //         if ($isFollow) {
    //             $following_status = 'following';
    //         }
    //         if ($isRequest) {
    //             $following_status = 'requested';
    //         }

    //         $isShowPosts = $is_your_account || ! $user->is_private && $following_status != 'requested' || $following_status == 'following' || $user->is_private && $following_status == 'following';

    //         if ($isShowPosts) {
    //             $user->load(['posts.attachments']);
    //         } else {
    //             $user->makeHidden('posts');
    //         }

    //         $user->setAttribute('is_your_account', $is_your_account);
    //         $user->setAttribute('following_status', $following_status);
    //         $user->setAttribute('posts_count', $user->posts()->count());
    //         $user->setAttribute('followers_count', $user->follower()->where('status', 'accepted')->count());
    //         $user->setAttribute('following_count', $user->following()->where('status', 'accepted')->count());

    //         DB::commit();

    //         return response()->json($user, 200);

    //     } catch (Exception $e) {
    //         throw $e;
    //     }
    // }

    public function detailUser($username)
    {
        try {
            $user = User::where('username', $username)->first();
            if (! $user) {
                return response()->json([
                    'message' => 'User not found',
                ], 404);
            }

            $authUser = Auth::user();
            $is_your_account = $authUser->id === $user->id;
            // jadi ini tuh fungisnya untuk ini

            $following_status = 'not-following';
            if ($is_your_account) {
                $following_status = 'your-account';
            } else {
                $follow = Follow::where('follower_id', $authUser->id)
                    ->where('following_id', $user->id)
                    ->first();
                if ($follow) {
                    $following_status = $follow->status === 'accepted' ? 'following' : 'requested';
                }
            }

            // Tentukan apakah posts harus ditampilkan
            $showPosts = false;
            if ($is_your_account) {
                $showPosts = true;
            } elseif (! $user->is_private) {
                // Akun publik, tapi jika statusnya requested, maka tidak boleh melihat posts?
                // Dari spesifikasi: "Field posts should be hidden if the user is a private user and the follow status is not following or is requested."
                // Jadi untuk akun publik, posts ditampilkan jika status bukan requested?
                // Tapi spesifikasi hanya menyebut untuk private user. Untuk akun publik, posts selalu ditampilkan.
                $showPosts = true;
            } elseif ($user->is_private && $following_status === 'following') {
                // Akun privat dan sudah diikuti (diterima)
                $showPosts = true;
            }

            // kalo g mau gini
            // ktia harus menghapus semua atribut di model user agar
            // nanti tinggal di kemblikan saja

            // Siapkan data user
            $response = [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'username' => $user->username,
                'bio' => $user->bio,
                'is_private' => $user->is_private,
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'is_your_account' => $is_your_account,
                'following_status' => $following_status,
                'posts_count' => $user->posts()->count(),

                // ini kalo kita ambil data yang sudah di accept
                // 'followers_count' => $user->follower()->where('status', 'accepted')->count(),
                // 'following_count' => $user->following()->where('status', 'accepted')->count(),


                // ini kalo kita ambil data yang apapun -> accept dan pending
                'followers_count' => $user->follower()->count(),
                'following_count' => $user->following()->count(),
            ];

            // Jika harus menampilkan posts, load posts dengan attachments
            if ($showPosts) {
                $posts = $user->posts()->with('attachments')->get()->map(function ($post) { 
                    return [
                        'id' => $post->id,
                        'user_id'=>$post->user_id,
                        'caption' => $post->caption,
                        'created_at' => $post->created_at->format('Y-m-d H:i:s'),
                        'deleted_at' => $post->deleted_at,
                        'attachments' => $post->attachments->map(function ($attachment) {
                            return [
                                'id' => $attachment->id,
                                'storage_path' => $attachment->storage_path,
                            ];
                        }),
                    ];
                });
                $response['posts'] = $posts;
            }

            return response()->json($response, 200);

        } catch (Exception $e) {
            return response()->json([
                'message' => 'An error occurred',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

// ini error dari detailUsers sebelumnya
// Kode di atas memiliki beberapa kesalahan dan kekurangan:
// https://chat.deepseek.com/a/chat/s/733470f0-7804-4842-b019-f2eb82c7fb5c
// Typo: $user->usernane seharusnya $user->username

// Logika pengecekan akun sendiri: Seharusnya membandingkan ID user yang sedang login dengan ID user yang ditemukan, bukan membandingkan username parameter dengan username dari user yang ditemukan (karena sudah ditemukan berdasarkan username, pasti sama). Sebaiknya gunakan Auth::id() === $user->id untuk mengecek apakah itu akun sendiri.

// Variabel $followingStatus tidak digunakan: Anda menetapkan $followingStatus = 'your-account'; tapi kemudian tidak mempengaruhi $following_status yang seharusnya menjadi 'your-account' jika itu akun sendiri.

// Logika untuk menampilkan posts (variabel $isShowPosts): Terlalu rumit dan mungkin tidak sesuai dengan spesifikasi. Berdasarkan spesifikasi, posts harus ditampilkan jika:

// Itu adalah akun sendiri, atau

// User tersebut tidak private (is_private = 0) dan status follow bukan 'requested', atau

// Status follow adalah 'following' (artinya sudah diikuti dan diterima)
// Namun, untuk user private, hanya yang sudah diikuti (status 'following') yang boleh melihat posts. Status 'requested' (permintaan follow tertunda) tidak boleh melihat posts.

// Sedangkan kode Anda:
// $isShowPosts = $is_your_account || ! $user->is_private && $following_status != 'requested' || $following_status == 'following' || $user->is_private && $following_status == 'following';
// Ini bisa disederhanakan dan diperbaiki.

// Penggunaan $user->posts->count(): Ini akan memuat semua posts ke memori hanya untuk menghitung, lebih baik gunakan $user->posts()->count() untuk efisiensi.

// Penggunaan DB::beginTransaction() dan DB::commit(): Pada method ini hanya ada operasi read, tidak ada write, sehingga transaction tidak diperlukan.

// Response JSON langsung dari model User: Ini akan menampilkan semua atribut model, termasuk yang seharusnya tidak ditampilkan (seperti password, remember_token, dll). Lebih baik buat array response manual.

// Penanganan jika $isFollow atau $isRequest tidak didefinisikan: Pada bagian else, kita mendefinisikan $isFollow dan $isRequest, tapi jika itu akun sendiri, kedua variabel tersebut tidak didefinisikan. Sehingga saat mengecek if ($isFollow) dan if ($isRequest) akan error. Oleh karena itu, lebih baik inisialisasi variabel tersebut di luar.

// Field following_status untuk akun sendiri: Spesifikasi tidak menyebutkan nilai apa yang harus dikembalikan untuk akun sendiri, tapi dari contoh response, ada kemungkinan untuk akun sendiri, following_status bisa di-set sebagai string kosong atau null. Namun, di kode Anda, jika akun sendiri, $following_status tetap 'not-following' (karena diinisialisasi seperti itu dan tidak diubah di dalam if). Sebaiknya untuk akun sendiri, set following_status menjadi 'your-account' atau nilai khusus.

// Struktur response: Spesifikasi menunjukkan bahwa response harus memiliki struktur yang jelas, dengan posts dalam bentuk array of object dengan attachment.
