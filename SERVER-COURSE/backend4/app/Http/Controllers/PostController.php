<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Models\Follow;
use App\Models\Post;
use App\Models\PostAttachment;
use Auth;
use Exception;
use Request;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $request->validate([
                'size' => 'number|min:10',
                'page' => 'number|min:0',
            ],
                [
                    'page.min' => 'The page field must be at least 0.',
                    'size.number' => 'The size field must be a number.',
                ]);

            $userYangSayaFollow = Follow::where('follower_id', Auth::user()->id)->where('status', 'accepted')->pluck('users.id')->toArray();
            $userYangSayaFollow[] = Auth::user()->id;

            $skip = $request->get('size', 10) * $request->get('page', 0);

            $posts = Post::with(['users', 'attachments'])
                ->whereIn('user_id', $userYangSayaFollow)
                ->skip($skip)
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
            $validated = $request->validated();

            $post = Post::create([
                'user_id' => Auth::user()->id,
                'caption' => $validated->caption,
            ]);

            $attachments = $validated->file('attachments');

            foreach ($attachments as $attachment) {
                $path = $attachment->store('posts', 'public');
                PostAttachment::create([
                    'storage_path' => $path,
                    'post_id' => $post->id,
                ]);
            }

            return response()->json([
                'message' => 'create post success',
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
                    'message' => 'post not found',
                ], 404);
            }

            // nanti ganti ini pake gate

            if ($post->user_id != Auth::user()->id) {
                return response()->json([
                    'message' => 'Forbidden access',
                ]);
            }

            $post->delete();

            return response()->json([null, 204]);
        } catch (Exception $e) {
            throw $e;
        }
    }
}
