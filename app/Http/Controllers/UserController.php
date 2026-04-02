<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListUsersRequest;
use App\Http\Requests\UpdateUserRequest;
use Application\User\DeleteUser\DeleteUser;
use Application\User\UpdateUser\UpdateUser;
use Application\User\UpdateUser\UpdateUserInput;
use Application\User\UserRepositoryInterface;
use Domain\User\EmailAlreadyRegisteredException;
use Domain\User\UserNotFoundException;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function show(int $user, UserRepositoryInterface $users): JsonResponse
    {
        $found = $users->findById($user);
        if ($found === null) {
            return response()->json(['message' => 'ユーザーが見つかりません。'], JsonResponse::HTTP_NOT_FOUND);
        }

        return response()->json([
            'id' => $found->id(),
            'name' => $found->name(),
            'email' => $found->email(),
        ]);
    }

    public function index(ListUsersRequest $request, UserRepositoryInterface $users): JsonResponse
    {
        $validated = $request->validated();
        $page = (int) ($validated['page'] ?? 1);
        $perPage = (int) ($validated['per_page'] ?? 10);
        $name = (string) ($validated['name'] ?? '');
        $email = (string) ($validated['email'] ?? '');

        $result = $users->findPaginated($page, $perPage, $name, $email);

        return response()->json([
            'data' => $result->items,
            'meta' => [
                'total' => $result->total,
                'per_page' => $result->perPage,
                'current_page' => $result->currentPage,
                'last_page' => $result->lastPage,
            ],
        ]);
    }

    public function update(UpdateUserRequest $request, int $user, UpdateUser $updateUser): JsonResponse
    {
        $password = $request->validated('password');
        $plain = is_string($password) && $password !== '' ? $password : null;

        try {
            $updateUser->execute(new UpdateUserInput(
                $user,
                $request->validated('name'),
                $request->validated('email'),
                $plain,
            ));

            return response()->json(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (UserNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], JsonResponse::HTTP_NOT_FOUND);
        } catch (EmailAlreadyRegisteredException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => ['email' => [$e->getMessage()]],
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function destroy(int $user, DeleteUser $deleteUser): JsonResponse
    {
        try {
            $deleteUser->execute($user);

            return response()->json(null, JsonResponse::HTTP_NO_CONTENT);
        } catch (UserNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], JsonResponse::HTTP_NOT_FOUND);
        }
    }
}
