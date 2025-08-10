<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

use Sentry\Laravel\Integration;
use Sentry\Laravel\Facades\Sentry;

use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        Integration::handles($exceptions);

        $exceptions->render(function (Exception $e) {

            return match (true) {
                // Validation errors (422)
                $e instanceof ValidationException => response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                    'error_code' => 'VALIDATION_ERROR'
                ], 422),

                // Authentication errors (401)
                $e instanceof AuthenticationException => response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                    'error' => 'Please login to access this resource',
                    'error_code' => 'UNAUTHENTICATED'
                ], 401),

                // Authorization errors (403)
                $e instanceof AuthorizationException => response()->json([
                    'success' => false,
                    'message' => 'Forbidden',
                    'error' => 'You do not have permission to perform this action',
                    'error_code' => 'FORBIDDEN'
                ], 403),

                // Model not found (404)
                $e instanceof ModelNotFoundException => response()->json([
                    'success' => false,
                    'message' => 'Resource not found',
                    'error' => 'The requested resource does not exist',
                    'error_code' => 'RESOURCE_NOT_FOUND'
                ], 404),

                // Route not found (404)
                $e instanceof NotFoundHttpException => response()->json([
                    'success' => false,
                    'message' => 'Endpoint not found',
                    'error' => 'The requested endpoint does not exist',
                    'error_code' => 'ENDPOINT_NOT_FOUND'
                ], 404),

                // Method not allowed (405)
                $e instanceof MethodNotAllowedHttpException => response()->json([
                    'success' => false,
                    'message' => 'Method not allowed',
                    'error' => 'The HTTP method is not supported for this endpoint',
                    'error_code' => 'METHOD_NOT_ALLOWED',
                    'allowed_methods' => $e->getHeaders()['Allow'] ?? []
                ], 405),

                // Rate limiting (429)
                $e instanceof TooManyRequestsHttpException => response()->json([
                    'success' => false,
                    'message' => 'Too many requests',
                    'error' => 'You have exceeded the rate limit. Please try again later.',
                    'error_code' => 'RATE_LIMIT_EXCEEDED',
                    'retry_after' => $e->getHeaders()['Retry-After'] ?? null
                ], 429),


            };
        });
    })->create();
