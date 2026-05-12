<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreScoreRequest;
use App\Models\Game;
use App\Models\Score;

class ScoreController extends Controller
{
    /**
     * GET /api/v1/games/:slug/scores
     * Returns the highest score per player, sorted desc.
     */
    public function index(string $slug)
    {
        $game = Game::where('slug', $slug)->firstOrFail();

        // Get all scores for this game across all versions, then pick best per user
        $scores = Score::with('user')
            ->whereHas('gameVersion', fn ($q) => $q->where('game_id', $game->id))
            ->get()
            ->groupBy('user_id')
            ->map(fn ($userScores) => $userScores->sortByDesc('score')->first())
            ->sortByDesc('score')
            ->values()
            ->map(fn ($s) => [
                'username' => $s->user->username,
                'score' => $s->score,
                'timestamp' => $s->created_at->toISOString(),
            ]);

        return response()->json(['scores' => $scores]);
    }

    /**
     * POST /api/v1/games/:slug/scores
     * Submit a score for the latest version.
     */
    public function store(StoreScoreRequest $request, string $slug)
    {
        $game = Game::where('slug', $slug)->firstOrFail();
        $latestVersion = $game->latestVersion;

        if (! $latestVersion) {
            return response()->json(['status' => 'not-found', 'message' => 'Not found'], 404);
        }

        Score::create([
            'game_version_id' => $latestVersion->id,
            'user_id' => $request->user()->id,
            'score' => $request->score,
        ]);

        return response()->json(['status' => 'success'], 201);
    }
}
