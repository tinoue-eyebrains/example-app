import { Link } from 'react-router-dom';

export function HomePage(): JSX.Element {
    return (
        <div className="mx-auto max-w-2xl px-4 py-12 font-sans">
            <h1 className="mb-3 text-2xl font-semibold text-gray-900">example-app</h1>
            <Link
                className="inline-flex rounded-full bg-[#1e3a5f] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#2a4a75]"
                to="/settings/users"
            >
                ユーザー管理（一覧）
            </Link>
        </div>
    );
}
