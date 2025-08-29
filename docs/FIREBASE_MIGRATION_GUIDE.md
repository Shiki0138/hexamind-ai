# Supabase から Google Cloud Firestore への移行ガイド

## 概要
このガイドでは、AI経営軍師のデータベースをSupabaseからGoogle Cloud Firestoreに移行する手順を説明します。

## 1. Google Cloud プロジェクトの設定

### 1.1 Firebase プロジェクトの作成
1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを作成」をクリック
3. プロジェクト名：「hexamind-ai」または任意の名前
4. Google アナリティクスの設定（オプション）
5. プロジェクトの作成完了を待つ

### 1.2 Firestore データベースの有効化
1. Firebase Console の左メニューから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. セキュリティルール：「本番環境モード」を選択
4. ロケーション：「asia-northeast1」（東京）を選択
5. 「有効にする」をクリック

### 1.3 Authentication の設定
1. Firebase Console の左メニューから「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブで以下を有効化：
   - メール/パスワード
   - Google

### 1.4 Firebase 設定の取得
1. プロジェクト設定（歯車アイコン）→「プロジェクトの設定」
2. 「マイアプリ」セクションで「ウェブアプリを追加」
3. アプリ名：「AI経営軍師 Web」
4. Firebase SDK の設定をコピー

## 2. 環境変数の設定

### 2.1 ローカル開発環境（.env.local）
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Remove or comment out Supabase variables
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### 2.2 Vercel 環境変数
1. Vercelダッシュボードにログイン
2. プロジェクト設定 → Environment Variables
3. 上記のFirebase環境変数を追加
4. Supabase関連の環境変数を削除または空にする

## 3. コードの変更

### 3.1 DatabaseService の切り替え
`src/lib/database-adapter.ts` を作成：

```typescript
// データベースアダプター：SupabaseとFirestoreを切り替え可能にする
import { DatabaseService as SupabaseService } from './supabase';
import { FirestoreService } from './firebase';

// 環境変数でどちらを使うか判断
const useFirestore = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                    process.env.NEXT_PUBLIC_USE_FIRESTORE === 'true';

export const DatabaseService = useFirestore ? FirestoreService : SupabaseService;
```

### 3.2 既存コードの更新
すべての `import { DatabaseService } from '@/lib/supabase'` を以下に変更：
```typescript
import { DatabaseService } from '@/lib/database-adapter';
```

### 3.3 NextAuth の Firebase 対応
`src/lib/auth-system.ts` の認証部分を更新：

```typescript
import { signInUser } from '@/lib/firebase';

// CredentialsProvider の authorize 関数内
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  try {
    // Firebase Authentication を使用
    const userCredential = await signInUser(
      credentials.email, 
      credentials.password
    );
    
    const user = userCredential.user;
    
    return {
      id: user.uid,
      email: user.email,
      name: user.displayName || user.email
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}
```

## 4. Firestore セキュリティルール

`firestore.rules` ファイルを作成：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみアクセス可能
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // サブスクリプションは本人のみ
    match /subscriptions/{document=**} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow write: if false; // Stripe Webhook のみ書き込み可能
    }
    
    // 利用統計は本人のみ
    match /usage_stats/{document=**} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
    }
    
    // ディスカッションは本人のみ
    match /discussions/{document=**} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.user_id;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
  }
}
```

## 5. データ移行（既存データがある場合）

### 5.1 Supabase からデータをエクスポート
```sql
-- Supabase SQL Editor で実行
SELECT * FROM users;
SELECT * FROM subscriptions;
SELECT * FROM usage_stats;
SELECT * FROM discussions;
```

### 5.2 Firestore へインポート
移行スクリプト `scripts/migrate-to-firestore.js`：

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateData() {
  // Supabase からエクスポートしたデータ
  const users = require('./supabase-export/users.json');
  
  // バッチ処理でインポート
  const batch = db.batch();
  
  users.forEach(user => {
    const docRef = db.collection('users').doc(user.id);
    batch.set(docRef, {
      ...user,
      created_at: admin.firestore.Timestamp.fromDate(new Date(user.created_at)),
      updated_at: admin.firestore.Timestamp.fromDate(new Date(user.updated_at))
    });
  });
  
  await batch.commit();
  console.log('Migration completed!');
}

migrateData();
```

## 6. 料金見積もり

### Firestore 料金（東京リージョン）
- **無料枠**：
  - 読み取り：50,000回/日
  - 書き込み：20,000回/日
  - 削除：20,000回/日
  - ストレージ：1GB

- **従量課金**（無料枠超過分）：
  - 読み取り：$0.038/10万回
  - 書き込み：$0.113/10万回
  - 削除：$0.013/10万回
  - ストレージ：$0.108/GB/月

### 月間コスト例（アクティブユーザー1,000人の場合）
- 読み取り：300万回 × $0.038 = $1.14（約170円）
- 書き込み：100万回 × $0.113 = $1.13（約170円）
- ストレージ：5GB × $0.108 = $0.54（約80円）
- **合計：約420円/月**

## 7. メリット・デメリット

### メリット
- ✅ 大規模な無料枠
- ✅ Google Cloud の他サービスとの統合が容易
- ✅ 自動スケーリング
- ✅ リアルタイム同期機能
- ✅ 強力なセキュリティルール
- ✅ Firebase Authentication との統合

### デメリット
- ❌ SQL クエリが使えない（NoSQL）
- ❌ 複雑な集計処理は追加実装が必要
- ❌ トランザクション処理に制限あり

## 8. 移行後のテスト

1. **認証機能**：
   - メール/パスワードでのサインアップ・サインイン
   - Google OAuth でのサインイン

2. **データ操作**：
   - ユーザー情報の作成・更新
   - ディスカッションの保存・取得
   - 利用統計の記録

3. **リアルタイム機能**：
   - ユーザー情報の変更通知
   - 利用統計の更新通知

## 9. トラブルシューティング

### CORS エラーが発生する場合
Firebase Console → Authentication → Settings → Authorized domains に本番ドメインを追加

### 権限エラーが発生する場合
Firestore セキュリティルールを確認し、適切な権限を設定

### パフォーマンスが遅い場合
- 複合インデックスを作成
- データ構造を非正規化して読み取り回数を削減

## サポート

移行に関する質問は以下までお問い合わせください：
- Email: support@hexamind.ai
- ドキュメント：[Firebase 公式ドキュメント](https://firebase.google.com/docs)