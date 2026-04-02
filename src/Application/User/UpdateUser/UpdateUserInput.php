<?php

namespace Application\User\UpdateUser;

final readonly class UpdateUserInput
{
    public function __construct(
        public int $id,
        public string $name,
        public string $email,
        public ?string $password,
    ) {}
}
