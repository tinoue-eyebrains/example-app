<?php

namespace Application\User;

use Domain\User\User;

interface UserRepositoryInterface
{
    public function existsByEmail(string $email): bool;

    public function existsByEmailExcept(string $email, int $exceptUserId): bool;

    public function findPaginated(int $page, int $perPage, string $nameSearch, string $emailSearch): UserListPage;

    public function findById(int $id): ?User;

    public function save(User $user): User;

    public function deleteById(int $id): bool;
}
