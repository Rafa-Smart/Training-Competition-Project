<?php

namespace App\Http\Controllers;

use App\Models\Score;
use App\Models\User;
use Hash;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::orderBy('username')->get(['username', 'last_login_at', 'updated_at']);

        return response()->json([
            'totalElements' => $users->count(),
            'content' => $users->map(function ($user) {
                return [
                    'username' => $user->username,
                    'last_login_at' => $user->last_login_at?->toISOString() ?? '',
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ];
            }),
        ]);
    } 
    
    public function destroy(int $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'status'  => 'not-found',
                'message' => 'User Not found',
            ], 403);
        }

        $user->delete();

        return response()->noContent();
    }

    public function store(Request $request)
    {
        if (User::where('username', $request->username)->exists()) {
            return response()->json([
                'status'  => 'invalid',
                'message' => 'Username already exists',
            ], 400);
        }

        $user = User::create([
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role'     => 'player',
        ]);

        return response()->json(['status' => 'success', 'username' => $user->username], 201);
    }


    public function update(Request $request, int $id){
        $user = User::findOrFail($id);

        $existing = User::where('username', $request->username)
            ->where('id', '!=', $id)
            ->exists();

        if ($existing) {
            return response()->json([
                'status'  => 'invalid',
                'message' => 'Username already exists',
            ], 400);
        }

        $user->update([
            'username' => $request->username,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['status' => 'success', 'username' => $user->username], 201);
    }



    public function show(Request $request, string $username){
             $profileUser = User::where('username', $username)->firstOrFail();
        $isSelf  = $request->user()?->id === $profileUser->id;

        
        $gamesQuery = $profileUser->games()->with('latestVersion');
        if (!$isSelf) {
            $gamesQuery->whereHas('latestVersion');
        }
        $authoredGames = $gamesQuery
            ->get()
            ->sortByDesc(fn($g) => optional($g->latestVersion)->created_at)
            ->values()
            ->map(fn($g) => [
                'slug'        => $g->slug,
                'title'       => $g->title,
                'description' => $g->description,
            ]);
 
        $highscores = Score::with(['gameVersion.game'])
            ->where('user_id', $profileUser->id)
            ->get()
            ->groupBy(fn($s) => $s->gameVersion->game_id)
            ->map(function ($scores) {
                $best = $scores->sortByDesc('score')->first();
                $game = $best->gameVersion->game;
                return [
                    'game'      => [
                        'slug'        => $game->slug,
                        'title'       => $game->title,
                        'description' => $game->description,
                    ],
                    'score'     => $best->score,
                    'timestamp' => $best->created_at->toISOString(),
                ];
            })
            ->sortBy('game.title')
            ->values();

        return response()->json([
            'username'            => $profileUser->username,
            'registeredTimestamp' => $profileUser->created_at->toISOString(),
            'authoredGames'       => $authoredGames,
            'highscores'          => $highscores,
        ]);
    }
}
