import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';

function navClassName({ isActive }: { isActive: boolean }): string {
    return [
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100',
    ].join(' ');
}

export function App(): JSX.Element {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-[#FDFDFC] antialiased">
                <header className="border-b border-gray-200 bg-white">
                    <nav className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3">
                        <NavLink to="/" end className={navClassName}>
                            ホーム
                        </NavLink>
                        <NavLink to="/register" className={navClassName}>
                            ユーザー登録
                        </NavLink>
                    </nav>
                </header>
                <main>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}
