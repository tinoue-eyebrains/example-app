/**
 * 補助用のクライアント検証（RegisterUserRequest と揃えた文言）。
 * 正規の判定は常にサーバー側。
 */

export type RegisterFieldKey = 'name' | 'email' | 'password';

/** UI / スクロール順。サーバー側ルールの列挙順と揃える */
export const REGISTER_FIELD_ORDER: readonly RegisterFieldKey[] = ['name', 'email', 'password'];

/** RegisterUserRequest の string 系 max と一致 */
const MAX_STRING_LEN = 255;

const PASSWORD_MIN_LEN = 8;

const MSG = {
    nameRequired: '名前を入力してください。',
    nameMax: `名前は${MAX_STRING_LEN}文字以内で入力してください。`,
    emailRequired: 'メールアドレスを入力してください。',
    emailFormat: '有効なメールアドレス形式で入力してください。',
    emailMax: `メールアドレスは${MAX_STRING_LEN}文字以内で入力してください。`,
    passwordRequired: 'パスワードを入力してください。',
    passwordMin: `パスワードは${PASSWORD_MIN_LEN}文字以上で入力してください。`,
    passwordMax: `パスワードは${MAX_STRING_LEN}文字以内で入力してください。`,
} as const;

/** Laravel `email` より粗いが、補助として十分な簡易チェック */
function looksLikeEmail(value: string): boolean {
    if (value.length > MAX_STRING_LEN) {
        return false;
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validateNameField(raw: string): string | undefined {
    const name = raw.trim();
    if (name === '') {
        return MSG.nameRequired;
    }
    if (name.length > MAX_STRING_LEN) {
        return MSG.nameMax;
    }
    return undefined;
}

export function validateEmailField(raw: string): string | undefined {
    const email = raw.trim();
    if (email === '') {
        return MSG.emailRequired;
    }
    if (email.length > MAX_STRING_LEN) {
        return MSG.emailMax;
    }
    if (!looksLikeEmail(email)) {
        return MSG.emailFormat;
    }
    return undefined;
}

export function validatePasswordField(password: string): string | undefined {
    if (password === '') {
        return MSG.passwordRequired;
    }
    if (password.length < PASSWORD_MIN_LEN) {
        return MSG.passwordMin;
    }
    if (password.length > MAX_STRING_LEN) {
        return MSG.passwordMax;
    }
    return undefined;
}

export type RegisterClientOk = {
    ok: true;
    name: string;
    email: string;
    password: string;
};

export type RegisterClientErr = {
    ok: false;
    fieldErrors: Partial<Record<RegisterFieldKey, string>>;
};

const fieldValidators: Record<
    RegisterFieldKey,
    (input: { name: string; email: string; password: string }) => string | undefined
> = {
    name: (input) => validateNameField(input.name),
    email: (input) => validateEmailField(input.email),
    password: (input) => validatePasswordField(input.password),
};

function collectFieldErrors(input: {
    name: string;
    email: string;
    password: string;
}): Partial<Record<RegisterFieldKey, string>> {
    const fieldErrors: Partial<Record<RegisterFieldKey, string>> = {};
    for (const key of REGISTER_FIELD_ORDER) {
        const err = fieldValidators[key](input);
        if (err) {
            fieldErrors[key] = err;
        }
    }
    return fieldErrors;
}

export function validateRegisterClient(input: {
    name: string;
    email: string;
    password: string;
}): RegisterClientOk | RegisterClientErr {
    const fieldErrors = collectFieldErrors(input);
    if (Object.keys(fieldErrors).length > 0) {
        return { ok: false, fieldErrors };
    }

    return {
        ok: true,
        name: input.name.trim(),
        email: input.email.trim(),
        password: input.password,
    };
}
