# デプロイテスト手順

## 本番環境URL
- **メインURL**: https://hexamind-ai.vercel.app
- **最新デプロイ**: https://hexamind-oxj14s4q0-shikis-projects-6e27447a.vercel.app

## テスト手順

### 1. ページアクセステスト
1. トップページにアクセス: https://hexamind-ai.vercel.app
2. デモページにアクセス: https://hexamind-ai.vercel.app/demo
3. サインインページにアクセス: https://hexamind-ai.vercel.app/auth/signin

### 2. ログインテスト

#### 管理者アカウント
```
URL: https://hexamind-ai.vercel.app/auth/signin
メールアドレス: admin@hexamind.ai
パスワード: admin123
期待結果: Enterprise権限でログイン成功、/dashboardにリダイレクト
```

#### 一般ユーザーアカウント（自動作成）
```
URL: https://hexamind-ai.vercel.app/auth/signin
メールアドレス: test@example.com
パスワード: demo123
期待結果: Free権限でログイン成功、/dashboardにリダイレクト、初回ログイン時にアカウント自動作成
```

### 3. 機能テスト

#### デモ機能
1. https://hexamind-ai.vercel.app/demo にアクセス
2. プリフィルされた質問が表示されることを確認
3. 「AI軍師に相談する」ボタンまたは「デモを見る」ボタンをクリック
4. 議論のアニメーションが正常に動作することを確認

#### ログイン後の機能
1. ログイン後、ダッシュボードにリダイレクトされることを確認
2. 新しい議論を開始できることを確認
3. 議論履歴が表示されることを確認（初回は空）

### 4. モックDBの動作確認

#### データの保存
1. ログイン後、議論を1回実行
2. ダッシュボードで利用統計が更新されることを確認
3. ページをリロードしてもデータが保持されていることを確認（同一セッション中）

#### データのリセット
1. ブラウザを完全に閉じて再度開く
2. 新しいブラウザセッションでは利用統計がリセットされることを確認

### 5. トラブルシューティング

#### ログインできない場合
- パスワードを確認（admin123 または demo123）
- ブラウザのCookieをクリア
- 別のブラウザで試す

#### ページが表示されない場合
- Vercelのデプロイ状況を確認
- https://hexamind-ai.vercel.app が最新のデプロイを指しているか確認

#### データが表示されない場合
- ブラウザのDevToolsでコンソールエラーをチェック
- 「Using Mock Database」のメッセージが表示されていることを確認

## 本番環境への移行準備

### Firebase設定（お客様が見つかったら）
1. Vercelの環境変数で以下を設定：
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_USE_FIRESTORE=true
```

2. firebase.ts.disabled を firebase.ts にリネーム
3. Firebase パッケージをインストール：
```bash
npm install firebase
```

### Google OAuth設定（オプション）
1. Google Cloud Console でOAuth設定
2. Vercelの環境変数で以下を設定：
```
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx
```

## 現在のステータス

✅ **完了**
- モックデータベースでの運用
- ログイン機能（メール/パスワード）
- デモ機能
- 基本的な議論機能
- Vercelへのデプロイ

⏳ **準備済み（必要時に有効化）**
- Firebase/Firestore連携
- Google OAuth
- Stripe決済連携
- 本格的なユーザー管理

## サポート連絡先
- 技術的な問題：開発者まで連絡
- 本番環境設定：環境変数設定後に再テスト要