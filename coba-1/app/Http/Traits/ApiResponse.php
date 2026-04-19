<?php
// app/Http/Traits/ApiResponse.php
namespace App\Http\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Success response method.
     */
    protected function successResponse(string $message, mixed $data = null, int $statusCode = 200): JsonResponse
    {
        $response = [
            'message' => $message,
        ];

        if ($data !== null) {
            $response = array_merge($response, $data);
        }

            return response()->json($response, $statusCode);
    }

    /**
     * Error response method.
     */
    protected function errorResponse(string $message, array $errors = [], int $statusCode = 400): JsonResponse
    {
        $response = [
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Validation error response.
     */
    protected function validationErrorResponse(array $errors): JsonResponse
    {
        return $this->errorResponse('Invalid field', $errors, 422);
    }

    /**
     * Unauthenticated response.
     */
    protected function unauthenticatedResponse(): JsonResponse
    {
        return $this->errorResponse('Unauthenticated.', [], 401);
    }

    /**
     * Forbidden access response.
     */
    protected function forbiddenResponse(): JsonResponse
    {
        return $this->errorResponse('Forbidden access', [], 403);
    }
    
    /**
     * Not found response.
     */
    protected function notFoundResponse(string $resource = 'Resource'): JsonResponse
    {
        return $this->errorResponse("{$resource} not found", [], 404);
    }

    /**
     * No content response.
     */
    protected function noContentResponse(): JsonResponse
    {
        return response()->json(null, 204);
    }
}