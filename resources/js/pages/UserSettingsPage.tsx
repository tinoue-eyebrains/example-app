import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    clearUserSettingsFlashMessage,
    peekUserSettingsFlashMessage,
    setUserSettingsFlashMessage,
} from '../userSettingsFlash';

const NAVY = '#1e3a5f';
const NAVY_HOVER = '#2a4a75';

type UserRow = { id: number; name: string; email: string; avatar_url: string | null };

type ListResponse = {
    data: UserRow[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
};

type SortColumn = 'id' | 'email';
type SortOrder = 'asc' | 'desc';

function SortCaret({ active, order }: { active: boolean; order: SortOrder }): JSX.Element {
    if (!active) {
        return (
            <span className="ml-1 inline-block w-4 text-center text-gray-300" aria-hidden>
                ↕
            </span>
        );
    }
    return (
        <span className="ml-1 inline-block w-4 text-center text-[#1e3a5f]" aria-hidden>
            {order === 'asc' ? '↑' : '↓'}
        </span>
    );
}

function hashHue(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i += 1) {
        h = s.charCodeAt(i) + ((h << 5) - h);
    }
    return Math.abs(h) % 360;
}

function UserCell({ name, email, avatarUrl }: { name: string; email: string; avatarUrl: string | null }): JSX.Element {
    const initial =
        name.trim().charAt(0).toUpperCase() || email.trim().charAt(0).toUpperCase() || '?';
    const hue = hashHue(name || email);

    return (
        <div className="flex items-center gap-3">
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-gray-200"
                />
            ) : (
                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: `hsl(${String(hue)}, 52%, 46%)` }}
                >
                    {initial}
                </div>
            )}
            <div className="min-w-0">
                <div className="truncate font-semibold text-gray-900">{name}</div>
                <div className="truncate text-sm text-gray-500">{email}</div>
            </div>
        </div>
    );
}

function IconPencil(): JSX.Element {
    return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
        </svg>
    );
}

function IconTrash(): JSX.Element {
    return (
        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
        </svg>
    );
}

function paginationItems(current: number, last: number): Array<number | 'ellipsis'> {
    if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
    }
    const edge = new Set([1, last, current, current - 1, current + 1]);
    const nums = [...edge].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);
    const items: Array<number | 'ellipsis'> = [];
    let prev = 0;
    for (const n of nums) {
        if (prev !== 0 && n - prev > 1) {
            items.push('ellipsis');
        }
        items.push(n);
        prev = n;
    }
    return items;
}

