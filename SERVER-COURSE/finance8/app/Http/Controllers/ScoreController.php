<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Score;
use App\Http\Requests\StoreScoreRequest;
use App\Http\Requests\UpdateScoreRequest;
use Request;

class ScoreController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(string $slug)
    {
        $game = Game::where('slug', $slug)->firstOrFail();
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
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
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

    /**
     * Display the specified resource.
     */
    public function show(Score $score)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Score $score)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateScoreRequest $request, Score $score)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Score $score)
    {
        //
    }
}
