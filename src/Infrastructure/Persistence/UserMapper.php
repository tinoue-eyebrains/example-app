<?php

namespace Infrastructure\Persistence;

use Domain\User\User;
use Infrastructure\Persistence\Eloquent\UserModel;

final class UserMapper
{
    public function toDomain(UserModel $model): User
    {
        return User::restore(
            (int) $model->getKey(),
            (string) $model->name,
            (string) $model->email,
            (string) $model->getRawOriginal('password'),
        );
    }

    public function toModel(User $user): UserModel
    {
        if ($user->id() !== null) {
            $model = UserModel::query()->find($user->id()) ?? new UserModel;
            $model->setAttribute($model->getKeyName(), $user->id());
        } else {
            $model = new UserModel;
        }
        $model->name = $user->name();
        $model->email = $user->email();
        $model->password = $user->hashedPassword();

        return $model;
    }
}
