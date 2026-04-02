import { FormEvent, useState } from 'react';
import {
    type RegisterFieldKey,
    REGISTER_FIELD_ORDER,
    validateEmailField,
    validateNameField,
    validatePasswordField,
    validateRegisterClient,
} from '../validation/registerUserClient';

type RegisterSuccess = { id: number };
type ApiErrorBody = {
    message?: string;
    errors?: Record<string, string[]>;
};

function scrollToFirstFieldError(fieldErrors: Partial<Record<RegisterFieldKey, string>>): void {
    queueMicrotask(() => {
        for (const key of REGISTER_FIELD_ORDER) {
            if (!fieldErrors[key]) {
                continue;
            }
            const el = document.getElementById(`register-field-${key}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (el instanceof HTMLInputElement) {
                el.focus();
            }
            break;
        }
    });
}

export function RegisterPage(): JSX.Element {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
    /** 成功・通信エラーなど、フィールドに置けないメッセージのみ */
    const [bannerMessage, setBannerMessage] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<RegisterFieldKey, string>>>({});

    async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        setStatus('submitting');
        setBannerMessage(null);

        const client = validateRegisterClient({ name, email, password });
        if (!client.ok) {
            setFieldErrors(client.fieldErrors);
            setStatus('idle');
            scrollToFirstFieldError(client.fieldErrors);
            return;
        }

        const payload = {
            name: client.name,
            email: client.email,
            password: client.password,
        };

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = (await res.json()) as RegisterSuccess & ApiErrorBody;

            if (res.ok) {
                setBannerMessage(`登録成功: user id = ${data.id}`);
                setName('');
                setEmail('');
                setPassword('');
                setFieldErrors({});
                return;
            }

            if (res.status === 422) {
                const next: Partial<Record<RegisterFieldKey, string>> = {};
                if (data.errors) {
                    REGISTER_FIELD_ORDER.forEach((key) => {
                        const first = data.errors?.[key]?.[0];
                        if (first) {
                            next[key] = first;
                        }
                    });
                }
                if (Object.keys(next).length > 0) {
                    setFieldErrors(next);
                    scrollToFirstFieldError(next);
                } else if (data.message) {
                    setFieldErrors({ email: data.message });
                    scrollToFirstFieldError({ email: data.message });
                }
                return;
            }

            setBannerMessage('登録に失敗しました。');
        } catch {
            setBannerMessage('通信エラーが発生しました。');
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

            <form className="grid gap-3" onSubmit={onSubmit} noValidate>
                <div>
                    <input
                        id="register-field-name"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        name="name"
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => {
                            const v = e.target.value;
                            setName(v);
                            setFieldErrors((prev) => {
                                if (prev.name === undefined) {
                                    return prev;
                                }
                                const err = validateNameField(v);
                                const next = { ...prev };
                                if (err) {
                                    next.name = err;
                                } else {
                                    delete next.name;
                                }
                                return next;
                            });
                        }}
                        onBlur={(e) => {
                            const err = validateNameField(e.currentTarget.value);
                            setFieldErrors((prev) => {
                                const next = { ...prev };
                                if (err) {
                                    next.name = err;
                                } else {
                                    delete next.name;
                                }
                                return next;
                            });
                        }}
                        autoComplete="name"
                        aria-invalid={fieldErrors.name ? true : undefined}
                        aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                    />
                    {fieldErrors.name ? (
                        <p id="name-error" className="mt-1 text-sm text-red-700" role="alert">
                            {fieldErrors.name}
                        </p>
                    ) : null}
                </div>
                <div>
                    <input
                        id="register-field-email"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        name="email"
                        type="text"
                        inputMode="email"
                        autoCapitalize="none"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => {
                            const v = e.target.value;
                            setEmail(v);
                            setFieldErrors((prev) => {
                                if (prev.email === undefined) {
                                    return prev;
                                }
                                const err = validateEmailField(v);
                                const next = { ...prev };
                                if (err) {
                                    next.email = err;
                                } else {
                                    delete next.email;
                                }
                                return next;
                            });
                        }}
                        onBlur={(e) => {
                            const err = validateEmailField(e.currentTarget.value);
                            setFieldErrors((prev) => {
                                const next = { ...prev };
                                if (err) {
                                    next.email = err;
                                } else {
                                    delete next.email;
                                }
                                return next;
                            });
                        }}
                        autoComplete="email"
                        aria-invalid={fieldErrors.email ? true : undefined}
                        aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    />
                    {fieldErrors.email ? (
                        <p id="email-error" className="mt-1 text-sm text-red-700" role="alert">
                            {fieldErrors.email}
                        </p>
                    ) : null}
                </div>
                <div>
                    <input
                        id="register-field-password"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        name="password"
                        type="password"
                        placeholder="Password (8+ chars)"
                        value={password}
                        onChange={(e) => {
                            const v = e.target.value;
                            setPassword(v);
                            setFieldErrors((prev) => {
                                if (prev.password === undefined) {
                                    return prev;
                                }
                                const err = validatePasswordField(v);
                                const next = { ...prev };
                                if (err) {
                                    next.password = err;
                                } else {
                                    delete next.password;
                                }
                                return next;
                            });
                        }}
                        onBlur={(e) => {
                            const err = validatePasswordField(e.currentTarget.value);
                            setFieldErrors((prev) => {
                                const next = { ...prev };
                                if (err) {
                                    next.password = err;
                                } else {
                                    delete next.password;
                                }
                                return next;
                            });
                        }}
                        autoComplete="new-password"
                        aria-invalid={fieldErrors.password ? true : undefined}
                        aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    />
                    {fieldErrors.password ? (
                        <p id="password-error" className="mt-1 text-sm text-red-700" role="alert">
                            {fieldErrors.password}
                        </p>
                    ) : null}
                </div>
                <button
                    className="cursor-pointer rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-60"
                    type="submit"
                    formNoValidate
                    disabled={status === 'submitting'}
                >
                    登録する
                </button>
            </form>

            {bannerMessage ? (
                <div
                    className={
                        bannerMessage.startsWith('登録成功')
                            ? 'mt-4 text-green-700'
                            : 'mt-4 text-red-800'
                    }
                    aria-live="polite"
                >
                    {bannerMessage}
                </div>
            ) : null}
        </div>
    );
}
