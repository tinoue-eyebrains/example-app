<?php

namespace Application\User\RegisterUser;

final readonly class RegisterUserResult
{
    public function __construct(
        public int $userId,
    ) {}
}
