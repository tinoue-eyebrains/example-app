<?php

namespace Application\User\RegisterUser;

final readonly class RegisterUserInput
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public ?string $avatarPath = null,
    ) {}
}
