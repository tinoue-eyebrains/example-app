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
use Illuminate\Support\Facades\Storage;

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
            'avatar_url' => $this->avatarPublicUrl($found->avatarPath()),
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

        $data = array_map(function (array $item): array {
            return [
                'id' => $item['id'],
                'name' => $item['name'],
                'email' => $item['email'],
                'avatar_url' => $this->avatarPublicUrl($item['avatar_path'] ?? null),
            ];
        }, $result->items);

        return response()->json([
            'data' => $data,
            'meta' => [
                'total' => $result->total,
                'per_page' => $result->perPage,
                'current_page' => $result->currentPage,
                'last_page' => $result->lastPage,
            ],
        ]);
    }

    public function update(UpdateUserRequest $request, int $user, UpdateUser $updateUser, UserRepositoryInterface $users): JsonResponse
    {
        $password = $request->validated('password');
        $plain = is_string($password) && $password !== '' ? $password : null;

        $before = $users->findById($user);
        $previousAvatarPath = $before?->avatarPath();

        $newAvatarPath = null;
        if ($request->hasFile('avatar')) {
            $newAvatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        try {
            $updateUser->execute(new UpdateUserInput(
                $user,
                $request->validated('name'),
                $request->validated('email'),
                $plain,
                $newAvatarPath,
            ));
        } catch (UserNotFoundException $e) {
            if ($newAvatarPath !== null) {
                Storage::disk('public')->delete($newAvatarPath);
            }

            return response()->json(['message' => $e->getMessage()], JsonResponse::HTTP_NOT_FOUND);
        } catch (EmailAlreadyRegisteredException $e) {
            if ($newAvatarPath !== null) {
                Storage::disk('public')->delete($newAvatarPath);
            }

            return response()->json([
                'message' => $e->getMessage(),
                'errors' => ['email' => [$e->getMessage()]],
            ], JsonResponse::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($newAvatarPath !== null && $previousAvatarPath !== null && $previousAvatarPath !== '' && $previousAvatarPath !== $newAvatarPath) {
            Storage::disk('public')->delete($previousAvatarPath);
        }

        return response()->json(null, JsonResponse::HTTP_NO_CONTENT);
    }

    public function destroy(int $user, DeleteUser $deleteUser, UserRepositoryInterface $users): JsonResponse
    {
        $existing = $users->findById($user);
        $oldPath = $existing?->avatarPath();

        try {
            $deleteUser->execute($user);
        } catch (UserNotFoundException $e) {
            return response()->json(['message' => $e->getMessage()], JsonResponse::HTTP_NOT_FOUND);
        }

        if ($oldPath !== null && $oldPath !== '') {
            Storage::disk('public')->delete($oldPath);
        }

        return response()->json(null, JsonResponse::HTTP_NO_CONTENT);
    }

    private function avatarPublicUrl(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        return Storage::disk('public')->url($path);
    }
}
