# AI経営軍師 開発ガイド

## 開発環境でのログイン

### 管理者アカウント
```
メールアドレス: admin@hexamind.ai
パスワード: admin123
権限: Enterprise (全機能利用可能)
```

### テストユーザー作成
任意のメールアドレスで以下のパスワードを使用：
```
パスワード: demo123
権限: Free (デフォルト)
```

例：
- user1@example.com / demo123
- test@company.com / demo123

## 現在のデータベース構成

開発環境では「モックデータベース」を使用しています：
- データはメモリ内に保存（リロードで消える）
- 外部サービスへの依存なし
- 開発・デモに最適

## 本番環境への移行準備

### ステップ1: Firebase設定（お客様が見つかったら）

1. Firebase プロジェクトを作成
2. `.env.local` に以下を追加：
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_USE_FIRESTORE=true
```

3. Vercel環境変数に同じ値を設定

### ステップ2: データ移行

移行は自動的に行われます。`database-adapter.ts`が環境に応じて適切なデータベースを選択します。

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番モードでテスト
npm run start

# 型チェック
npm run type-check

# リント
npm run lint
```

## アーキテクチャ

```
src/lib/
├── database-adapter.ts    # DB選択ロジック
├── mock-database.ts      # 開発用モックDB
├── firebase.ts          # Firebase実装（将来用）
├── supabase.ts         # Supabase実装（オプション）
└── auth-system.ts      # 認証システム
```

## トラブルシューティング

### ログインできない場合
1. 正しいパスワードを使用しているか確認（admin123 または demo123）
2. ブラウザのCookieをクリア
3. `npm run dev` でサーバーを再起動

### データが消える場合
モックDBは一時的なものです。本番環境ではFirebaseまたはSupabaseを使用してください。

### 環境変数が反映されない場合
1. `.env.local` ファイルを確認
2. サーバーを再起動
3. `next.config.js` で環境変数の設定を確認

## セキュリティ注意事項

- 本番環境では必ず強力なパスワードを設定
- 環境変数は絶対にGitにコミットしない
- NextAuth SECRETは必ず設定する