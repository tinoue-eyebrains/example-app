<?php

namespace App\Http\Controllers;

use Application\User\RegisterUser\RegisterUser;
use Application\User\RegisterUser\RegisterUserInput;
use App\Http\Requests\RegisterUserRequest;
use Domain\User\EmailAlreadyRegisteredException;
use Illuminate\Http\JsonResponse;

class RegisterUserController extends Controller
{
    public function store(RegisterUserRequest $request, RegisterUser $registerUser): JsonResponse
    {
        try {
            $result = $registerUser->execute(new RegisterUserInput(
                $request->validated('name'),
                $request->validated('email'),
                $request->validated('password'),
            ));

            return response()->json(['id' => $result->userId], JsonResponse::HTTP_CREATED);
        } catch (EmailAlreadyRegisteredException $e) {
            return response()->json(['message' => $e->getMessage()], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
