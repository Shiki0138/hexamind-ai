// Google Apps Script - お問い合わせフォームのメール送信
// このコードをGoogle Apps Scriptにコピーして使用してください

function doPost(e) {
  try {
    // POSTデータを解析
    const data = JSON.parse(e.postData.contents);
    
    // メール本文を作成
    const emailBody = `
新しいお問い合わせがありました。

━━━━━━━━━━━━━━━━━━━━━━━━
【お客様情報】
━━━━━━━━━━━━━━━━━━━━━━━━

お名前: ${data.name}
会社名: ${data.company || '記載なし'}
メールアドレス: ${data.email}
電話番号: ${data.phone || '記載なし'}
検討中のプラン: ${data.plans && data.plans.length > 0 ? data.plans.join(', ') : '記載なし'}

━━━━━━━━━━━━━━━━━━━━━━━━
【お問い合わせ内容】
━━━━━━━━━━━━━━━━━━━━━━━━

${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━
送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
━━━━━━━━━━━━━━━━━━━━━━━━

このメールはAI経営軍師のお問い合わせフォームから自動送信されました。
`;

    // メールを送信
    MailApp.sendEmail({
      to: 'leadfive.138@gmail.com', // 受信先メールアドレス
      subject: `【AI経営軍師】新規お問い合わせ - ${data.name}様`,
      body: emailBody,
      replyTo: data.email // 返信先を問い合わせ者のメールに設定
    });
    
    // お客様への自動返信メール
    const autoReplyBody = `
${data.name} 様

この度は、AI経営軍師へお問い合わせいただき、誠にありがとうございます。
以下の内容でお問い合わせを受け付けました。

━━━━━━━━━━━━━━━━━━━━━━━━
【お問い合わせ内容】
━━━━━━━━━━━━━━━━━━━━━━━━

${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━

担当者より2営業日以内にご連絡させていただきます。
今しばらくお待ちください。

なお、このメールは自動送信されておりますので、
このメールへの返信はできません。

━━━━━━━━━━━━━━━━━━━━━━━━
AI経営軍師 サポートチーム
合同会社Leadfive
Email: leadfive.138@gmail.com
━━━━━━━━━━━━━━━━━━━━━━━━
`;

    // 自動返信メールを送信
    MailApp.sendEmail({
      to: data.email,
      subject: '【AI経営軍師】お問い合わせを受け付けました',
      body: autoReplyBody,
      noReply: true
    });
    
    // 成功レスポンスを返す
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'メールを送信しました' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // エラーログ
    console.error('Error:', error);
    
    // エラーレスポンスを返す
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET リクエストのテスト用
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ message: 'GAS Email Service is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}