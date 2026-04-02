<?php

namespace Tests\Unit\Application\User;

use Application\User\PasswordHasherInterface;
use Application\User\RegisterUser\RegisterUser;
use Application\User\RegisterUser\RegisterUserInput;
use Application\User\UserListPage;
use Application\User\UserRepositoryInterface;
use Domain\User\EmailAlreadyRegisteredException;
use Domain\User\User;
use PHPUnit\Framework\TestCase;

class RegisterUserTest extends TestCase
{
    public function test_registers_user(): void
    {
        $repo = new class implements UserRepositoryInterface
        {
            /** @var list<User> */
            public array $saved = [];

            private int $nextId = 1;

            public function existsByEmail(string $email): bool
            {
                foreach ($this->saved as $user) {
                    if ($user->email() === $email) {
                        return true;
                    }
                }

                return false;
            }

            public function existsByEmailExcept(string $email, int $exceptUserId): bool
            {
                return false;
            }

            public function findPaginated(
                int $page,
                int $perPage,
                string $nameSearch,
                string $emailSearch,
                string $sortColumn = 'id',
                string $sortDirection = 'desc',
            ): UserListPage {
                return new UserListPage([], 0, $perPage, $page, 0);
            }

            public function findById(int $id): ?User
            {
                return null;
            }

            public function save(User $user): User
            {
                $withId = $user->withId($this->nextId++);
                $this->saved[] = $withId;

                return $withId;
            }

            public function deleteById(int $id): bool
            {
                return false;
            }
        };

        $hasher = new class implements PasswordHasherInterface
        {
            public function hash(string $plain): string
            {
                return 'hashed_'.$plain;
            }

            public function verify(string $plain, string $hashed): bool
            {
                return $hashed === 'hashed_'.$plain;
            }
        };

        $useCase = new RegisterUser($repo, $hasher);
        $result = $useCase->execute(new RegisterUserInput('Alice', 'alice@example.com', 'secret'));

        $this->assertSame(1, $result->userId);
        $this->assertCount(1, $repo->saved);
        $this->assertSame('hashed_secret', $repo->saved[0]->hashedPassword());
    }

    public function test_duplicate_email_throws(): void
    {
        $existing = User::restore(1, 'Bob', 'bob@example.com', 'hash');

        $repo = new class ($existing) implements UserRepositoryInterface
        {
            public function __construct(private User $existing) {}

            public function existsByEmail(string $email): bool
            {
                return $email === $this->existing->email();
            }

            public function existsByEmailExcept(string $email, int $exceptUserId): bool
            {
                return false;
            }

            public function findPaginated(
                int $page,
                int $perPage,
                string $nameSearch,
                string $emailSearch,
                string $sortColumn = 'id',
                string $sortDirection = 'desc',
            ): UserListPage {
                return new UserListPage([], 0, $perPage, $page, 0);
            }

            public function findById(int $id): ?User
            {
                return null;
            }

            public function save(User $user): User
            {
                return $user;
            }

            public function deleteById(int $id): bool
            {
                return false;
            }
        };

        $hasher = new class implements PasswordHasherInterface
        {
            public function hash(string $plain): string
            {
                return 'x';
            }

            public function verify(string $plain, string $hashed): bool
            {
                return false;
            }
        };

        $useCase = new RegisterUser($repo, $hasher);

        $this->expectException(EmailAlreadyRegisteredException::class);
        $useCase->execute(new RegisterUserInput('Other', 'bob@example.com', 'pw'));
    }
}
