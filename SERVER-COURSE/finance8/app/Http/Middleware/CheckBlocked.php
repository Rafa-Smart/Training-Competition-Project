<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckBlocked
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {

        $user = $request->user();
        if($user && $user->is_blocked){
            return response()->json([
                'status'=> 'blocked',
                'message'=> 'User Blocked',
                'reason'=> $user->block_reason?? 'You have been blocked by an administrator'
            ], 403);
        }

        return $next($request);
    }
}
