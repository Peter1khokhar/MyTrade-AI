// ═══════════════════════════════════════════════════════════
// 📱 Telegram Bot API Helper
// ═══════════════════════════════════════════════════════════

const TELEGRAM_API = 'https://api.telegram.org';

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN not set');
  }
  return token;
}

// ═══════════════════════════════════════════════════════════
// 📤 Send Message
// ═══════════════════════════════════════════════════════════

export async function sendTelegramMessage(
  chatId: string | number,
  message: string,
  options?: {
    parseMode?: 'HTML' | 'Markdown';
    disableNotification?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = getBotToken();
    const url = `${TELEGRAM_API}/bot${token}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: options?.parseMode || 'HTML',
        disable_notification: options?.disableNotification || false,
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('❌ Telegram send failed:', data.description);
      return { success: false, error: data.description };
    }

    console.log(`✅ Telegram message sent to ${chatId}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Telegram API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ═══════════════════════════════════════════════════════════
// 🎯 Format Signal Message
// ═══════════════════════════════════════════════════════════

interface SignalData {
  pair: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  timeframe?: string;
  strategy?: string;
  reason?: string;
  confluenceScore?: string;
}

export function formatSignalMessage(data: SignalData): string {
  const emoji = data.signal === 'BUY' ? '🟢' : data.signal === 'SELL' ? '🔴' : '🟡';
  const signalEmoji = data.signal === 'BUY' ? '📈' : data.signal === 'SELL' ? '📉' : '⏸️';

  return `
${emoji} <b>${data.signal} Signal: ${data.pair}</b>

${signalEmoji} <b>Signal:</b> ${data.signal}
⚡ <b>Confidence:</b> ${data.confidence}%
🎯 <b>Confluence:</b> ${data.confluenceScore || 'N/A'}

💰 <b>Trade Setup</b>
├ Entry: <code>${data.entryPrice.toFixed(5)}</code>
├ Stop Loss: <code>${data.stopLoss.toFixed(5)}</code>
└ Take Profit: <code>${data.takeProfit.toFixed(5)}</code>

📊 <b>Details</b>
├ Timeframe: ${data.timeframe || '15m'}
├ Strategy: ${data.strategy || 'ICT/SMC'}
${data.reason ? `└ Reason: ${data.reason}` : ''}

⚠️ <i>Not financial advice. Do your own research.</i>

<a href="https://my-trade-ai.vercel.app/dashboard">Open Dashboard →</a>
  `.trim();
}

// ═══════════════════════════════════════════════════════════
// 🔗 Get Bot Link
// ═══════════════════════════════════════════════════════════

export function getBotLink(startParam?: string): string {
  const username = process.env.TELEGRAM_BOT_USERNAME;
  if (!username) {
    return 'https://t.me/';
  }

  const param = startParam ? `?start=${startParam}` : '';
  return `https://t.me/${username}${param}`;
}