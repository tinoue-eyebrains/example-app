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
        $model = new UserModel;
        if ($user->id() !== null) {
            $model->setAttribute($model->getKeyName(), $user->id());
        }
        $model->name = $user->name();
        $model->email = $user->email();
        $model->password = $user->hashedPassword();

        return $model;
    }
}
