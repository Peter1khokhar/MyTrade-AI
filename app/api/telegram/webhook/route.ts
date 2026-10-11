import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { sendTelegramMessage } from '@/lib/telegram/send';

// ═══════════════════════════════════════════════════════════
// 📱 POST - Telegram Webhook Handler
// ═══════════════════════════════════════════════════════════

export async function POST(req: Request) {
  try {
    const update = await req.json();

    console.log('📱 Telegram update received:', JSON.stringify(update, null, 2));

    // Handle different update types
    if (update.message) {
      await handleMessage(update.message);
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}

// ═══════════════════════════════════════════════════════════
// 💬 Handle Incoming Messages
// ═══════════════════════════════════════════════════════════

async function handleMessage(message: any) {
  const chatId = message.chat.id;
  const text = message.text || '';
  const username = message.from?.username || '';
  const firstName = message.from?.first_name || 'there';

  console.log(`💬 Message from ${chatId}: ${text}`);

  // Handle /start command
  if (text.startsWith('/start')) {
    // Extract parameter (e.g., /start user123)
    const parts = text.split(' ');
    const startParam = parts[1];

    if (startParam && startParam.startsWith('user_')) {
      // User ID from parameter
      const userId = startParam.replace('user_', '');
      await connectUserToTelegram(userId, chatId, username);
    } else {
      // Generic start - show welcome
      await sendWelcomeMessage(chatId, firstName);
    }
    return;
  }

  // Handle /stop command
  if (text === '/stop') {
    await disconnectUser(chatId);
    return;
  }

  // Handle /help command
  if (text === '/help') {
    await sendHelpMessage(chatId);
    return;
  }

  // Handle /status command
  if (text === '/status') {
    await sendStatusMessage(chatId);
    return;
  }

  // Unknown command
  await sendTelegramMessage(
    chatId,
    `❓ Unknown command.\n\nUse /help to see available commands.`
  );
}

// ═══════════════════════════════════════════════════════════
// 🔗 Connect User to Telegram
// ═══════════════════════════════════════════════════════════

async function connectUserToTelegram(
  userId: string,
  chatId: number,
  username: string
) {
  try {
    await connectDB();

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      await sendTelegramMessage(
        chatId,
        `❌ User not found.\n\nPlease make sure you're logged in to MyTrade AI.`
      );
      return;
    }

    // Check if already connected
    if (user.telegramConnected && user.telegramChatId === String(chatId)) {
      await sendTelegramMessage(
        chatId,
        `✅ Already connected!\n\nYou'll receive trading signals here.`
      );
      return;
    }

    // Connect
    user.telegramChatId = String(chatId);
    user.telegramUsername = username;
    user.telegramConnected = true;
    await user.save();

    console.log(`✅ Connected ${user.email} to Telegram (${chatId})`);

    await sendTelegramMessage(
      chatId,
      `🎉 <b>Connected successfully!</b>

Welcome to <b>MyTrade AI</b>, ${user.name}!

📱 You'll now receive:
├ 🎯 AI-generated trading signals
├ 📊 Signal details (Entry, SL, TP)
├ ⚡ Real-time notifications
└ 📈 Trade updates

<b>Commands:</b>
/status - Check connection status
/help - Show all commands
/stop - Disconnect

⚠️ <i>Not financial advice. DYOR.</i>`
    );

  } catch (error) {
    console.error('❌ Connect error:', error);
    await sendTelegramMessage(
      chatId,
      `❌ Connection failed. Please try again later.`
    );
  }
}

// ═══════════════════════════════════════════════════════════
// ❌ Disconnect User
// ═══════════════════════════════════════════════════════════

async function disconnectUser(chatId: number) {
  try {
    await connectDB();

    const user = await User.findOne({ telegramChatId: String(chatId) });
    if (!user) {
      await sendTelegramMessage(
        chatId,
        `❌ No connection found.`
      );
      return;
    }

    user.telegramConnected = false;
    user.telegramChatId = undefined;
    user.telegramUsername = undefined;
    await user.save();

    console.log(`✅ Disconnected ${user.email}`);

    await sendTelegramMessage(
      chatId,
      `👋 <b>Disconnected</b>

You will no longer receive trading signals.

To reconnect, visit your profile settings on MyTrade AI.`
    );

  } catch (error) {
    console.error('❌ Disconnect error:', error);
  }
}

// ═══════════════════════════════════════════════════════════
// 📊 Status Message
// ═══════════════════════════════════════════════════════════

async function sendStatusMessage(chatId: number) {
  try {
    await connectDB();

    const user = await User.findOne({ telegramChatId: String(chatId) });

    if (user && user.telegramConnected) {
      await sendTelegramMessage(
        chatId,
        `✅ <b>Connected</b>

👤 User: ${user.name}
📧 Email: ${user.email}
💎 Plan: ${user.plan}
⭐ Status: Active

You're all set to receive signals!`
      );
    } else {
      await sendTelegramMessage(
        chatId,
        `❌ <b>Not connected</b>

Visit your MyTrade AI profile to connect.`
      );
    }

  } catch (error) {
    console.error('❌ Status error:', error);
  }
}

// ═══════════════════════════════════════════════════════════
// 👋 Welcome Message
// ═══════════════════════════════════════════════════════════

async function sendWelcomeMessage(chatId: number, firstName: string) {
  await sendTelegramMessage(
    chatId,
    `👋 <b>Hello ${firstName}!</b>

Welcome to <b>MyTrade AI</b> — AI-powered Forex trading signals.

To connect your account:
1. Login to MyTrade AI
2. Go to Profile → Settings
3. Click "Connect Telegram"
4. You'll be redirected here

<b>Commands:</b>
/start - Connect account
/status - Check connection
/help - Show all commands
/stop - Disconnect

⚠️ <i>Not financial advice. DYOR.</i>`
  );
}

// ═══════════════════════════════════════════════════════════
// ❓ Help Message
// ═══════════════════════════════════════════════════════════

async function sendHelpMessage(chatId: number) {
  await sendTelegramMessage(
    chatId,
    `📚 <b>Available Commands</b>

/start - Connect your account
/status - Check connection status
/help - Show this help message
/stop - Disconnect notifications

<b>About MyTrade AI:</b>
🎯 AI-powered Forex signals
📊 ICT/SMC analysis
⚡ Real-time notifications
💰 Forex, Gold, Silver, Oil, Copper

<b>Website:</b>
https://my-trade-ai.vercel.app

⚠️ <i>Not financial advice. Do your own research.</i>`
  );
}

// ═══════════════════════════════════════════════════════════
// ✅ GET - Verify Webhook (for testing)
// ═══════════════════════════════════════════════════════════

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Telegram webhook is active',
    timestamp: new Date().toISOString(),
  });
}