import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    clearUserSettingsFlashMessage,
    peekUserSettingsFlashMessage,
    setUserSettingsFlashMessage,
} from '../userSettingsFlash';

type UserRow = { id: number; name: string; email: string };

type ListResponse = {
    data: UserRow[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
};

export function UserSettingsPage(): JSX.Element {
    const location = useLocation();
    const [nameInput, setNameInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [nameFilter, setNameFilter] = useState('');
    const [emailFilter, setEmailFilter] = useState('');
    const [page, setPage] = useState(1);
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
    }, [page, nameFilter, emailFilter]);

    useEffect(() => {
        void load();
    }, [load]);

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
            const res = await fetch(`/api/users/${id}`, {
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

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 font-sans">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">ユーザー設定</h1>
                    <p className="mt-1 text-sm text-gray-600">登録済みユーザーの一覧・編集・削除ができます。</p>
                </div>
                <Link
                    className="inline-flex justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    to="/settings/users/register"
                >
                    ユーザー登録へ
                </Link>
            </div>

            <form className="mb-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={onSearch}>
                <div>
                    <label htmlFor="user-filter-name" className="mb-1 block text-xs font-medium text-gray-700">
                        名前
                    </label>
                    <input
                        id="user-filter-name"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="名前で絞り込み"
                        autoComplete="off"
                    />
                </div>
                <div>
                    <label htmlFor="user-filter-email" className="mb-1 block text-xs font-medium text-gray-700">
                        メールアドレス
                    </label>
                    <input
                        id="user-filter-email"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
                    className="h-[38px] rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 hover:bg-gray-50 sm:self-end"
                >
                    検索
                </button>
            </form>

            {flashMessage ? (
                <div
                    className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 pr-2 text-sm text-green-900"
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
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                    {error}
                </div>
            ) : null}

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">ID</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">名前</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">メール</th>
                            <th className="px-4 py-3 text-right font-medium text-gray-700">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                    読み込み中…
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                    該当するユーザーがありません。
                                </td>
                            </tr>
                        ) : (
                            rows.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50/80">
                                    <td className="px-4 py-3 tabular-nums text-gray-600">{u.id}</td>
                                    <td className="px-4 py-3 text-gray-900">{u.name}</td>
                                    <td className="px-4 py-3 text-gray-700">{u.email}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-800 hover:bg-gray-50"
                                                to={`/settings/users/${u.id}/edit`}
                                            >
                                                編集
                                            </Link>
                                            <button
                                                type="button"
                                                className="cursor-pointer rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                                                onClick={() => void onDelete(u.id, u.name)}
                                            >
                                                削除
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {meta && meta.last_page > 1 ? (
                <nav
                    className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row"
                    aria-label="ページネーション"
                >
                    <p className="text-sm text-gray-600">
                        全 {meta.total} 件中 {meta.per_page * (meta.current_page - 1) + 1}–
                        {Math.min(meta.per_page * meta.current_page, meta.total)} 件を表示
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40"
                            disabled={currentPage <= 1 || loading}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            前へ
                        </button>
                        <span className="text-sm text-gray-700">
                            {currentPage} / {lastPage}
                        </span>
                        <button
                            type="button"
                            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40"
                            disabled={currentPage >= lastPage || loading}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            次へ
                        </button>
                    </div>
                </nav>
            ) : null}
        </div>
    );
}
