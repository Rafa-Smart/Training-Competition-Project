<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::with(['category', 'tags']);

        if ($request->search) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        if ($request->category) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        if ($request->order_by === 'popular') {
            $query->orderByDesc('visited_count');
        } else {
            $query->latest('published_at');
        }

        $posts = $query->paginate(
            $request->per_page ?? 20
        );

        return response()->json([
            'data' => $posts->items(),

            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ]
        ]);
    }

    public function show($slug)
    {
        $post = Post::with(['category', 'tags'])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'data' => $post
        ]);
    }
}