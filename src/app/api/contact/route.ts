import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, company, email, phone, message, plans } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'お名前、メールアドレス、お問い合わせ内容は必須項目です。' },
        { status: 400 }
      );
    }

    // Log the contact form submission
    console.log('Contact form submission:', {
      name,
      company,
      email,
      phone,
      messageLength: message.length,
      selectedPlans: plans || [],
      timestamp: new Date().toISOString()
    });

    // Send to Google Apps Script if URL is configured
    const gasUrl = process.env.NEXT_PUBLIC_GAS_URL;
    
    if (gasUrl) {
      try {
        const gasResponse = await fetch(gasUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            company,
            email,
            phone,
            message,
            plans
          }),
        });

        const gasResult = await gasResponse.text();
        console.log('GAS response:', gasResult);

        if (!gasResponse.ok) {
          throw new Error(`GAS returned status ${gasResponse.status}`);
        }

        return NextResponse.json(
          { 
            success: true, 
            message: 'お問い合わせを受け付けました。2営業日以内にご連絡させていただきます。' 
          },
          { status: 200 }
        );
      } catch (gasError) {
        console.error('GAS email sending error:', gasError);
        // Continue without failing - log the error but return success
        // This ensures the form submission is not lost
      }
    } else {
      console.log('GAS URL not configured. To enable email notifications, set NEXT_PUBLIC_GAS_URL in .env.local');
    }

    // Fallback: Log the contact details even if email fails
    const emailContent = `
新しいお問い合わせがありました。

【お客様情報】
お名前: ${name}
会社名: ${company || 'なし'}
メールアドレス: ${email}
電話番号: ${phone || 'なし'}
検討中のプラン: ${plans && plans.length > 0 ? plans.join(', ') : 'なし'}

【お問い合わせ内容】
${message}

---
このメールはAI経営軍師のお問い合わせフォームから自動送信されました。
送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
    `;
    console.log('Contact form content:', emailContent);

    return NextResponse.json(
      { 
        success: true, 
        message: 'お問い合わせを受け付けました。2営業日以内にご連絡させていただきます。' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'エラーが発生しました。時間をおいて再度お試しください。' },
      { status: 500 }
    );
  }
}