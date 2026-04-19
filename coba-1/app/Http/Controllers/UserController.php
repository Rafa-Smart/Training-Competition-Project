<?php
// app/Http/Controllers\UserController.php
namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Http\Traits\ApiResponse;
use App\Models\User;
use App\Models\Follower;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    use ApiResponse;

    // Follow a user
    public function follow($username)
    {
        try {
            $userToFollow = User::where('username', $username)->first();

            if (!$userToFollow) {
                return $this->notFoundResponse('User');
            }

            if ($userToFollow->id === Auth::id()) {
                return $this->errorResponse('You are not allowed to follow yourself', [], 422);
            }

            // Check if already following
            $existingFollow = Follower::where('follower_id', Auth::id())
                ->where('following_id', $userToFollow->id)
                ->first();

            if ($existingFollow) {
                $status = $existingFollow->status === 'accepted' ? 'following' : 'requested';
                return $this->errorResponse('You are already followed', ['status' => $status], 422);
            }

            DB::beginTransaction();

            $status = $userToFollow->is_private ? 'pending' : 'accepted';
            
            Follower::create([
                'follower_id' => Auth::id(),
                'following_id' => $userToFollow->id,
                'status' => $status,
            ]);

            DB::commit();

            return $this->successResponse('Follow success', [
                'status' => $status === 'accepted' ? 'following' : 'requested'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to follow user', [], 500);
        }
    }

    // Unfollow a user
    public function unfollow($username)
    {
        try {
            $userToUnfollow = User::where('username', $username)->first();

            if (!$userToUnfollow) {
                return $this->notFoundResponse('User');
            }

            $follow = Follower::where('follower_id', Auth::id())
                ->where('following_id', $userToUnfollow->id)
                ->first();

            if (!$follow) {
                return $this->errorResponse('You are not following the user', [], 422);
            }

            $follow->delete();

            return $this->noContentResponse();

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to unfollow user', [], 500);
        }
    }

    // Get following users
    public function getFollowing()
    {
        try {
            $user = Auth::user();
            $following = $user->following()
                ->withPivot('status')
                ->get()
                ->map(function ($user) {
                    $resource = new UserResource($user);
                    return $resource->toFollowerFollowingArray(
                        request(),
                        $user->pivot->status === 'pending'
                    );
                });

            return $this->successResponse('', ['following' => $following]);

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch following', [], 500);
        }
    }

    // Accept follow request
    public function acceptFollowRequest($username)
    {
        try {
            $follower = User::where('username', $username)->first();

            if (!$follower) {
                return $this->notFoundResponse('User');
            }

            $followRequest = Follower::where('follower_id', $follower->id)
                ->where('following_id', Auth::id())
                ->where('status', 'pending')
                ->first();

            if (!$followRequest) {
                return $this->errorResponse('The user is not following you', [], 422);
            }

            if ($followRequest->status === 'accepted') {
                return $this->errorResponse('Follow request is already accepted', [], 422);
            }

            $followRequest->update(['status' => 'accepted']);

            return $this->successResponse('Follow request accepted');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to accept follow request', [], 500);
        }
    }

    // Get followers
    public function getFollowers($username)
    {
        try {
            $user = User::where('username', $username)->first();

            if (!$user) {
                return $this->notFoundResponse('User');
            }

            $followers = $user->followers()
                ->withPivot('status')
                ->get()
                ->map(function ($user) {
                    $resource = new UserResource($user);
                    return $resource->toFollowerFollowingArray(
                        request(),
                        $user->pivot->status === 'pending'
                    );
                });

            return $this->successResponse('', ['followers' => $followers]);

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch followers', [], 500);
        }
    }

    // Get users not followed
    public function getUsersNotFollowed()
    {
        try {
            $currentUser = Auth::user();
            
            $followingIds = $currentUser->following()
                ->pluck('users.id')
                ->toArray();

            $followingIds[] = $currentUser->id;

            $users = User::whereNotIn('id', $followingIds)
                ->get()
                ->map(function ($user) {
                    return (new UserResource($user))->toArray(request());
                });

            return $this->successResponse('', ['users' => $users]);

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch users', [], 500);
        }
    }

    // Get user detail
    public function show($username)
    {
        try {
            $user = User::where('username', $username)->first();

            if (!$user) {
                return $this->notFoundResponse('User');
            }

            $currentUser = Auth::user();
            $isYourAccount = $currentUser->id === $user->id;

            // Determine following status
            $followingStatus = 'not-following';
            
            if ($isYourAccount) {
                $followingStatus = 'your-account';
            } elseif ($currentUser->isFollowing($user)) {
                $followingStatus = 'following';
            } elseif ($currentUser->hasRequestedFollow($user)) {
                $followingStatus = 'requested';
            }

            $user->loadCount(['posts', 'followers', 'following']);
            
            $resource = new UserResource($user);
            $data = $resource->toDetailArray(request(), $isYourAccount, $followingStatus);

            return $this->successResponse('', $data);

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch user details', [], 500);
        }
    }
}