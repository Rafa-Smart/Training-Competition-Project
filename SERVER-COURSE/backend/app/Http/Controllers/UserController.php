<?php

namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\Follow;
use App\Models\User;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    use ApiResponse;

    // ini ketika ktia igin follow user lain
    // dan ingat kita disini sudah bisa terbaca denganadanya Auth::user()
    // public function follow($username)
    // {
    //     try {

    //         // disni kita ambil data user yang mau kita follow dan kita cek
    //         // jadi kalo cek authentication, validasi
    //         // itu sudha di tangani oleh si laravelny, jadi ktai hanya cek
    //         // jika sudha kita follow dan statusnya apa
    //         // kemudia jika ktia follow diri sendiri

    //         $userYangMauDiFollow = User::where('username', $username)->first();

    //         // cek dulu apakah ada
    //         if (! $userYangMauDiFollow) {
    //             return $this->notFoundResource('User');
    //         }

    //         // cek jika dia adalah kita, apakah ktia follow diri sendiri

    //         if ($userYangMauDiFollow->id == Auth::user()->id) {
    //             return $this->errorResponse('You are not allowed to follow yourself', [], 422);
    //         }

    //         // cek lagi apakah kita sudah follow dia dan statusnya apa
    //         $sudahDiFollow = Follow::where('follower_id', Auth::user()->id)
    //             ->where('following_id', $userYangMauDiFollow->id)->first();

    //         if ($sudahDiFollow) {
    //             $status = $sudahDiFollow->status === 'accepted'
    //                 ? 'following'
    //                 : 'requested';

    //             return $this->errorResponse(
    //                 'You are already followed',
    //                 ['status' => $status],
    //                 422
    //             );
    //         }

    //         // jika lewat semua ini bagu ktia tambahkan

    //         DB::beginTransaction();

    //         // jadi jika private maka akn berati statusnya akan requested
    //         $statusCreate = $userYangMauDiFollow->is_private ? 'pending' : 'accepted';

    //         Follow::create([
    //             'following_id' => $userYangMauDiFollow->id,
    //             'follower_id' => Auth::user()->id,
    //             'status' => $statusCreate,
    //         ]);

    //         DB::commit();

    //         // return response()->json([
    //         //     'message' => 'Follow success',
    //         //     'status' => $status,
    //         // ]);

    //         return $this->successResponse('Follow success', ['status' => $status], 200);

    //     } catch (Exception $e) {
    //         DB::rollBack();
    //         throw $e;

    //         return $this->errorResponse('failed to follow user', [], 500);
    //     }
    // }

    public function follow($username)
{
    try {

        // disni kita ambil data user yang mau kita follow dan kita cek
        // jadi kalo cek authentication, validasi
        // itu sudha di tangani oleh si laravelny, jadi ktai hanya cek
        // jika sudha kita follow dan statusnya apa
        // kemudia jika ktia follow diri sendiri

        $userYangMauDiFollow = User::where('username', $username)->first();

        // cek dulu apakah ada
        if (! $userYangMauDiFollow) {
            return $this->notFoundResource('User');
        }

        // cek jika dia adalah kita, apakah ktia follow diri sendiri
        if ($userYangMauDiFollow->id == Auth::user()->id) {
            return $this->errorResponse('You are not allowed to follow yourself', [], 422);
        }

        // cek lagi apakah kita sudah follow dia dan statusnya apa
        $sudahDiFollow = Follow::where('follower_id', Auth::user()->id)
            ->where('following_id', $userYangMauDiFollow->id)
            ->first();

        if ($sudahDiFollow) {
            $status = $sudahDiFollow->status === 'accepted'
                ? 'following'
                : 'requested';

            return $this->errorResponse(
                'You are already followed',
                ['status' => $status],
                422
            );
        }

        // jika lewat semua ini bagu ktia tambahkan

        DB::beginTransaction();

        // jadi jika private maka akn berati statusnya akan requested
        $statusCreate = $userYangMauDiFollow->is_private ? 'pending' : 'accepted';

        Follow::create([
            'following_id' => $userYangMauDiFollow->id,
            'follower_id' => Auth::user()->id,
            'status' => $statusCreate,
        ]);

        DB::commit();

        // return response()->json([
        //     'message' => 'Follow success',
        //     'status' => $status,
        // ]);

        // mapping status response sesuai spec API
        $status = $statusCreate === 'accepted'
            ? 'following'
            : 'requested';

        return $this->successResponse('Follow success', ['status' => $status], 200);

    } catch (Exception $e) {
        DB::rollBack();
        throw $e;

        return $this->errorResponse('failed to follow user', [], 500);
    }
}


    public function unfollow($username)
    {
        // jdi parameeter ini iu isinya adalh user yang mau kita unfollow
        try {

            // dapatkn dulu user yang mau di unfollow
            $userToUnFollow = User::where('username', $username)->first();
            if (! $userToUnFollow) {
                return $this->notFoundResource('User');
            }

            // cek apakh kita sudah follow dia paa belum

            $sudahDiFollow = Follow::where('follower_id', Auth::user()->id)
                ->where('following_id', $userToUnFollow->id)->first();

            // jika tidka ada maka error

            if (! $sudahDiFollow) {
                return $this->errorResponse('You are not following the user', [], 422);
            }

            DB::beginTransaction();

            $sudahDiFollow->delete();

            DB::commit();

            return $this->noContentResponse();

        } catch (Exception $e) {
            DB::rollBack();

            return $this->errorResponse('failed to unfollow user', [], 500);
        }

    }

    public function getFollowingsSelf()
    {
        try {

            // disni kita akan emndapatkan seluruh data yang sudha kita follow
            // mau itu sudah accept atau masih pending

            // disini lansung taruh withPivotnya itu di fungi di model usernya dan emang hasrus begitu
            // ga bisa di taruh di collection api harus di taruh di modelnya yang fugnsi
            // jadi di fungsi following diakhirnya itu kita kasih ->withPivot('status')
            // dan itu sudha kita lakukan

            // intinya pivot itu adalah atribut tambahan di pivot tabel selain
            // field yang berelasinya, dalma hal ini status dan created_at

            // nah kalo ktia menggunakna relasi yang pake pivot table
            // maka atribut tambahanya itu ada di pivot->atributnya

            // dan each itu seperti forEach bukan map ya

            // nah gni unset itu artinya gini, ketiak ktia ingin mengambil pivot->status
            // maka kan kit hanya itu aja yang diambil nah makanya kan waktu di model
            // kit udha kasih withPivot, nah makanya nanit akan ada data pivot
            // "pivot": {
            //     "follower_id": 1,
            //     "following_id": 2,
            //     "status": "accepted"
            // }

            // nah ktia ga mau, makanya kita unset

            $user = Auth::user();
            // nah disni ketika kita pake

            // $following = $user->fololwing();

            // itu sudah dapatkan seluruh data following, kalo mau lihat kodeya da di mode user

            // followedUser = yang sudah di follow sama user ini, data tungalnya

            $following = $user->following()->get()
                ->each(function ($followedUser) {
                    $followedUser->is_requested = $followedUser->pivot->status != 'accepted';
                    unset($followedUser->pivot);
                    // https://www.php.net/manual/en/function.unset.php
                });
            // nahhhh ini gini, jadi kit itu kan nambah atribut baru
            // yaitu is_requested, nah liat artinya is_requested
            // jadi apakah masih di minta untuk kita follow
            // nah kalo accept berati kan masih dan kita bandingnkan dengan
            // accept(yang ada di db) !== accept, nah berati false kan
            // nah berati iya, is_requestednya false, karena sudah tidak request algi karena sudh di minta

            return response()->json([
                'following' => $following,
            ]);

        } catch (Exception $e) {
            return $this->errorResponse('failed to fetch following', [], 500);
        }
    }

    public function getFollowersSelf()
    {
        try {

            // sama aja kaya ayng diatas

            $user = Auth::user();

            $followers = $user->followers()->get()
                ->each(function ($follower) {
                    $follower->is_requested = $follower->pivot->status !== 'accepted';
                    unset($follower->pivot);
                });

            // ga pake success reesponse, karena ini lasnghung balikin followerw tanpa message
            return response()->json([
                'followers' => $followers,
            ]);

        } catch (Exception $e) {
            return $this->errorResponse('failed to fetch followers', [], 500);

        }
    }

    // itu kan untuk user saat ini

    // ini untuk lihat followers dan following dri user lain

    // SEMUA UNAUTENTICATION, kalo forbidden ada di apiResponse ITU AD ADI FILE APP BOOSTRAPS
    // JADI SUDAH DI TANGKAP DI SANA

    public function getFollowersOther($username)
    {
        try {

            // ini mirip aja kaya yag follwers biasa
            // tapi ini ngambilnya itu berdasarkan data user yang dicari yang ada di username

            $userYangDiLihatFollower = User::where('username', $username)->first();

            if (! $userYangDiLihatFollower) {
                return $this->notFoundResource('User');
            }

            $followersOrang = $userYangDiLihatFollower->followers()->get()
                ->each(function ($follower) {
                    $follower->is_requested = $follower->pivot->status !== 'accepted';
                    unset($follower->pivot);
                });

            return response()->json([
                'followers' => $followersOrang,
            ]);

        } catch (Exception $e) {
            return $this->errorResponse('failed to fetch followers', [], 500);
        }
    }

    public function getFollowingsOther($username)
    {
        try {

            $userOther = User::where('username', $username)->first();
            if (! $userOther) {
                return $this->notFoundResource('User');
            }

            $followingsOther = $userOther->following()->get()
                ->each(function ($following) {
                    $following->is_requested = $following->pivot->status !== 'accepted';
                    unset($following->pivot);
                });

            return response()->json([
                'followings' => $followingsOther,
            ]);

        } catch (Exception $e) {
            return $this->errorResponse('failed to fetch followers', [], 500);
        }
    }

    public function acceptFollowRequest($username)
    {
        try {

            // dinsi kita cek dulu
            $userYangRequest = User::where('username', $username)->first();
            if (! $userYangRequest) {
                return $this->notFoundResource('User');
            }

            // cek apakah sudha accept

            $sudahDiAccept = Follow::where('following_id', Auth::user()->id)
                ->where('follower_id', $userYangRequest->id)->
            where('status', 'accepted')->first();

            if ($sudahDiAccept) {
                // jika sudah di accept, maka
                return $this->errorResponse('Follow request is already accepted', [], 422);
            }

            $apakahFollowSaya = Follow::where('following_id', Auth::user()->id)
                ->where('follower_id', $userYangRequest->id)->first();

            if (! $apakahFollowSaya) {

                // jika sudah di accept, maka
                return $this->errorResponse('The user is not following you', [], 422);
            }

            $apakahFollowSaya->update(['status' => 'accepted']);

            return $this->successResponse('Follow request accepted', [], 200);

        } catch (Exception $e) {
            return $this->errorResponse('failed to accept follow request', [], 500);
        }
    }

    public function getUsersNotFollowed()
    {
        try {
            // jadi disini kita itu inign mendapatkan selruh users yang tidak kita follow
            // dan juga kita tidak termasuk ke dalam daftar
            // mudah aja kita bisa pake whereNotIn

            // jadi ktia ambil dulu data kita / id kita

            $user = Auth::user();

            // ini beriis data data id dari users yang kita follow
            // nah dsini itu pluck adalah untuk emegnmbil satu saja dari array
            // kan array kita in ada following_id, follower_id, timestamp, status

            // nah kalo follower_id kan udah disini pake id kita ya, coba lihat lagi deh, di ai
            // atau di model, nah makanya disini ktia ketiak ngambil  pluck('users.id)
            // jadi ktia ambil dat idnya aja berdasarkan id user yaa inagtt
            // bukan id tabel follows

            // , nah disni id itu sudha otoatis si following_id
            $dataIdYangKitaFollow = $user->following()->pluck('users.id')->toArray();

            // nah dataIdYangKitaFollow kan isinya seluruh data yang ktia folow
            // disni peraturannya itu sama engga boleh nampilin user kita, makanya ktia tambahakn
            // id kita ke dalam array ini / append lah

            $dataIdYangKitaFollow[] = $user->id;

            // nah baru kita ambil data usernya

            $users = User::whereNotIn('id', $dataIdYangKitaFollow)->get();

            return response()->json([
                'users' => $users,
            ]);

        } catch (Exception $e) {
            return $this->errorResponse('failed to fetch users', [], 500);
        }

    }

    // jadi ini itu fungisnya bnyak banget, jadi untuk ngelihat detail profile dari
    // user yang lagi login, dan juga user lain
    public function getDetailUser($username)
    {
        try {
            $user = User::where('username', $username)->first();
            if (! $user) {
                return $this->notFoundResource('User');
            }

            // disni kita cek apakha ini akun kita apa bukan

            $isYourAccount = ($user->id === Auth::user()->id); // true / false

            // cek lagi kita itu statusnnya kedia adalah sudah
            // follow(accept) -> tampil post
            // requested(pending), atau tidak follow-> tidak tampil post
            //

            // jadi tampil post kalo
            // kita follow accept dan kalo tidak ktia follow tapi engga private

            // tapi ga akan tampil kalo
            // kita follow tapi requested, belum kita follow dan private

            // ini status awalnya ya
            $followingStatus = 'not-following';

            if ($isYourAccount) {
                // jika dia adalahakun ku maka
                $followingStatus = 'your-account';
            } else {
                // jika tidk maka di cek lagi
                // apaah sudah terfollow atau masih request

                // cek apakah user saat ini memfollow dia dan accept
                $isFollowing = Follow::where('follower_id', Auth::user()->id)
                    ->where('following_id', $user->id)
                    ->where('status', 'accepted')->exists();

                // disini ktia cek, apakah user saat ini follow user itu dan statusnya masih pending atau request
                $isRequested = Follow::where('follower_id', Auth::user()->id)
                    ->where('following_id', $user->id)
                    ->where('status', 'pending')->exists();

                // nah seteah itu, kita cek apkah kita follow atau tidak
                // ini mah mungkin untuk tombol nanti di fonrendnya

                if ($isFollowing) {
                    $followingStatus = 'following';
                }

                if ($isRequested) {
                    $followingStatus = 'requested';
                }

            }

            // disin kita hitung ada berapa postingannya

            $total_posts = $user->posts()->count();

            // ktia hitung berpa followernya -> yang udah di accept ya
            $followersCount = $user->followers()->where('status', 'accepted')->count();
            $followingsCount = $user->following()->where('status', 'accepted')->count();

            // ini untuk tambahan aja untuk berapa data yang masih kita request
            // dan yang masih belum kita accept
            $followersYetCount = $user->followers()->where('status', 'pending')->count();
            $followingsYetCount = $user->following()->where('status', 'pending')->count();

            // nah disni ktia cek kalo misalakn kita boleh melihat ga postnya ini
            $shouldShowPosts = ! $user->is_private || ($user->is_private && $followingStatus === 'following') || $isYourAccount;

            // $datas = [];

            // if ($shouldShowPosts) {
            //     $datas = $user->load(['posts.attachments']);
            // } else {
            //     $datas = $user;
            // }

            // return response()->json([
            //     'is_your_account' => $isYourAccount,
            //     'following_status' => $followingStatus,
            //     'posts_count' => $total_posts,
            //     'followers_count' => $followersCount,
            //     'following_count' => $followingsCount,
            //     // 'following_count_requested' => $followingsYetCount,
            //     // 'followers_count_requested' => $followersYetCount,
            //     $datas,
            // ]);

            if ($shouldShowPosts) {
                $user->load(['posts.attachments']);
            } else {
                // sembunyikan posts jika tidak boleh
                $user->makeHidden('posts');
            }

            /**
             * Tambahkan field tambahan TANPA nulis manual
             */
            $user->setAttribute('is_your_account', $isYourAccount);
            $user->setAttribute('following_status', $followingStatus);
            $user->setAttribute('posts_count', $user->posts()->count());
            $user->setAttribute(
                'followers_count',
                $user->followers()->where('status', 'accepted')->count()
            );
            $user->setAttribute(
                'following_count',
                $user->following()->where('status', 'accepted')->count()
            );

            return response()->json($user);

        } catch (Exception $e) {
            return $this->errorResponse('failed to fetch detail users', [], 500);
        }
    }
}

// ini penjelasan untuk getDetailUser
// karena ini tuh get detail user yang kita dna orang lain
// jadi pertama untk ngedapetin data bahwa kita dia itu kita bukan
// kalo iya maka simple aja, kita engga kasih lihat tombol requested, accepted, dll
// karena ya ini user kita,

// nah kalo bukan maka di cek lagi apakah kita follow dia, kalo iya maka isFoolow true
// nah nanti di fonrentnya itu tinggal baca aa kalo true is folowed, maka
// tampilkan button yang accepted

// tapi kalo misalakn masih request, maka nanti tampilin aja button requested

// kemudian Postingan di kolom komentar harus disembunyikan jika
// pengguna adalah pengguna pribadi dan status mengikutinya itu bukan mengikuti atau diminta.
