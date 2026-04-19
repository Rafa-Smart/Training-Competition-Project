<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Follow;
use App\Models\Post;
use App\Models\PostAttachment;
use Auth;
use Exception;
use Illuminate\Support\Facades\Request;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $request->validate([
                'page' => 'integer|min:0',
                'size' => 'integer|min:10',
            ], [
                'page.min' => 'The page field must be at least 0.',
                'size.integer' => 'The size field must be a number.',
            ]);

            // nah ingat disini ta ga dii pluckny itu adalah users.id
            // karena follow ini harus ngembaliin tipe fllow pake fllowing_id
            $userYangKitaFollow = Follow::where('follower_id', Auth::user()->id)->where('status', 'accepted')->pluck('following_id')->toArray();

            $userYangKitaFollow[] = Auth::user()->id;

            $skip = ($request->get('size', 10) * $request->get('page', 0));

            $posts = Post::with(['users', 'attachments'])
                ->whereIn('user_id', $userYangKitaFollow)
                ->skip($skip)
                ->take($request->get('size', 10))
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'page' => $request->get('page', 0),
                'size' => $request->get('size', 10),
                'posts' => $posts,
            ], 200);
        } catch (Exception $e) {
            throw $e;
        }
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
    public function store(StorePostRequest $request)
    {
        try {
            $data = $request->validated();

            $post = Post::create([
                'user_id' => Auth::user()->id,
                'caption' => $data->caption,
            ]);

            $attachments = $request->file('attacnments');

            foreach ($attachments as $attachment) {
                $path = $attachment->store('posts', 'public');

                PostAttachment::create(
                    ['post_id' => $post->id,
                        'storage_path' => $path]
                );
            }

            return response()->json([
                'message' => 'Create post success',
            ], 201);
        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostRequest $request, Post $post)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        try {
            if (! $post) {
                return response()->json([
                    'message' => 'Post not found',
                ], 404);
            }

            if ($post->user_id != Auth::user()->id) {
                return response()->json([
                    'message' => 'Forbidden access',
                ], 403);
            }

            $post->delete();

            return response()->json([
                'message' => 'Create post success',
            ], 204);
        } catch (Exception $e) {
            throw $e;
        }
    }
}
