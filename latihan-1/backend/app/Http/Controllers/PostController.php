<?php

namespace App\Http\Controllers;

use App\Http\Requests\PostRequest;
use App\Http\Traits\ApiResponse;
use App\Models\Follow;
use App\Models\Post;
use App\Models\PostAttachment;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PostController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {

            // nah disni agar ktia bisa mendapatkan format created_at updated_at dengan ormat yng sesuai maka

            // ktia bia gunaka ini, jadi in global untuk fungsi ini
            // Carbon::serializeUsing(function($carbon){
            //     return $carbon->format('Y-m-d H:i:s');
            // });

            // tapi itu masih belum efektif
            // jdai kita harus gini, jadi dari paa kita ekarasikan ulang field fieldnya hanya untuk ubah data created_at
            // mending kita casting aja di model post
            //             protected $casts = [
            //     'created_at' => 'datetime:Y-m-d H:i:s',
            //     'updated_at' => 'datetime:Y-m-d H:i:s',
            // ];

            // disni ktia validasi dulu
            $request->validate([
                'page' => ['integer', 'min:0'],
                'size' => ['integer', 'min:1'],
            ], [
                'page.integer' => 'The page field must be at least 0',
                'size.integer' => 'The size field must be a number.',
            ]);

            DB::beginTransaction();

            // disini kita ambil dlu eluruh posts yang user ini follow dan termasuk
            // post yang user ini punya

            // kita ambil dulu id dari user ayng kita follow
            $userYangKitaFollow = Follow::where('follower_id', Auth::user()->id)->where('status', 'accepted')->pluck('following_id')->toArray();

            // lalu array data id yang kita follow, kita tambahkan lagi id kita, biar post kitamuncul

            $userYangKitaFollow[] = Auth::user()->id;

            // nah disni baru kita ambil datanya

            // disni kit tentuin duu skipnya
            $skip = $request->get('page', 0) * $request->get('size', 10);

            $posts = Post::with(['user', 'attachments'])
                ->whereIn('user_id', $userYangKitaFollow)
                ->orderBy('created_at','desc')
                ->skip($skip)
                ->take($request->get('size', 10))
                ->get();

            // lalu ktia ambil data total postsnya

            $totalPosts = Post::with(['user', 'attachments'])
                ->whereIn('user_id', $userYangKitaFollow)
                ->count();

            // harusnya pake format itu ya, tapi coba aja dulu gini

            return response()->json([
                'size' => $request->get('size', 10),
                'page' => $request->get('page', 0),
                // 'total_posts' => $totalPosts,
                'posts' => $posts,
            ]);

        } catch (ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (Exception $e) {
            throw $e;
            return $this->errorResponse('failed to fetch posts', [], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(PostRequest $request)
    {
        try {

            DB::beginTransaction();

            $post = Post::create([
                'user_id' => Auth::user()->id,
                'caption' => $request->caption,
            ]);

            // disini baru kita maskan ke tabel post_attachments
            $attachments = $request->file('attachments');

            if ($attachments) {
                foreach ($attachments as $attachment) {
                    $path = $attachment->store('posts', 'public');

                    PostAttachment::create([
                        'storage_path' => $path,
                        'post_id' => $post->id,
                    ]);
                }
            }

            DB::commit();

            return $this->successResponse('Create post success', [], 201);

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;

            return $this->errorResponse('Failed to create post', ['errors' => $e], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        try {

            DB::beginTransaction();
            // cek jik tidka di temukan
            if (! $post) {
                return $this->notFoundResource('Post');
            }

            // cek jika bukna user yang valid
            if ($post->user_id != Auth::user()->id) {
                return $this->forbiddenResponse();
            }

            // jik lolos maka delete

            $post->delete();

            DB::commit();

            return $this->noContentResponse();
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
            return $this->errorResponse('failed to delete post', [], 500);
        }
    }
}
