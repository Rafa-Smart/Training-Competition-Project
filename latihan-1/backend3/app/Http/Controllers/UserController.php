<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostAttachmentRequest;
use App\Http\Requests\UpdatePostAttachmentRequest;
use App\Models\Follow;
use App\Models\PostAttachment;
use App\Models\User;
use Auth;
use Exception;

class UserController extends Controller
{
    public function follow($username)
    {
        try {
            $userYgMauDiFollow = User::where('username', $username)->frist();

            if (! $userYgMauDiFollow) {
                return response()->json([
                    'messaage' => 'User not found',
                ], 404);
            }

            if ($userYgMauDiFollow->id == Auth::user()->id) {
                return response()->json([
                    'messaage' => 'You are not allowed to follow yourself',
                ], 422);
            }

            $sudahDiFollow = Follow::where('follower_id', Auth::user()->id)->where('following_id', $userYgMauDiFollow->id)->first();

            $follow = Follow::create([
                'follower_id' => Auth::user()->id,
                'following_id' => $userYgMauDiFollow->id,
                'status' => $userYgMauDiFollow->is_private ? 'pending' : 'accepted',
            ]);

            return response()->json([
                'messaage' => 'Follow success',
                'status' => $userYgMauDiFollow->is_private ? 'requested' : 'following',
            ], 204);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function unFollow($username)
    {
        try {
            // yang mau di unfllow ya
            $userYgMauDiFollow = User::where('username', $username)->frist();

            if (! $userYgMauDiFollow) {
                return response()->json([
                    'messaage' => 'User not found',
                ], 404);
            }
            $sudahDiFollow = Follow::where('follower_id', Auth::user()->id)->where('following_id', $userYgMauDiFollow->id)->first();

            if (! $sudahDiFollow) {
                return response()->json([
                    'messaage' => 'You are not following the user',
                ], 422);
            }

            $sudahDiFollow->delete();

            return response()->json(null, 204);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function acceptFollow($username)
    {
        try {
            // yang mau di accept ya
            $userYgMauDiFollow = User::where('username', $username)->frist();

            if (! $userYgMauDiFollow) {
                return response()->json([
                    'messaage' => 'User not found',
                ], 404);
            }

            // sudah di accept ya
            $sudahDiFollow = Follow::where('follower_id', $userYgMauDiFollow->id)->where('following_id', Auth::user()->id)->where('status', 'accepted')->first();

            if ($sudahDiFollow) {
                return response()->json([
                    'messaage' => 'Follow request is already accepted',
                ], 422);
            }

            // apakh dia mau follow saya

            $apakahSayaDiFollow = Follow::where('follower_id', $userYgMauDiFollow->id)->where('following_id', Auth::user()->id)->first();

            if (! $apakahSayaDiFollow) {
                return response()->json([
                    'messaage' => 'The user is not following you',
                ], 422);
            }
            $apakahSayaDiFollow->status = 'accepted';
            $apakahSayaDiFollow->save();

            return response()->json([
                'messaage' => 'Follow request accepted',
            ], 200);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getFollowerUsers()
    {
        try {

            $user = Auth::user();
            if (! $user) {
                return response()->json([
                    'message' => 'user not found',
                ], 404);
            }

            $followingUser = Auth::user()->following()->get()
                ->each(function ($user) {
                    $user->is_requested = $user->pivot->status != 'accepted';
                    unset($user->pivot);
                });

            return response()->json([
                'following' => $followingUser,
            ], 200);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getFollowingUsersOther($username)
    {
        try {

            $user = User::where('username', $username)->first();
            if (! $user) {
                return response()->json([
                    'message' => 'user not found',
                ], 404);
            }

            $followingUsers = $user->following()->get()
                ->each(function ($data) {
                    $data->is_requested = $data->pivot->status != 'accepted';
                    unset($data->pivot);
                });

            return response()->json([
                'folowing' => $followingUsers,
            ], 200);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getFollowerUsersOther($username)
    {
        try {

            $user = User::where('username', $username)->first();
            if (! $user) {
                return response()->json([
                    'message' => 'user not found',
                ], 404);
            }

            $followingUser = $user->following()->get()
                ->each(function ($u) {
                    $u->is_requested = $u->pivot->status != 'accepted';
                    unset($user->pivot);
                });

            return response()->json([
                'followers' => $followingUser,
            ], 200);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getUsers()
    {
        try {

            $user = User::where('username', Auth::user()->username)->first();
            if (! $user) {
                return response()->json([
                    'message' => 'user not found',
                ], 404);
            }

            $userYangSayaFollow = $user->following()->pluck('users.id')->toArray();

            $userYangSayaFollow[] = $user->id;

            $users = User::whereNotIn('id', $userYangSayaFollow)->get();

            return response()->json([
                'users' => $users,
            ], 200);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getProfile($username)
    {
        try {

            $user = User::where('username', $username)->first();
            if (! $user) {
                return response()->json([
                    'message' => 'user not found',
                ], 404);
            }

            $isYourAccount = $user->id == Auth::user()->id;

            $followingStatus = 'not-following';
            if ($isYourAccount) {
                $followingStatus = 'your account';
            } else {

                // sudah saya follow

                $isFollow = Follow::where('follower_id', Auth::user()->id)
                    ->where('following_id', $user->id)
                    ->first();

                if ($isFollow) {
                    $followingStatus = $isFollow->status == 'accepted' ? 'following' : 'requested';
                }
            }

            $showPosts = false;

            if ($isYourAccount || ! $user->is_private || $user->is_private && $followingStatus == 'following') {
                $showPosts = true;
            }

            $userYangSayaFollow = $user->following()->pluck('users.id')->toArray();

            $userYangSayaFollow[] = $user->id;

            $users = User::whereNotIn('id', $userYangSayaFollow);

            $response = [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'username' => $user->username,
                'bio' => $user->bio,
                'is_private' => $user->is_private,
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'is_your_account' => $isYourAccount,
                'following_status' => $followingStatus,
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
                        'user_id' => $post->user_id,
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
            throw $e;
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePostAttachmentRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(PostAttachment $postAttachment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PostAttachment $postAttachment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostAttachmentRequest $request, PostAttachment $postAttachment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PostAttachment $postAttachment)
    {
        //
    }
}
