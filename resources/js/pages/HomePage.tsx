import { Link } from 'react-router-dom';

export function HomePage(): JSX.Element {
    return (
        <div className="mx-auto max-w-2xl px-4 py-12 font-sans">
            <h1 className="mb-3 text-2xl font-semibold text-gray-900">example-app</h1>
            <p className="mb-6 text-gray-600">
                フロントは React Router です。API は Laravel（<code className="rounded bg-gray-100 px-1">POST /api/users</code>
                ）のままです。
            </p>
            <Link
                className="inline-flex rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                to="/register"
            >
                登録ページへ
            </Link>
        </div>
    );
}
