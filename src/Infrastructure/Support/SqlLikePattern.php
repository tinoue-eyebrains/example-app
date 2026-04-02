<?php

namespace Infrastructure\Support;

final class SqlLikePattern
{
    /**
     * SQL LIKE 用の「%…%」パターン。% _ \ はリテラルとして扱う。
     */
    public static function contains(string $literal): string
    {
        return '%'.addcslashes($literal, '%_\\').'%';
    }
}
