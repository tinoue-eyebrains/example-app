<?php

namespace Infrastructure\Hashing;

use Application\User\PasswordHasherInterface;
use Illuminate\Support\Facades\Hash;

final class LaravelPasswordHasher implements PasswordHasherInterface
{
    public function hash(string $plain): string
    {
        return Hash::make($plain);
    }

    public function verify(string $plain, string $hashed): bool
    {
        return Hash::check($plain, $hashed);
    }
}
