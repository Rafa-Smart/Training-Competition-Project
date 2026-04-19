<?php
// app/Http/Controllers/PostController.php
namespace App\Http\Controllers;

use App\Http\Requests\Post\StorePostRequest;
use App\Http\Traits\ApiResponse;
use App\Models\Post;
use App\Models\PostAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    use ApiResponse;

    /**
     * Create new post
     * Endpoint: POST /api/v1/posts
     * Content-Type: multipart/form-data
     */
    public function store(StorePostRequest $request)
    {
        try {
            DB::beginTransaction();

            // Create post record
            $post = Post::create([
                'user_id' => Auth::id(),
                'caption' => $request->caption,
            ]);

            // Process each attachment
            foreach ($request->file('attachments') as $attachment) {
                // Store file to 'posts' folder in 'public' disk
                $path = $attachment->store('posts', 'public');
                
                // Create attachment record linked to post
                PostAttachment::create([
                    'post_id' => $post->id,
                    'storage_path' => $path,
                ]);
            }

            DB::commit();

            return $this->successResponse('Create post success', [], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to create post', [], 500);
        }
    }

    /**
     * Delete post
     * Endpoint: DELETE /api/v1/posts/:id
     */
    public function destroy($id)
    {
        try {
            $post = Post::find($id);

            if (!$post) {
                return $this->notFoundResponse('Post');
            }

            // Check if user owns the post
            if ($post->user_id !== Auth::id()) {
                return $this->forbiddenResponse();
            }

            // Soft delete the post (because we use SoftDeletes trait)
            $post->delete();

            return $this->noContentResponse();

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete post', [], 500);
        }
    }

    /**
     * Get posts (feed)
     * Endpoint: GET /api/v1/posts
     * Query Params: page, size
     */
    public function index(Request $request)
    {
        try {
            // Validate query parameters
            $request->validate([
                'page' => 'integer|min:0',
                'size' => 'integer|min:1',
            ], [
                'page.integer' => 'The page field must be a number.',
                'page.min' => 'The page field must be at least 0.',
                'size.integer' => 'The size field must be a number.',
                'size.min' => 'The size field must be at least 1.',
            ]);

            // Get pagination parameters with defaults
            $page = $request->get('page', 0);
            $size = $request->get('size', 10);
            $offset = $page * $size; // Calculate offset for SQL query

            // Get IDs of users that current user follows (accepted status only)
            $followingIds = Auth::user()->following()
                ->where('status', 'accepted')
                ->pluck('users.id')
                ->toArray();

            // Include current user's own posts
            $followingIds[] = Auth::id();

            // Get posts with eager loading (avoid N+1 query problem)
            $posts = Post::with(['user', 'attachments'])
                ->whereIn('user_id', $followingIds)
                ->orderBy('created_at', 'desc')
                ->skip($offset)
                ->take($size)
                ->get();

            // Manual formatting of posts (without PostResource)
            $formattedPosts = [];
            foreach ($posts as $post) {
                // Format attachments for this post
                $formattedAttachments = [];
                foreach ($post->attachments as $attachment) {
                    $formattedAttachments[] = [
                        'id' => $attachment->id,
                        'storage_path' => $attachment->storage_path,
                    ];
                }

                // Format user info for this post
                $formattedUser = [
                    'id' => $post->user->id,
                    'full_name' => $post->user->full_name,
                    'username' => $post->user->username,
                    'bio' => $post->user->bio,
                    'is_private' => (bool) $post->user->is_private,
                    'created_at' => $post->user->created_at->format('Y-m-d H:i:s'),
                ];

                // Combine post data with attachments and user
                $formattedPosts[] = [
                    'id' => $post->id,
                    'caption' => $post->caption,
                    'created_at' => $post->created_at->format('Y-m-d H:i:s'),
                    'deleted_at' => $post->deleted_at,
                    'user' => $formattedUser,
                    'attachments' => $formattedAttachments,
                ];
            }

            // Return response with pagination info
            return $this->successResponse('', [
                'page' => (int) $page,
                'size' => (int) $size,
                'posts' => $formattedPosts,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Handle validation errors (invalid page/size parameters)
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch posts', [], 500);
        }
    }
}