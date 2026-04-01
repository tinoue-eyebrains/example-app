<?php

namespace Application\User;

use Domain\User\User;

interface UserRepositoryInterface
{
    public function existsByEmail(string $email): bool;

    public function save(User $user): User;
}
