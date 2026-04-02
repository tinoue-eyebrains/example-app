<?php

namespace Application\User\DeleteUser;

use Application\User\UserRepositoryInterface;
use Domain\User\UserNotFoundException;

final class DeleteUser
{
    public function __construct(
        private UserRepositoryInterface $users,
    ) {}

    public function execute(int $id): void
    {
        if (! $this->users->deleteById($id)) {
            throw new UserNotFoundException;
        }
    }
}
