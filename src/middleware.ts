import { withAuth } from 'next-auth/middleware';

export default withAuth(
  // `withAuth` は req.nextauth.token をtoken パラメータとして `authorized` コールバックを呼び出します
  function middleware(req) {
    // 認証されているユーザーのみがアクセス可能
    // 追加の認可ロジックはここに実装
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

// ミドルウェアが適用される パス
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*'
  ]
};