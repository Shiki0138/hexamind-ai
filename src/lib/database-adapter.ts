/**
 * データベースアダプター
 * 開発/本番環境に応じて適切なデータベースサービスを選択
 * 
 * 現在の優先順位：
 * 1. モックDB（開発・デモ用）
 * 2. Firebase/Firestore（将来の本番用・準備済み）
 * 3. Supabase（設定されている場合）
 */

import { DatabaseService as SupabaseService, supabase } from './supabase';
import { MockDatabaseService } from './mock-database';

// どのデータベースを使用するか判定
const getDatabaseService = () => {
  // 1. 開発環境または本番環境でSupabase/Firebaseが未設定の場合はモックDBを使用
  const isSupabaseConfigured = supabase !== null;
  const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                               process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your-api-key';

  if (!isSupabaseConfigured && !isFirebaseConfigured) {
    console.log('Using Mock Database (No database configured)');
    return MockDatabaseService;
  }

  // 2. Firebaseが設定されている場合（将来の実装用）
  if (isFirebaseConfigured && process.env.NEXT_PUBLIC_USE_FIRESTORE === 'true') {
    console.log('Firebase configured but not implemented yet, using MockDatabase');
    // TODO: Firebaseパッケージをインストール後に有効化
    // const { FirestoreService } = await import('./firebase');
    // return FirestoreService;
    return MockDatabaseService;
  }

  // 3. Supabaseが設定されている場合
  if (isSupabaseConfigured) {
    console.log('Using Supabase');
    return SupabaseService;
  }

  // デフォルトはモックDB
  console.log('Using Mock Database (Default)');
  return MockDatabaseService;
};

// エクスポート
export const DatabaseService = getDatabaseService();