<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>User Register</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 560px; margin: 40px auto; padding: 0 16px; }
        form { display: grid; gap: 12px; }
        input { padding: 10px; font-size: 14px; }
        button { padding: 10px; font-size: 14px; cursor: pointer; }
        .ok { color: #0a7a21; margin-top: 12px; }
        .err { color: #b00020; margin-top: 12px; }
        .muted { color: #666; font-size: 13px; }
    </style>
</head>
<body>
    <h1>ユーザー登録確認ページ</h1>
    <p class="muted">このページは <code>POST /api/users</code> を直接呼び出します。</p>

    <form id="register-form">
        <input id="name" name="name" type="text" placeholder="Name" required maxlength="255">
        <input id="email" name="email" type="email" placeholder="Email" required maxlength="255">
        <input id="password" name="password" type="password" placeholder="Password (8+ chars)" required minlength="8">
        <button type="submit">登録する</button>
    </form>

    <div id="result" aria-live="polite"></div>

    <script>
        const form = document.getElementById('register-form');
        const result = document.getElementById('result');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            result.textContent = '送信中...';
            result.className = '';

            const payload = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
            };

            try {
                const res = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();

                if (res.ok) {
                    result.className = 'ok';
                    result.textContent = `登録成功: user id = ${data.id}`;
                    form.reset();
                    return;
                }

                result.className = 'err';
                result.textContent = data.message ?? '登録に失敗しました。';
            } catch (err) {
                result.className = 'err';
                result.textContent = '通信エラーが発生しました。';
            }
        });
    </script>
</body>
</html>
