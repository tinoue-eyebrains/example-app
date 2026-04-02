import { useEffect, useRef } from 'react';
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { UserEditPage } from './pages/UserEditPage';
import { UserSettingsPage } from './pages/UserSettingsPage';
import {
    clearUserSettingsFlashMessage,
    isUserSettingsFlashHostPathname,
} from './userSettingsFlash';

/** フラッシュ表示画面から離れた遷移だけストレージを捨てる（ホスト一覧は userSettingsFlash の定数） */
function ClearFlashStorageWhenLeavingFlashHost(): null {
    const { pathname } = useLocation();
    const prevPathnameRef = useRef<string | null>(null);

    useEffect(() => {
        const prev = prevPathnameRef.current;
        prevPathnameRef.current = pathname;

        if (prev === null) {
            return;
        }
        if (isUserSettingsFlashHostPathname(prev) && !isUserSettingsFlashHostPathname(pathname)) {
            clearUserSettingsFlashMessage();
        }
    }, [pathname]);

    return null;
}

function navClassName({ isActive }: { isActive: boolean }): string {
    return [
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100',
    ].join(' ');
}

export function App(): JSX.Element {
    return (
        <BrowserRouter>
            <ClearFlashStorageWhenLeavingFlashHost />
            <div className="min-h-screen bg-[#FDFDFC] antialiased">
                <header className="border-b border-gray-200 bg-white">
                    <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
                        <NavLink to="/" end className={navClassName}>
                            ホーム
                        </NavLink>
                        <NavLink to="/settings/users" className={navClassName}>
                            ユーザー設定
                        </NavLink>
                        <NavLink to="/settings/users/register" className={navClassName}>
                            ユーザー登録
                        </NavLink>
                    </nav>
                </header>
                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/register" element={<Navigate to="/settings/users/register" replace />} />
                        <Route path="/settings/users/register" element={<RegisterPage />} />
                        <Route path="/settings/users/:id/edit" element={<UserEditPage />} />
                        <Route path="/settings/users" element={<UserSettingsPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}
