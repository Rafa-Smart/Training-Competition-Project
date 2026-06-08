<?php

namespace App\Http\Controllers;

use App\Models\User;

class AdminController extends Controller
{
    /**
     * GET /api/v1/admins
     * Returns all admin users. (Requires admin role — enforced via IsAdmin middleware)
     */
    public function index()
    {
        $admins = Admin::where('role', 'admin')
            ->orderBy('username')
            ->get(['username', 'last_login_at', 'created_at', 'updated_at']);

        return response()->json([
            'totalElements' => $admins->count(),
            'content' => $admins->map(fn ($u) => [
                'username' => $u->username,
                'last_login_at' => $u->last_login_at?->toISOString() ?? '',
                'created_at' => $u->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $u->updated_at->format('Y-m-d H:i:s'),
            ]),
        ]);
    }
}
