<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateGameRequest;
use App\Http\Requests\UpdateGameRequest;
use App\Models\Game;
use App\Models\GameVersion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GameController extends Controller
{
    /**
     * GET /api/v1/games
     * Paginated, sortable list of games (only games with at least one version).
     */
    public function index(Request $request)
    {
        $page    = max(0, (int) $request->query('page', 0));
        $size    = max(1, (int) $request->query('size', 10));
        $sortBy  = $request->query('sortBy', 'title');
        $sortDir = $request->query('sortDir', 'asc') === 'desc' ? 'desc' : 'asc';

        // Base query: only games that have at least one version
        $query = Game::with(['latestVersion', 'user'])
            ->whereHas('latestVersion')
            ->withCount('scores as score_count');

        // Sorting
        match ($sortBy) {
            'popular'    => $query->orderBy('score_count', $sortDir),
            'uploaddate' => $query->orderBy(
                GameVersion::select('created_at')
                    ->whereColumn('game_id', 'games.id')
                    ->latest()
                    ->limit(1),
                $sortDir
            ),
            default      => $query->orderBy('title', $sortDir),
        };

        $total   = $query->count();
        $games   = $query->skip($page * $size)->take($size)->get();

        return response()->json([
            'page'          => $page,
            'size'          => $games->count(),
            'totalElements' => $total,
            'content'       => $games->map(fn($g) => $this->formatGame($g)),
        ]);
    }

    /**
     * POST /api/v1/games
     * Create a new game. Developer/Admin only (authenticated).
     */
    public function store(CreateGameRequest $request)
    {
        $slug = Str::slug($request->title);

        if (Game::where('slug', $slug)->exists()) {
            return response()->json([
                'status' => 'invalid',
                'slug'   => 'Game title already exists',
            ], 400);
        }

        $game = Game::create([
            'slug'        => $slug,
            'title'       => $request->title,
            'description' => $request->description,
            'user_id'     => $request->user()->id,
        ]);

        return response()->json(['status' => 'success', 'slug' => $game->slug], 201);
    }

    /**
     * GET /api/v1/games/:slug
     * Single game details including gamePath.
     */
    public function show(string $slug)
    {
        $game = Game::with(['latestVersion', 'user'])
            ->withCount('scores as score_count')
            ->where('slug', $slug)
            ->firstOrFail();

        $latest = $game->latestVersion;

        return response()->json([
            'slug'            => $game->slug,
            'title'           => $game->title,
            'description'     => $game->description,
            'thumbnail'       => $latest?->thumbnailUrl(),
            'uploadTimestamp' => $latest?->created_at->toISOString(),
            'author'          => $game->user->username,
            'scoreCount'      => (int) $game->score_count,
            'gamePath'        => $latest ? $latest->gamePath() : null,
        ]);
    }

    /**
     * PUT /api/v1/games/:slug
     * Update game title/description. Only the author can do this.
     */
    public function update(UpdateGameRequest $request, string $slug)
    {
        $game = Game::where('slug', $slug)->firstOrFail();

        if ($game->user_id !== $request->user()->id) {
            return response()->json([
                'status'  => 'forbidden',
                'message' => 'You are not the game author',
            ], 403);
        }

        $game->update([
            'title'       => $request->title,
            'description' => $request->description,
        ]);

        return response()->json(['status' => 'success']);
    }

    /**
     * DELETE /api/v1/games/:slug
     * Delete the game (and cascading: versions, scores). Only author.
     */
    public function destroy(Request $request, string $slug)
    {
        $game = Game::where('slug', $slug)->firstOrFail();

        if ($game->user_id !== $request->user()->id) {
            return response()->json([
                'status'  => 'forbidden',
                'message' => 'You are not the game author',
            ], 403);
        }

        // Remove game files from storage
        Storage::deleteDirectory("games/{$slug}");

        $game->delete();

        return response()->noContent();
    }

    /**
     * POST /api/v1/games/:slug/upload
     * Upload a new version zip. Token passed as form field `token`.
     * This is a multipart/form-data endpoint (not JSON).
     */
    public function upload(Request $request, string $slug)
    {
        // Authenticate via token form field (Sanctum doesn't handle multipart by default)
        $tokenValue = $request->input('token');
        $token      = \Laravel\Sanctum\PersonalAccessToken::findToken($tokenValue);

        if (!$token) {
            return response('Unauthenticated.', 401);
        }

        $user = $token->tokenable;

        if ($user->is_blocked) {
            return response('User blocked.', 403);
        }

        $game = Game::where('slug', $slug)->firstOrFail();

        if ($game->user_id !== $user->id) {
            return response('User is not author of the game', 403);
        }

        if (!$request->hasFile('zipfile') || !$request->file('zipfile')->isValid()) {
            return response('No valid zip file provided.', 400);
        }

        // Determine next version number
        $nextVersion = ($game->versions()->max('version') ?? 0) + 1;

        $destPath = "games/{$slug}/{$nextVersion}";

        // Extract zip to storage/app/public/games/:slug/:version/
        $zipPath = $request->file('zipfile')->getRealPath();
        $zip     = new \ZipArchive();

        if ($zip->open($zipPath) !== true) {
            return response('Invalid zip file.', 400);
        }

        $storagePath = storage_path("app/public/{$destPath}");
        @mkdir($storagePath, 0755, true);
        $zip->extractTo($storagePath);
        $zip->close();

        $hasThumbnail = file_exists("{$storagePath}/thumbnail.png");

        GameVersion::create([
            'game_id'       => $game->id,
            'version'       => $nextVersion,
            'has_thumbnail' => $hasThumbnail,
        ]);

        return response()->json(['status' => 'success', 'version' => $nextVersion], 201);
    }

    // ── Private helper ────────────────────────────────────────────
    private function formatGame(Game $game): array
    {
        $latest = $game->latestVersion;
        return [
            'slug'            => $game->slug,
            'title'           => $game->title,
            'description'     => $game->description,
            'thumbnail'       => $latest?->thumbnailUrl(),
            'uploadTimestamp' => $latest?->created_at->toISOString(),
            'author'          => $game->user->username,
            'scoreCount'      => (int) $game->score_count,
        ];
    }
}