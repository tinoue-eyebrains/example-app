<?php

namespace Infrastructure\Persistence;

use Application\User\UserListPage;
use Application\User\UserRepositoryInterface;
use Domain\User\User;
use Infrastructure\Persistence\Eloquent\UserModel;

final class EloquentUserRepository implements UserRepositoryInterface
{
    public function __construct(
        private UserMapper $mapper,
    ) {}

    public function existsByEmail(string $email): bool
    {
        return UserModel::query()->where('email', $email)->exists();
    }

    public function existsByEmailExcept(string $email, int $exceptUserId): bool
    {
        return UserModel::query()
            ->where('email', $email)
            ->whereKeyNot($exceptUserId)
            ->exists();
    }

    public function findPaginated(int $page, int $perPage, string $nameSearch, string $emailSearch): UserListPage
    {
        $query = UserModel::query()->orderByDesc('id');
        $nameTrim = trim($nameSearch);
        if ($nameTrim !== '') {
            $like = '%'.addcslashes($nameTrim, '%_\\').'%';
            $query->where('name', 'like', $like);
        }
        $emailTrim = trim($emailSearch);
        if ($emailTrim !== '') {
            $like = '%'.addcslashes($emailTrim, '%_\\').'%';
            $query->where('email', 'like', $like);
        }

        $paginator = $query->paginate($perPage, ['id', 'name', 'email'], 'page', $page);
        /** @var list<array{id: int, name: string, email: string}> $items */
        $items = $paginator->getCollection()->map(fn (UserModel $m): array => [
            'id' => (int) $m->getKey(),
            'name' => (string) $m->name,
            'email' => (string) $m->email,
        ])->values()->all();

        return new UserListPage(
            $items,
            (int) $paginator->total(),
            (int) $paginator->perPage(),
            (int) $paginator->currentPage(),
            (int) $paginator->lastPage(),
        );
    }

    public function findById(int $id): ?User
    {
        $model = UserModel::query()->find($id);
        if ($model === null) {
            return null;
        }

        return $this->mapper->toDomain($model);
    }

    public function save(User $user): User
    {
        $model = $this->mapper->toModel($user);
        $model->save();

        return $this->mapper->toDomain($model->fresh());
    }

    public function deleteById(int $id): bool
    {
        return UserModel::query()->whereKey($id)->delete() > 0;
    }
}
