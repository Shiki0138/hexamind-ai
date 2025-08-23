// ブラウザ自動化システム for プレミアムサブスクリプション統合

import puppeteer, { Browser, Page } from 'puppeteer';

export interface BrowserSession {
  browser: Browser;
  page: Page;
  isLoggedIn: boolean;
  lastActivity: Date;
}

export class BrowserAutomationManager {
  private sessions: Map<string, BrowserSession> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30分

  constructor() {
    // セッションクリーンアップ
    setInterval(this.cleanupSessions.bind(this), 5 * 60 * 1000); // 5分毎
  }

  /**
   * Claude Pro セッションを初期化
   */
  async initializeClaudeProSession(): Promise<BrowserSession> {
    try {
      const browser = await puppeteer.launch({
        headless: false, // デバッグ用。本番では true
        defaultViewport: { width: 1280, height: 720 },
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });

      const page = await browser.newPage();
      
      // Claude.aiに移動
      await page.goto('https://claude.ai', { waitUntil: 'networkidle2' });

      const session: BrowserSession = {
        browser,
        page,
        isLoggedIn: false,
        lastActivity: new Date()
      };

      // ログイン状態確認
      try {
        // ログイン済みかチェック（チャット画面の存在で判定）
        await page.waitForSelector('[data-testid="chat-input"], .login-button', { timeout: 5000 });
        const chatInput = await page.$('[data-testid="chat-input"]');
        
        if (chatInput) {
          session.isLoggedIn = true;
          console.log('Claude Pro: Already logged in');
        } else {
          console.log('Claude Pro: Need to login manually');
          // ユーザーにマニュアルログインを促すメッセージ表示
        }
      } catch (error) {
        console.log('Claude Pro: Login status unclear, assuming need to login');
      }

      this.sessions.set('claude-pro', session);
      return session;

    } catch (error) {
      console.error('Failed to initialize Claude Pro session:', error);
      throw new Error(`Claude Pro initialization failed: ${error.message}`);
    }
  }

  /**
   * ChatGPT Plus セッションを初期化
   */
  async initializeChatGPTSession(): Promise<BrowserSession> {
    try {
      const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1280, height: 720 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      await page.goto('https://chat.openai.com', { waitUntil: 'networkidle2' });

      const session: BrowserSession = {
        browser,
        page,
        isLoggedIn: false,
        lastActivity: new Date()
      };

      // ログイン状態確認
      try {
        await page.waitForSelector('#prompt-textarea, [data-testid="login-button"]', { timeout: 5000 });
        const promptTextarea = await page.$('#prompt-textarea');
        
        if (promptTextarea) {
          session.isLoggedIn = true;
          console.log('ChatGPT Plus: Already logged in');
        } else {
          console.log('ChatGPT Plus: Need to login manually');
        }
      } catch (error) {
        console.log('ChatGPT Plus: Login status unclear');
      }

      this.sessions.set('chatgpt-plus', session);
      return session;

    } catch (error) {
      console.error('Failed to initialize ChatGPT session:', error);
      throw new Error(`ChatGPT Plus initialization failed: ${error.message}`);
    }
  }

  /**
   * Claude Proでメッセージを送信して応答を取得
   */
  async sendClaudeProMessage(message: string): Promise<string> {
    const session = this.sessions.get('claude-pro');
    if (!session || !session.isLoggedIn) {
      throw new Error('Claude Pro session not available or not logged in');
    }

    try {
      const { page } = session;

      // チャット入力欄を探す
      const chatInput = await page.$('[data-testid="chat-input"], textarea[placeholder*="Message"], div[contenteditable="true"]');
      if (!chatInput) {
        throw new Error('Chat input not found');
      }

      // メッセージを入力
      await chatInput.click();
      await page.keyboard.selectAll();
      await page.keyboard.type(message);

      // 送信ボタンをクリック（エンターキーまたは送信ボタン）
      await page.keyboard.press('Enter');

      // 応答を待つ
      await this.waitForClaudeResponse(page);

      // 最新の応答を取得
      const response = await this.getLatestClaudeResponse(page);
      
      session.lastActivity = new Date();
      return response;

    } catch (error) {
      console.error('Claude Pro message failed:', error);
      throw new Error(`Claude Pro communication failed: ${error.message}`);
    }
  }