export function UserSettingsPage(): JSX.Element {
    const location = useLocation();
    const [nameInput, setNameInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [nameFilter, setNameFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<SortColumn>('id');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [rows, setRows] = useState<UserRow[]>([]);
    const [meta, setMeta] = useState<ListResponse['meta'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [flashMessage, setFlashMessage] = useState<string | null>(null);

    useEffect(() => {
        const next = peekUserSettingsFlashMessage();
        if (next !== null) {
            setFlashMessage(next);
        }
    }, [location.key]);

    const load = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
            page: String(page),
            per_page: '10',
        });
        if (nameFilter !== '') {
            params.set('name', nameFilter);
        }
        if (emailFilter !== '') {
            params.set('email', emailFilter);
        }
        params.set('sort', sortBy);
        params.set('order', sortOrder);
        try {
            const res = await fetch(`/api/users?${params.toString()}`, {
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) {
                setError('一覧の取得に失敗しました。');
                setRows([]);
                setMeta(null);
                return;
            }
            const body = (await res.json()) as ListResponse;
            setRows(body.data);
            setMeta(body.meta);
        } catch {
            setError('通信エラーが発生しました。');
            setRows([]);
            setMeta(null);
        } finally {
            setLoading(false);
        }
    }, [page, nameFilter, emailFilter, sortBy, sortOrder]);

    useEffect(() => {
        void load();
    }, [load]);

    function toggleSort(column: SortColumn): void {
        setPage(1);
        if (sortBy === column) {
            setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(column);
            setSortOrder(column === 'id' ? 'desc' : 'asc');
        }
    }

    function onSearch(e: FormEvent<HTMLFormElement>): void {
        e.preventDefault();
        setPage(1);
        setNameFilter(nameInput.trim());
        setEmailFilter(emailInput.trim());
    }

    async function onDelete(id: number, name: string): Promise<void> {
        if (!window.confirm(`「${name}」を削除しますか？`)) {
            return;
        }
        try {
            const res = await fetch(`/api/users/${String(id)}`, {
                method: 'DELETE',
                headers: { Accept: 'application/json' },
            });
            if (res.status === 404) {
                setError('既に削除されているか、ユーザーが見つかりません。');
                void load();
                return;
            }
            if (!res.ok) {
                setError('削除に失敗しました。');
                return;
            }
            const deletedMsg = `「${name}」を削除しました。`;
            setUserSettingsFlashMessage(deletedMsg);
            setFlashMessage(deletedMsg);
            void load();
        } catch {
            setError('通信エラーが発生しました。');
        }
    }

    const lastPage = meta?.last_page ?? 1;
    const currentPage = meta?.current_page ?? page;
    const total = meta?.total ?? 0;
    const perPage = meta?.per_page ?? 10;

    const rangeStart = total === 0 ? 0 : perPage * (currentPage - 1) + 1;
    const rangeEnd = total === 0 ? 0 : Math.min(perPage * currentPage, total);

    const pageItems = useMemo(() => paginationItems(currentPage, lastPage), [currentPage, lastPage]);

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-gray-100 px-4 py-8 font-sans">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">ユーザー管理</h1>
                    <Link
                        to="/settings/users/register"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors"
                        style={{ backgroundColor: NAVY }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = NAVY_HOVER;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = NAVY;
                        }}
                    >
                        <span className="text-lg leading-none">+</span>
                        新規ユーザー登録
                    </Link>
                </div>

                <form
                    className="mb-6 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                    onSubmit={onSearch}
                >
                    <div>
                        <label htmlFor="user-filter-name" className="mb-1 block text-xs font-medium text-gray-600">
                            名前
                        </label>
                        <input
                            id="user-filter-name"
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            placeholder="名前で絞り込み"
                            autoComplete="off"
                        />
                    </div>
                    <div>
                        <label htmlFor="user-filter-email" className="mb-1 block text-xs font-medium text-gray-600">
                            メールアドレス
                        </label>
                        <input
                            id="user-filter-email"
                            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            type="text"
                            inputMode="email"
                            autoCapitalize="none"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="メールで絞り込み"
                            autoComplete="off"
                        />
                    </div>
                    <button
                        type="submit"
                        className="h-[42px] rounded-xl px-5 text-sm font-medium text-white shadow-sm transition-colors sm:mt-0"
                        style={{ backgroundColor: NAVY }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = NAVY_HOVER;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = NAVY;
                        }}
                    >
                        検索
                    </button>
                </form>

                {flashMessage ? (
                    <div
                        className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 pr-2 text-sm text-green-900"
                        role="status"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <span className="min-w-0">{flashMessage}</span>
                            <button
                                type="button"
                                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-lg leading-none text-green-800 hover:bg-green-100/80"
                                aria-label="閉じる"
                                onClick={() => {
                                    clearUserSettingsFlashMessage();
                                    setFlashMessage(null);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ) : null}

                {error ? (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                        {error}
                    </div>
                ) : null}

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        <button
                                            type="button"
                                            className={`inline-flex items-center rounded-lg px-1 py-0.5 hover:bg-gray-100/80 ${
                                                sortBy === 'id' ? 'text-[#1e3a5f]' : 'text-gray-600'
                                            }`}
                                            aria-sort={
                                                sortBy === 'id'
                                                    ? sortOrder === 'asc'
                                                        ? 'ascending'
                                                        : 'descending'
                                                    : 'none'
                                            }
                                            onClick={() => toggleSort('id')}
                                        >
                                            ID
                                            <SortCaret active={sortBy === 'id'} order={sortOrder} />
                                        </button>
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        <button
                                            type="button"
                                            className={`inline-flex items-center rounded-lg px-1 py-0.5 normal-case tracking-normal hover:bg-gray-100/80 ${
                                                sortBy === 'email' ? 'text-[#1e3a5f]' : 'text-gray-600'
                                            }`}
                                            aria-label="メールアドレスの順で並べ替え"
                                            aria-sort={
                                                sortBy === 'email'
                                                    ? sortOrder === 'asc'
                                                        ? 'ascending'
                                                        : 'descending'
                                                    : 'none'
                                            }
                                            onClick={() => toggleSort('email')}
                                        >
                                            ユーザー
                                            <SortCaret active={sortBy === 'email'} order={sortOrder} />
                                        </button>
                                    </th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                                        操作
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-12 text-center text-gray-500">
                                            読み込み中…
                                        </td>
                                    </tr>
                                ) : rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-12 text-center text-gray-500">
                                            該当するユーザーがありません。
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((u) => (
                                        <tr key={u.id} className="transition-colors hover:bg-gray-50/80">
                                            <td className="whitespace-nowrap px-5 py-4 tabular-nums text-gray-600">{u.id}</td>
                                            <td className="px-5 py-4">
                                                <UserCell name={u.name} email={u.email} avatarUrl={u.avatar_url} />
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Link
                                                        to={`/settings/users/${String(u.id)}/edit`}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                                                        aria-label="編集"
                                                    >
                                                        <IconPencil />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-red-50"
                                                        aria-label="削除"
                                                        onClick={() => void onDelete(u.id, u.name)}
                                                    >
                                                        <IconTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {meta !== null && (meta.last_page > 1 || meta.total > 0) ? (
                        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 sm:flex-row">
                            <nav className="flex items-center gap-1" aria-label="ページネーション">
                                <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35"
                                    disabled={currentPage <= 1 || loading}
                                    aria-label="前のページ"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    <span className="text-lg">&lt;</span>
                                </button>
                                {pageItems.map((item, idx) =>
                                    item === 'ellipsis' ? (
                                        <span key={`e-${String(idx)}`} className="px-2 text-gray-400">
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={item}
                                            type="button"
                                            className={`min-w-[2.25rem] rounded-lg px-2 py-1.5 text-sm tabular-nums ${
                                                item === currentPage
                                                    ? 'font-bold text-gray-900'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                            disabled={loading}
                                            onClick={() => setPage(item)}
                                        >
                                            {item}
                                        </button>
                                    ),
                                )}
                                <button
                                    type="button"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35"
                                    disabled={currentPage >= lastPage || loading}
                                    aria-label="次のページ"
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    <span className="text-lg">&gt;</span>
                                </button>
                            </nav>
                            <p className="text-sm text-gray-600">
                                表示中: {rangeStart}-{rangeEnd} / {total} 件
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
