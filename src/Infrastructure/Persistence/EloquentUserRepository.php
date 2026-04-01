<?php

namespace Infrastructure\Persistence;

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

    public function save(User $user): User
    {
        $model = $this->mapper->toModel($user);
        $model->save();

        return $this->mapper->toDomain($model->fresh());
    }
}
