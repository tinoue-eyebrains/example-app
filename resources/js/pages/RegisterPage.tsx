import { FormEvent, useState } from 'react';

type RegisterSuccess = { id: number };
type ApiErrorBody = { message?: string };

export function RegisterPage(): JSX.Element {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
    const [message, setMessage] = useState<string | null>(null);
    const [variant, setVariant] = useState<'ok' | 'err' | null>(null);

    async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setStatus('submitting');
        setMessage('送信中...');
        setVariant(null);

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = (await res.json()) as RegisterSuccess & ApiErrorBody;

            if (res.ok) {
                setVariant('ok');
                setMessage(`登録成功: user id = ${data.id}`);
                setName('');
                setEmail('');
                setPassword('');
            } else {
                setVariant('err');
                setMessage(data.message ?? '登録に失敗しました。');
            }
        } catch {
            setVariant('err');
            setMessage('通信エラーが発生しました。');
        } finally {
            setStatus('idle');
        }
    }

    return (
        <div className="mx-auto max-w-lg px-4 py-10 font-sans">
            <h1 className="mb-2 text-2xl font-semibold text-gray-900">ユーザー登録確認ページ</h1>
            <p className="mb-6 text-sm text-gray-600">
                このページは <code className="rounded bg-gray-100 px-1">POST /api/users</code> を直接呼び出します。
            </p>

            <form className="grid gap-3" onSubmit={onSubmit}>
                <input
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    name="name"
                    type="text"
                    placeholder="Name"
                    required
                    maxLength={255}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                />
                <input
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    maxLength={255}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                />
                <input
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm"
                    name="password"
                    type="password"
                    placeholder="Password (8+ chars)"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                />
                <button
                    className="cursor-pointer rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-60"
                    type="submit"
                    disabled={status === 'submitting'}
                >
                    登録する
                </button>
            </form>

            <div
                className={
                    variant === 'ok'
                        ? 'mt-4 text-green-700'
                        : variant === 'err'
                          ? 'mt-4 text-red-800'
                          : 'mt-4 text-gray-700'
                }
                aria-live="polite"
            >
                {message}
            </div>
        </div>
    );
}
