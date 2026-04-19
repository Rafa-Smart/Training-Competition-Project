<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFollowRequest;
use App\Http\Requests\UpdateFollowRequest;
use App\Models\Follow;
use App\Models\User;
use Auth;
use Exception;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function follow($username)
    {
        try {
            $user = User::where('username', $username)->first();

            if (! $user) {
                return response()->json([
                    'message' => 'User Not Found',
                ], 404);
            }

            $udhFollow = Follow::where('follower_id', Auth::user()->id)->where('following_id', $user->id)->first();

            if ($udhFollow) {
                return response()->json([
                    'message' => 'You are already followed',
                    'status' => $udhFollow->status == 'accepted' ? 'following' : 'requested',
                ], 422);
            }

            if ($udhFollow->id == Auth::user()->id) {
                return response()->json([
                    'message' => 'You are not allowed to follow yourself',
                ], 422);
            }

            $follow = Follow::create([
                'status' => $user->is_private ? 'requested' : 'accepted',
                'following_id' => Auth::user()->id,
                'follower_id' => $user->id,
            ]);

            return response()->json([
                'message' => 'Follow Success',
                'status' => $follow->status == 'accepted' ? 'following' : 'requested',
            ]);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function unFollow($username)
    {
        try {
            $user = User::where('username', $username)->first();

            if (! $user) {
                return response()->json([
                    'message' => 'User Not Found',
                ], 404);
            }

            $udhFollow = Follow::where('follower_id', Auth::user()->id)->where('following_id', $user->id)->first();

            if (! $udhFollow) {
                return response()->json([
                    'message' => 'You are not following the user',
                ], 422);
            }

            $udhFollow->delete();

            return response()->json(null, 204);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function accept($username)
    {
        try {

            $user = User::where('username', $username)->first();
            if (! $user) {
                return response()->json([
                    'message' => 'User Not Found',
                ], 404);
            }

            $udhFollow = Follow::where('follower_id', $user->id)->where('following_id', Auth::user()->id)->where('status', 'accepted')->first();
            if ($udhFollow) {
                return response()->json([
                    'message' => 'Follow request is already accepted',
                ], 422);
            }

            $apakahIkut = Follow::where('follower_id', $user->id)->where('following_id', Auth::user()->id)->first();
            if ($udhFollow) {
                return response()->json([
                    'message' => 'The user is not following you',
                ], 422);
            }
            $apakahIkut->status = 'acepted';
            $apakahIkut->save();

            return response()->json([
                'message' => 'follow request accepted',
            ], 200);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getFollowing()
    {
        try {
            $user = User::where('username', Auth::user()->username)->first();

            if (! $user) {
                return response()->json([
                    'message' => 'User Not Found',
                ], 404);
            }

            $following = $user->following()->get()->each(function ($follow) {
                $follow->is_requested = $follow->pivot->status != 'acepted';
                unset($follow->pivot);
            });

            return response()->json([
                'following' => $following,
            ], 200);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getFollowingOther($username)
    {
        try {
            $user = User::where('username', $username)->first();

            if (! $user) {
                return response()->json([
                    'message' => 'User Not Found',
                ], 404);
            }

            $following = $user->following()->get()->each(function ($follow) {
                $follow->is_requested = $follow->pivot->status != 'acepted';
                unset($follow->pivot);
            });

            return response()->json([
                'following' => $following,
            ], 200);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getFollowerOther($username)
    {
        try {
            $user = User::where('username', $username)->first();

            if (! $user) {
                return response()->json([
                    'message' => 'User Not Found',
                ], 404);
            }

            $following = $user->following()->get()->each(function ($follow) {
                $follow->is_requested = $follow->pivot->status != 'acepted';
                unset($follow->pivot);
            });

            return response()->json([
                'follower' => $following,
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
                    'message' => 'User Not Found',
                ], 404);
            }

            $userYgDiFollow = $user->following()->pluck('users.id')->toArray();

            $userYgDiFollow[] = $user->id;

            $users = User::whereNotIn('id', $userYgDiFollow)->get();

            $following = $user->following()->get()->each(function ($follow) {
                $follow->is_requested = $follow->pivot->status != 'acepted';
                unset($follow->pivot);
            });

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
                    'message' => 'User Not Found',
                ], 404);
            }
            $is_your_account = false;
            $following_status = 'not-following'
            if($user->id == Auth::user()->id){
                $is_your_account = true;

            }

            $follow = Follow::where('follower_id', Auth::user()->id)->where('following_id', $user->id)->first();


        } catch (Exception $e) {
            throw $e;
        }
    }

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
    public function store(StoreFollowRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */ 
    public function show(Follow $follow)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Follow $follow)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFollowRequest $request, Follow $follow)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Follow $follow)
    {
        //
    }
}
