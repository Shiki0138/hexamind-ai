// チャット履歴管理システム

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'agent';
  agentId?: string;
  content: string;
  timestamp: Date;
  metadata?: {
    thinkingMode?: string;
    discussionMode?: string;
    round?: number;
  };
}

export interface DiscussionSession {
  id: string;
  topic: string;
  agents: string[];
  messages: ChatMessage[];
  startedAt: Date;
  endedAt?: Date;
  summary?: string;
  decisions?: string[];
  actionItems?: string[];
  thinkingMode: string;
  discussionMode: string;
  isPremium: boolean;
}

export class ChatHistoryManager {
  private readonly STORAGE_KEY = 'hexamind_chat_history';
  private readonly MAX_SESSIONS = 100;

  // ローカルストレージから履歴を読み込み
  getSessions(): DiscussionSession[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      // Date型の復元
      return sessions.map((session: any) => ({
        ...session,
        startedAt: new Date(session.startedAt),
        endedAt: session.endedAt ? new Date(session.endedAt) : undefined,
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Failed to load chat history:', error);
      return [];
    }
  }

  // 新しいセッションを作成
  createSession(
    topic: string,
    agents: string[],
    thinkingMode: string,
    discussionMode: string,
    isPremium: boolean
  ): DiscussionSession {
    const session: DiscussionSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      topic,
      agents,
      messages: [],
      startedAt: new Date(),
      thinkingMode,
      discussionMode,
      isPremium
    };

    this.saveSession(session);
    return session;
  }

  // セッションを保存
  saveSession(session: DiscussionSession): void {
    if (typeof window === 'undefined') return;

    try {
      const sessions = this.getSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.unshift(session); // 新しいセッションを先頭に追加
      }

      // 最大数を超えたら古いものを削除
      while (sessions.length > this.MAX_SESSIONS) {
        sessions.pop();
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }

  // メッセージを追加
  addMessage(
    sessionId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): void {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === sessionId);
    
    if (session) {
      const newMessage: ChatMessage = {
        ...message,
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };
      
      session.messages.push(newMessage);
      this.saveSession(session);
    }
  }

  // セッションを終了
  endSession(
    sessionId: string,
    summary?: string,
    decisions?: string[],
    actionItems?: string[]
  ): void {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === sessionId);
    
    if (session) {
      session.endedAt = new Date();
      session.summary = summary;
      session.decisions = decisions;
      session.actionItems = actionItems;
      this.saveSession(session);
    }
  }

  // セッションを取得
  getSession(sessionId: string): DiscussionSession | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === sessionId) || null;
  }

  // セッションを削除
  deleteSession(sessionId: string): void {
    const sessions = this.getSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    }
  }

  // 全履歴をクリア
  clearAllSessions(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // セッションをエクスポート（JSON形式）
  exportSessions(): string {
    const sessions = this.getSessions();
    return JSON.stringify(sessions, null, 2);
  }

  // セッションをインポート
  importSessions(jsonData: string): boolean {
    try {
      const sessions = JSON.parse(jsonData);
      if (Array.isArray(sessions)) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import sessions:', error);
      return false;
    }
  }
}

// シングルトンインスタンス
export const chatHistory = new ChatHistoryManager();