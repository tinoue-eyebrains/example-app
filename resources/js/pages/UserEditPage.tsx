import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { setUserSettingsFlashMessage } from '../userSettingsFlash';
import {
    type RegisterFieldKey,
    REGISTER_FIELD_ORDER,
    validateEmailField,
    validateNameField,
    validatePasswordField,
} from '../validation/registerUserClient';

type ApiUser = { id: number; name: string; email: string };
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
            const el = document.getElementById(`edit-field-${key}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (el instanceof HTMLInputElement) {
                el.focus();
            }
            break;
        }
    });
}

export function UserEditPage(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const userId = id !== undefined ? Number.parseInt(id, 10) : NaN;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting'>('idle');
    const [bannerMessage, setBannerMessage] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<RegisterFieldKey, string>>>({});

    useEffect(() => {
        if (!Number.isFinite(userId) || userId < 1) {
            setLoadState('error');
            return;
        }

        let cancelled = false;
        void (async (): Promise<void> => {
            try {
                const res = await fetch(`/api/users/${userId}`, { headers: { Accept: 'application/json' } });
                if (cancelled) {
                    return;
                }
                if (res.status === 404) {
                    setLoadState('error');
                    return;
                }
                if (!res.ok) {
                    setLoadState('error');
                    return;
                }
                const data = (await res.json()) as ApiUser;
                setName(data.name);
                setEmail(data.email);
                setLoadState('ready');
            } catch {
                if (!cancelled) {
                    setLoadState('error');
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    async function onSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();
        if (!Number.isFinite(userId) || userId < 1) {
            return;
        }

        setSubmitStatus('submitting');
        setBannerMessage(null);

        const nextErrors: Partial<Record<RegisterFieldKey, string>> = {};
        const ne = validateNameField(name);
        if (ne) {
            nextErrors.name = ne;
        }
        const ee = validateEmailField(email);
        if (ee) {
            nextErrors.email = ee;
        }
        if (password !== '') {
            const pe = validatePasswordField(password);
            if (pe) {
                nextErrors.password = pe;
            }
        }

        if (Object.keys(nextErrors).length > 0) {
            setFieldErrors(nextErrors);
            setSubmitStatus('idle');
            scrollToFirstFieldError(nextErrors);
            return;
        }

        const body: { name: string; email: string; password?: string } = {
            name: name.trim(),
            email: email.trim(),
        };
        if (password !== '') {
            body.password = password;
        }

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(body),
            });

            if (res.status === 204) {
                setUserSettingsFlashMessage('ユーザー情報を更新しました。');
                navigate('/settings/users');
                return;
            }

            const data = (await res.json()) as ApiErrorBody;

            if (res.status === 422) {
                const fe: Partial<Record<RegisterFieldKey, string>> = {};
                if (data.errors) {
                    REGISTER_FIELD_ORDER.forEach((key) => {
                        const first = data.errors?.[key]?.[0];
                        if (first) {
                            fe[key] = first;
                        }
                    });
                }
                if (Object.keys(fe).length > 0) {
                    setFieldErrors(fe);
                    scrollToFirstFieldError(fe);
                } else if (data.message) {
                    setBannerMessage(data.message);
                }
                return;
            }

            if (res.status === 404) {
                setBannerMessage(data.message ?? 'ユーザーが見つかりません。');
                return;
            }

            setBannerMessage('更新に失敗しました。');
        } catch {
            setBannerMessage('通信エラーが発生しました。');
        } finally {
            setSubmitStatus('idle');
        }
    }

    if (loadState === 'loading') {
        return (
            <div className="mx-auto max-w-lg px-4 py-10 font-sans text-center text-gray-600">読み込み中…</div>
        );
    }

    if (loadState === 'error') {
        return (
            <div className="mx-auto max-w-lg px-4 py-10 font-sans">
                <p className="mb-4 text-red-800">ユーザーを読み込めませんでした。</p>
                <Link className="text-sm font-medium text-gray-900 underline" to="/settings/users">
                    一覧に戻る
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-lg px-4 py-10 font-sans">
            <div className="mb-6">
                <Link className="text-sm text-gray-600 hover:text-gray-900" to="/settings/users">
                    ← ユーザー一覧
                </Link>
            </div>
            <h1 className="mb-6 text-2xl font-semibold text-gray-900">ユーザー編集</h1>

            <form className="grid gap-3" onSubmit={onSubmit} noValidate>
                <div>
                    <input
                        id="edit-field-name"
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
                    />
                    {fieldErrors.name ? (
                        <p className="mt-1 text-sm text-red-700" role="alert">
                            {fieldErrors.name}
                        </p>
                    ) : null}
                </div>
                <div>
                    <input
                        id="edit-field-email"
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
                    />
                    {fieldErrors.email ? (
                        <p className="mt-1 text-sm text-red-700" role="alert">
                            {fieldErrors.email}
                        </p>
                    ) : null}
                </div>
                <div>
                    <input
                        id="edit-field-password"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        name="password"
                        type="password"
                        placeholder="パスワード（変更しない場合は空のまま）"
                        value={password}
                        onChange={(e) => {
                            const v = e.target.value;
                            setPassword(v);
                            setFieldErrors((prev) => {
                                if (prev.password === undefined || v === '') {
                                    const next = { ...prev };
                                    delete next.password;
                                    return next;
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
                            const v = e.currentTarget.value;
                            if (v === '') {
                                setFieldErrors((prev) => {
                                    const next = { ...prev };
                                    delete next.password;
                                    return next;
                                });
                                return;
                            }
                            const err = validatePasswordField(v);
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
                    />
                    {fieldErrors.password ? (
                        <p className="mt-1 text-sm text-red-700" role="alert">
                            {fieldErrors.password}
                        </p>
                    ) : null}
                </div>
                <button
                    className="cursor-pointer rounded-md bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-60"
                    type="submit"
                    formNoValidate
                    disabled={submitStatus === 'submitting'}
                >
                    保存する
                </button>
            </form>

            {bannerMessage ? (
                <div className="mt-4 text-red-800" aria-live="polite">
                    {bannerMessage}
                </div>
            ) : null}
        </div>
    );
}
