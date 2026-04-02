const FLASH_KEY = 'userSettingsFlashMessage';

/**
 * フラッシュを画面上に出すルートの pathname。
 * この一覧に載っている画面「から」別の pathname へ遷移したときだけストレージを捨てる（画面が増えても App 側に if は増やさない）。
 */
export const USER_SETTINGS_FLASH_HOST_PATHNAMES: readonly string[] = ['/settings/users'];

export function isUserSettingsFlashHostPathname(pathname: string): boolean {
    return USER_SETTINGS_FLASH_HOST_PATHNAMES.includes(pathname);
}

export function setUserSettingsFlashMessage(message: string): void {
    sessionStorage.setItem(FLASH_KEY, message);
}

/** 表示用（閉じるまでストレージには残す） */
export function peekUserSettingsFlashMessage(): string | null {
    return sessionStorage.getItem(FLASH_KEY);
}

export function clearUserSettingsFlashMessage(): void {
    sessionStorage.removeItem(FLASH_KEY);
}
