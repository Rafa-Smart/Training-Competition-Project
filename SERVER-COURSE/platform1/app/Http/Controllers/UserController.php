<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Game;
use App\Models\Score;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * GET /api/v1/users
     * List all players. (Admin only)
     */
    public function index()
    {
        $users = User::where('role', 'player')
            ->orderBy('username')
            ->get();

        return response()->json([
            'totalElements' => $users->count(),
            'content'       => $users->map(fn($u) => [
                'username'      => $u->username,
                'last_login_at' => $u->last_login_at?->toISOString() ?? '',
                'created_at'    => $u->created_at->format('Y-m-d H:i:s'),
                'updated_at'    => $u->updated_at->format('Y-m-d H:i:s'),
            ]),
        ]);
    }

    /**
     * POST /api/v1/users
     * Create a new user. (Admin only)
     */
    public function store(CreateUserRequest $request)
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

    /**
     * PUT /api/v1/users/:id
     * Update a user. (Admin only)
     */
    public function update(UpdateUserRequest $request, int $id)
    {
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

    /**
     * DELETE /api/v1/users/:id
     * Delete a user. (Admin only)
     */
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

    /**
     * GET /api/v1/users/:username
     * Public profile: authored games + personal highscores.
     */
    public function show(Request $request, string $username)
    {
        $profileUser = User::where('username', $username)->firstOrFail();
        $isSelf      = $request->user()?->id === $profileUser->id;

        // Authored games: with at least one version (unless self → include no-version games too)
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

        // Highscores: best score per game
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