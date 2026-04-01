<?php

namespace Domain\User;

final class User
{
    public function __construct(
        private readonly ?int $id,
        private readonly string $name,
        private readonly string $email,
        private readonly string $hashedPassword,
    ) {}

    public static function register(string $name, string $email, string $hashedPassword): self
    {
        return new self(null, $name, $email, $hashedPassword);
    }

    public static function restore(int $id, string $name, string $email, string $hashedPassword): self
    {
        return new self($id, $name, $email, $hashedPassword);
    }

    public function id(): ?int
    {
        return $this->id;
    }

    public function withId(int $id): self
    {
        return new self($id, $this->name, $this->email, $this->hashedPassword);
    }

    public function name(): string
    {
        return $this->name;
    }

    public function email(): string
    {
        return $this->email;
    }

    public function hashedPassword(): string
    {
        return $this->hashedPassword;
    }
}
