<?php

namespace App\Http\Traits;

trait ApiResponse
{
    protected function successResponse(string $message, $data = null, int $statusCode = 200)
    {
        $response = [
            'message' => $message,
        ];

        if ($data) {
            $response = array_merge($response, $data);
        }

        return response()->json($response, $statusCode);
    }

    protected function errorResponse($message, array $errors, $statusCode)
    {
        $response = [
            'message' => $message,
        ];

        if (! empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    protected function validationErrorResponse($errors)
    {
        return $this->errorResponse('Invalid field', $errors, 422);
    }

    protected function unauthenticatedResponse()
    {
        return $this->errorResponse('unautenticated', [], 401);
    }

    protected function forbiddenResponse()
    {
        return $this->errorResponse('fobidden access', [], 403);
    }

    protected function notFoundResource($resource)
    {
        return $this->errorResponse($resource.' is not found', [], 404);
    }

    protected function noContentResponse()
    {
        return response()->json(null, 204);
    }
}
