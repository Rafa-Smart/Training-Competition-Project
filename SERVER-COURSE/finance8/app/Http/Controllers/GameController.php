<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreGameRequest;
use App\Http\Requests\UpdateGameRequest;
use App\Models\Game;
use App\Models\GameVersion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GameController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $page = max(0, (int) $request->query('page', 0));
        $size = max(1, (int) $request->query('size', 10));
        $sortBy = $request->query('sortBy', 'title');
        $sortDir = $request->query('sortDir', 'asc') === 'desc' ? 'desc' : 'asc';

        $query = Game::with(['latestVersion', 'user'])
            ->whereHas('latestVersion')
            ->withCount('scores as score_count');

        match ($sortBy) {
            'popular' => $query->orderBy('score_count', $sortDir),
            'uploaddate' => $query->orderBy(
                GameVersion::select('created_at')
                    ->whereColumn('game_id', 'games.id')
                    ->latest()
                    ->limit(1),
                $sortDir
            ),
            default => $query->orderBy('title', $sortDir),
        };

        $total = $query->count();
        $games = $query->skip($page * $size)->take($size)->get();

        return response()->json([
            'page' => $page,
            'size' => $games->count(),
            'totalElements' => $total,
            'content' => $games->map(function ($g) {
                return $this->formatGame($g);
            }),
        ]);
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
    public function store(Request $request)
    {
        $slug = Str::slug($request->title);
        if (Game::where('slug', $slug)->exists()) {
            return response()->json([
                'status' => 'invalid',
                'slug' => 'Game title already exists',
            ], 400);
        }

        $game = Game::create([
            'slug' => $slug,
            'title' => $request->title,
            'description' => $request->description,
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'status' => 'success',
            'slug' => $slug,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $slug)
    {
        $game = Game::with(['latestVersion', 'user'])->withCount('scores as score_count')->where('slug', $slug)->firstOrFail();
        $latest = $game->latestVersion;

        return response()->json([
            'slug' => $game->slug,
            'title' => $game->title,
            'description' => $game->description,
            'thumbnail' => $latest?->thumbnailUrl(),
            'uploadTimestamp' => $latest?->created_at->toISOString(),
            'author' => $game->user->username,
            'scoreCount' => (int) $game->score_count,
            'gamePath' => $latest ? $latest->gamePath() : null,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Game $game)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $slug)
    {
        $game = Game::where('slug', $slug)->firstOrFail();

        if ($game->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'forbidden',
                'message' => 'You are not the game author',
            ], 403);
        }

        $game->update([
            'title' => $request->title,
            'description' => $request->description,
        ]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $slug)
    {
        $game = Game::where('slug', $slug)->firstOrFail();

        if ($game->user_id !== $request->user()->id) {
            return response()->json([
                'status' => 'forbidden',
                'message' => 'You are not the game author',
            ], 403);
        }

        Storage::deleteDirectory("games/{$slug}");

        $game->delete();

        return response()->noContent();
    }

    private function formatGame(Game $game): array
    {
        $latest = $game->latestVersion;

        return [
            'slug' => $game->slug,
            'title' => $game->title,
            'description' => $game->description,
            'thumbnail' => $latest?->thumbnailUrl(),
            'uploadTimestamp' => $latest?->created_at->toISOString(),
            'author' => $game->user->username,
            'scoreCount' => (int) $game->scores,
        ];
    }
}