  /**
   * ChatGPT Plusでメッセージを送信して応答を取得
   */
  async sendChatGPTMessage(message: string): Promise<string> {
    const session = this.sessions.get('chatgpt-plus');
    if (!session || !session.isLoggedIn) {
      throw new Error('ChatGPT Plus session not available or not logged in');
    }

    try {
      const { page } = session;

      // プロンプト入力欄にメッセージを入力
      const promptTextarea = await page.$('#prompt-textarea');
      if (!promptTextarea) {
        throw new Error('Prompt textarea not found');
      }

      await promptTextarea.click();
      await page.keyboard.selectAll();
      await page.keyboard.type(message);

      // 送信ボタンをクリック
      const sendButton = await page.$('[data-testid="send-button"], button[aria-label="Send prompt"]');
      if (sendButton) {
        await sendButton.click();
      } else {
        await page.keyboard.press('Enter');
      }

      // 応答完了を待つ
      await this.waitForChatGPTResponse(page);

      // 最新の応答を取得
      const response = await this.getLatestChatGPTResponse(page);
      
      session.lastActivity = new Date();
      return response;

    } catch (error) {
      console.error('ChatGPT Plus message failed:', error);
      throw new Error(`ChatGPT Plus communication failed: ${error.message}`);
    }
  }

  /**
   * Claude Proの応答完了を待つ
   */
  private async waitForClaudeResponse(page: Page): Promise<void> {
    try {
      // ローディング状態の終了を待つ
      await page.waitForFunction(() => {
        const loadingElements = document.querySelectorAll('[data-testid="loading"], .loading, .thinking');
        return loadingElements.length === 0;
      }, { timeout: 60000 });

      // 少し待ってからレスポンスが完成したかチェック
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.warn('Claude response wait timeout:', error);
    }
  }

  /**
   * ChatGPT Plusの応答完了を待つ
   */
  private async waitForChatGPTResponse(page: Page): Promise<void> {
    try {
      // Stop generating ボタンが消えるまで待つ（応答完了の指標）
      await page.waitForFunction(() => {
        const stopButton = document.querySelector('[data-testid="stop-button"]');
        return !stopButton;
      }, { timeout: 60000 });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.warn('ChatGPT response wait timeout:', error);
    }
  }

  /**
   * Claude Proの最新応答を取得
   */
  private async getLatestClaudeResponse(page: Page): Promise<string> {
    try {
      // Claude の応答メッセージを取得
      const messages = await page.$$eval('[data-testid="message"], .message, div[role="presentation"]', (elements) => {
        return elements
          .filter(el => el.textContent && el.textContent.trim().length > 10)
          .map(el => el.textContent?.trim())
          .filter(text => text && !text.includes('Claude') && !text.includes('User'));
      });

      const latestResponse = messages[messages.length - 1];
      return latestResponse || 'Claude Proからの応答を取得できませんでした';

    } catch (error) {
      console.error('Failed to get Claude response:', error);
      return 'Claude Pro応答の取得に失敗しました';
    }
  }

  /**
   * ChatGPT Plusの最新応答を取得
   */
  private async getLatestChatGPTResponse(page: Page): Promise<string> {
    try {
      // ChatGPTの応答メッセージを取得
      const messages = await page.$$eval('[data-message-author-role="assistant"], .markdown', (elements) => {
        return elements
          .map(el => el.textContent?.trim())
          .filter(text => text && text.length > 10);
      });

      const latestResponse = messages[messages.length - 1];
      return latestResponse || 'ChatGPT Plusからの応答を取得できませんでした';

    } catch (error) {
      console.error('Failed to get ChatGPT response:', error);
      return 'ChatGPT Plus応答の取得に失敗しました';
    }
  }

  /**
   * セッションのクリーンアップ
   */
  private async cleanupSessions(): Promise<void> {
    const now = new Date();
    
    for (const [key, session] of this.sessions.entries()) {
      const timeDiff = now.getTime() - session.lastActivity.getTime();
      
      if (timeDiff > this.SESSION_TIMEOUT) {
        console.log(`Cleaning up inactive session: ${key}`);
        
        try {
          await session.browser.close();
        } catch (error) {
          console.error(`Error closing session ${key}:`, error);
        }
        
        this.sessions.delete(key);
      }
    }
  }

  /**
   * 全セッションを閉じる
   */
  async closeAllSessions(): Promise<void> {
    for (const [key, session] of this.sessions.entries()) {
      try {
        await session.browser.close();
        console.log(`Closed session: ${key}`);
      } catch (error) {
        console.error(`Error closing session ${key}:`, error);
      }
    }
    
    this.sessions.clear();
  }

  /**
   * セッション状態を取得
   */
  getSessionStatus(): { service: string; active: boolean; loggedIn: boolean; lastActivity: Date }[] {
    return Array.from(this.sessions.entries()).map(([service, session]) => ({
      service,
      active: true,
      loggedIn: session.isLoggedIn,
      lastActivity: session.lastActivity
    }));
  }
}