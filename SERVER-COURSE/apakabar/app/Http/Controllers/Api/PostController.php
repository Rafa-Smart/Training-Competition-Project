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
            // nah jadi gini, disini agar bisa multi pencarian kita akn megggunakan 
            // whee in da ngubah string teknologi,makanan,dll,dll
            // menjadi array ya apke explode

            $arr = explode(',', $request->category);

            $query->whereHas('category', function ($q) use ($arr) {
                $q->whereIn('slug', $arr);
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