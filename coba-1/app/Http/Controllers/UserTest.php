<?php
// app/Http/Controllers/UserController.php
namespace App\Http\Controllers;

use App\Http\Traits\ApiResponse;
use App\Models\User;
use App\Models\Follower;
use App\Models\Post;
use App\Models\PostAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    use ApiResponse;

    /**
     * Follow a user
     * Endpoint: POST /api/v1/users/:username/follow
     */
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

            $responseStatus = $status === 'accepted' ? 'following' : 'requested';
            return $this->successResponse('Follow success', ['status' => $responseStatus]);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to follow user', [], 500);
        }
    }

    /**
     * Unfollow a user
     * Endpoint: DELETE /api/v1/users/:username/unfollow
     */
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

    /**
     * Get following users
     * Endpoint: GET /api/v1/following
     */
    public function getFollowing()
    {
        try {
            $user = Auth::user();
            
            // Get following users with pivot status
            $following = $user->following()
                ->withPivot('status')
                ->get();
            
            // Format response manually
            $formattedFollowing = [];
            foreach ($following as $followedUser) {
                $formattedFollowing[] = [
                    'id' => $followedUser->id,
                    'full_name' => $followedUser->full_name,
                    'username' => $followedUser->username,
                    'bio' => $followedUser->bio,
                    'is_private' => (bool) $followedUser->is_private,
                    'created_at' => $followedUser->created_at->format('Y-m-d H:i:s'),
                    'is_requested' => $followedUser->pivot->status === 'pending',
                ];
            }

            return $this->successResponse('', ['following' => $formattedFollowing]);

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch following', [], 500);
        }
    }

    /**
     * Accept follow request
     * Endpoint: PUT /api/v1/users/:username/accept
     */
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

    /**
     * Get followers
     * Endpoint: GET /api/v1/users/:username/followers
     */
    public function getFollowers($username)
    {
        try {
            $user = User::where('username', $username)->first();

            if (!$user) {
                return $this->notFoundResponse('User');
            }

            // Get followers with pivot status
            $followers = $user->followers()
                ->withPivot('status')
                ->get();
            
            // Format response manually
            $formattedFollowers = [];
            foreach ($followers as $follower) {
                $formattedFollowers[] = [
                    'id' => $follower->id,
                    'full_name' => $follower->full_name,
                    'username' => $follower->username,
                    'bio' => $follower->bio,
                    'is_private' => (bool) $follower->is_private,
                    'created_at' => $follower->created_at->format('Y-m-d H:i:s'),
                    'is_requested' => $follower->pivot->status === 'pending',
                ];
            }

            return $this->successResponse('', ['followers' => $formattedFollowers]);

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch followers', [], 500);
        }
    }

    /**
     * Get users not followed
     * Endpoint: GET /api/v1/users
     */
    public function getUsersNotFollowed()
    {
        try {
            $currentUser = Auth::user();
            
            // Get IDs of users that current user is following
            $followingIds = $currentUser->following()
                ->pluck('users.id')
                ->toArray();

            // Add current user ID to exclude self
            $followingIds[] = $currentUser->id;

            // Get users not in the followingIds array
            $users = User::whereNotIn('id', $followingIds)->get();
            
            // Format response manually
            $formattedUsers = [];
            foreach ($users as $user) {
                $formattedUsers[] = [
                    'id' => $user->id,
                    'full_name' => $user->full_name,
                    'username' => $user->username,
                    'bio' => $user->bio,
                    'is_private' => (bool) $user->is_private,
                    'created_at' => $user->created_at->format('Y-m-d\TH:i:s.u\Z'),
                    'updated_at' => $user->updated_at->format('Y-m-d\TH:i:s.u\Z'),
                ];
            }

            return $this->successResponse('', ['users' => $formattedUsers]);

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch users', [], 500);
        }
    }

    /**
     * Get user detail
     * Endpoint: GET /api/v1/users/:username
     */
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

            // Load counts (optimized query - avoids N+1)
            $user->loadCount(['posts', 'followers', 'following']);
            
            // Check if should show posts based on privacy and relationship
            $shouldShowPosts = !$user->is_private || 
                              ($followingStatus === 'following' || $followingStatus === 'requested') ||
                              $isYourAccount;

            // Get posts if allowed
            $formattedPosts = [];
            if ($shouldShowPosts) {
                $posts = $user->posts()->with('attachments')->latest()->get();
                
                foreach ($posts as $post) {
                    // Format attachments for this post
                    $formattedAttachments = [];
                    foreach ($post->attachments as $attachment) {
                        $formattedAttachments[] = [
                            'id' => $attachment->id,
                            'storage_path' => $attachment->storage_path,
                        ];
                    }
                    
                    $formattedPosts[] = [
                        'id' => $post->id,
                        'caption' => $post->caption,
                        'created_at' => $post->created_at->format('Y-m-d H:i:s'),
                        'deleted_at' => $post->deleted_at,
                        'attachments' => $formattedAttachments,
                    ];
                }
            }

            // Build final response array
            $responseData = [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'username' => $user->username,
                'bio' => $user->bio,
                'is_private' => (bool) $user->is_private,
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'is_your_account' => $isYourAccount,
                'following_status' => $followingStatus,
                'posts_count' => $user->posts_count,
                'followers_count' => $user->followers_count,
                'following_count' => $user->following_count,
                'posts' => $formattedPosts, // Empty array if not allowed to view posts
            ];

            return $this->successResponse('', $responseData);

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch user details', [], 500);
        }
    }
}