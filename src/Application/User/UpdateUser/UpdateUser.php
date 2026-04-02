<?php

namespace Application\User\UpdateUser;

use Application\User\PasswordHasherInterface;
use Application\User\UserRepositoryInterface;
use Domain\User\EmailAlreadyRegisteredException;
use Domain\User\User;
use Domain\User\UserNotFoundException;

final class UpdateUser
{
    public function __construct(
        private UserRepositoryInterface $users,
        private PasswordHasherInterface $hasher,
    ) {}

    public function execute(UpdateUserInput $input): void
    {
        $existing = $this->users->findById($input->id);
        if ($existing === null) {
            throw new UserNotFoundException;
        }

        if ($this->users->existsByEmailExcept($input->email, $input->id)) {
            throw new EmailAlreadyRegisteredException('このメールアドレスは既に登録されています。');
        }

        $hash = $input->password !== null
            ? $this->hasher->hash($input->password)
            : $existing->hashedPassword();

        $avatarPath = $input->newAvatarPath !== null ? $input->newAvatarPath : $existing->avatarPath();
        $updated = User::restore($input->id, $input->name, $input->email, $hash, $avatarPath);
        $this->users->save($updated);
    }
}
