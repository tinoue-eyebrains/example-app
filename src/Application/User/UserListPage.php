<?php

namespace Application\User;

final readonly class UserListPage
{
    /**
     * @param list<array{id: int, name: string, email: string}> $items
     */
    public function __construct(
        public array $items,
        public int $total,
        public int $perPage,
        public int $currentPage,
        public int $lastPage,
    ) {}
}
