<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Http\Requests\StoreAdminRequest;
use App\Http\Requests\UpdateAdminRequest;
use App\Models\Administrator;
use App\Models\User;

class AdminController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $admins = Administrator::
            orderBy('username')
            ->get(['username', 'last_login_at', 'created_at', 'updated_at']);

        return response()->json([
            'totalElements' => $admins->count(),
            'content' => $admins->map(fn ($u) => [
                'username' => $u->username,
                'last_login_at' => $u->last_login_at ?? '',
                'created_at' => $u->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $u->updated_at->format('Y-m-d H:i:s'),
            ]),
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
    public function store(StoreAdminRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Admin $admin)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Admin $admin)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAdminRequest $request, Admin $admin)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Admin $admin)
    {
        //
    }
}
