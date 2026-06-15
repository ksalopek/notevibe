<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceSessionTimeout
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $timeout = \App\Models\Setting::get('session_timeout');
            
            if ($timeout && is_numeric($timeout)) {
                // Overwrite the session lifetime config for this request
                config(['session.lifetime' => (int) $timeout]);
            }
        } catch (\Exception $e) {
            // Ignore if DB/Table is not ready
        }

        return $next($request);
    }
}
