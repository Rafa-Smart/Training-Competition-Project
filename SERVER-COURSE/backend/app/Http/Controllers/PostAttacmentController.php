<?php

namespace App\Http\Controllers;

use App\Models\PostAttacment;
use App\Models\PostAttachment;
use App\Http\Requests\StorePostAttacmentRequest;
use App\Http\Requests\UpdatePostAttacmentRequest;

class PostAttacmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function store(StorePostAttacmentRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(PostAttachment $postAttacment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PostAttacment $postAttacment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostAttacmentRequest $request, PostAttacment $postAttacment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PostAttacment $postAttacment)
    {
        //
    }
}
