<?php

namespace Application\User;

interface PasswordHasherInterface
{
    public function hash(string $plain): string;
}
