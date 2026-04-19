<?php
// app/Http/Controllers/PostController.php
namespace App\Http\Controllers;

use App\Http\Requests\Post\StorePostRequest;
use App\Http\Resources\PostResource;
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

    // Create post
    public function store(StorePostRequest $request)
    {
        try {
            DB::beginTransaction();

            $post = Post::create([
                'user_id' => Auth::id(),
                'caption' => $request->caption,
            ]);

            foreach ($request->file('attachments') as $attachment) {
                $path = $attachment->store('posts', 'public');
                
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

    // Delete post
    public function destroy($id)
    {
        try {
            $post = Post::find($id);

            if (!$post) {
                return $this->notFoundResponse('Post');
            }

            if ($post->user_id !== Auth::id()) {
                return $this->forbiddenResponse();
            }

            $post->delete();

            return $this->noContentResponse();

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete post', [], 500);
        }
    }

    // Get posts with pagination
    public function index(Request $request)
    {
        try {
            $request->validate([
                'page' => 'integer|min:0',
                'size' => 'integer|min:1',
            ], [
                'page.integer' => 'The page field must be a number.',
                'page.min' => 'The page field must be at least 0.',
                'size.integer' => 'The size field must be a number.',
                'size.min' => 'The size field must be at least 1.',
            ]);

            $page = $request->get('page', 0);
            $size = $request->get('size', 10);
            $offset = $page * $size;

            // Get posts from users that the current user follows (accepted)
            $followingIds = Auth::user()->following()
                ->where('status', 'accepted')
                ->pluck('users.id')
                ->toArray();

            // Include current user's posts
            $followingIds[] = Auth::id();

            $posts = Post::with(['user', 'attachments'])
                ->whereIn('user_id', $followingIds)
                ->orderBy('created_at', 'desc')
                ->skip($offset)
                ->take($size)
                ->get();

            $totalPosts = Post::whereIn('user_id', $followingIds)->count();

            return $this->successResponse('', [
                'page' => (int) $page,
                'size' => (int) $size,
                'total' => $totalPosts,
                'posts' => PostResource::collection($posts),
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch posts', [], 500);
        }
    }
}