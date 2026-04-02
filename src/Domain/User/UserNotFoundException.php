<?php

namespace Domain\User;

use RuntimeException;

final class UserNotFoundException extends RuntimeException
{
    public function __construct(string $message = 'ユーザーが見つかりません。')
    {
        parent::__construct($message);
    }
}
