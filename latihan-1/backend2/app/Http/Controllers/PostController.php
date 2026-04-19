<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\Post;
use App\Models\Follow;
use Illuminate\Http\Request;
use App\Models\PostAttachment;
use App\Http\Requests\PostRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

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

                'size' => 'integer|min:1',
            ], ['page.min' => 'The page field must be at least 0.',
                'size.integer' => 'The page field must be at least 0.']);
            DB::beginTransaction();


            $userYangKitaFollow = Follow::where('follower_id',Auth::user()->id)->where
                // disini kia ambil / plunk si following_id -> id orang yang kita follow
            ('status', "accepted")->pluck('following_id')->toArray();

            $userYangKitaFollow[] = Auth::user()->id;

            $skip = ($request->get('size',10) * $request->get('page',0));

            $posts = Post::with(['users', 'attachments'])
            ->whereIn("user_id", $userYangKitaFollow)
            ->skip($skip)
            // ini wajib, karena harus ad isinya min 10, karena ag bisa pke skip kalo ga pake take
            ->take($request->get('size', 10))
            ->orderBy('created_at', 'desc')
            ->get();


            DB::commit();

            return response()->json([
                'page' => $request->get('page',0),
                'size' => $request->get('size',10),
                'posts'=>$posts
            ], 200);

        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function store(PostRequest $request)
    {
        try {
            DB::beginTransaction();
            $post = Post::create(attributes: [
                'caption' => $request->caption,
                'user_id' => Auth::user()->id,
            ]);

            $attachments = $request->file('attachments');
            if ($attachments) {
                foreach ($attachments as $attachment) {
                    $path = $attachment->store('posts', 'public');
                    PostAttachment::create([
                        'post_id' => $post->id,
                        'storage_path' => $path,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Create post success',
            ], 201);

        } catch (Exception $e) {
            throw $e;
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy( $id)
    {
        try {
            DB::beginTransaction();

            $post = Post::find($id);
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

            DB::commit();

            return response()->json([
                'message' => 'Create post success',
            ], 204);

        } catch (Exception $e) {
            throw $e;
        }
    }
}
