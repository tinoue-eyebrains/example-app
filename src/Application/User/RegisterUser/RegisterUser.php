<?php

namespace Application\User\RegisterUser;

use Application\User\PasswordHasherInterface;
use Application\User\UserRepositoryInterface;
use Domain\User\EmailAlreadyRegisteredException;
use Domain\User\User;

final class RegisterUser
{
    public function __construct(
        private UserRepositoryInterface $users,
        private PasswordHasherInterface $hasher,
    ) {}

    public function execute(RegisterUserInput $input): RegisterUserResult
    {
        if ($this->users->existsByEmail($input->email)) {
            throw new EmailAlreadyRegisteredException('このメールアドレスは既に登録されています。');
        }

        $hashed = $this->hasher->hash($input->password);
        $user = User::register($input->name, $input->email, $hashed);
        $saved = $this->users->save($user);
        $id = $saved->id();
        if ($id === null) {
            throw new \RuntimeException('User id missing after save.');
        }

        return new RegisterUserResult($id);
    }
}
