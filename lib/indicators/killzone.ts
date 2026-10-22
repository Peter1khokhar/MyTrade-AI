// ═══════════════════════════════════════════════════════════
// 🕐 ICT KILLZONE DETECTOR
// Only trade during institutional high-liquidity sessions
// ═══════════════════════════════════════════════════════════

export type Session =
  | 'SYDNEY'
  | 'TOKYO'
  | 'LONDON'
  | 'NEW_YORK'
  | 'LONDON_NY_OVERLAP'
  | 'DEAD_ZONE';

export interface KillzoneInfo {
  currentSession: Session;
  isKillzoneActive: boolean;
  activeKillzone: 'LONDON' | 'NEW_YORK' | 'ASIAN' | null;
  utcHour: number;
  utcMinute: number;
  minutesToNextKillzone: number | null;
  recommendation: string;
  quality: 'PRIME' | 'GOOD' | 'AVOID';
}

// ═══════════════════════════════════════════════════════════
// 📅 Killzone Windows (UTC times)
// ═══════════════════════════════════════════════════════════

// London Killzone: 07:00 - 10:00 UTC (high liquidity)
// NY Killzone:     12:00 - 15:00 UTC (highest volatility)
// Asian Range:     00:00 - 03:00 UTC (accumulation)
// London/NY Overlap: 12:00 - 15:00 UTC (BEST — both sessions active)

export function getKillzoneInfo(now: Date = new Date()): KillzoneInfo {
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();
  const utcDay = now.getUTCDay(); // 0 = Sunday, 6 = Saturday

  // Weekend market closed
  if (utcDay === 6 || (utcDay === 0 && utcHour < 21)) {
    return {
      currentSession: 'DEAD_ZONE',
      isKillzoneActive: false,
      activeKillzone: null,
      utcHour,
      utcMinute,
      minutesToNextKillzone: null,
      recommendation: '🔴 Market closed (weekend). No trading.',
      quality: 'AVOID',
    };
  }

  // ═══════════════════════════════════════════════════════
  // Determine session
  // ═══════════════════════════════════════════════════════

  // LONDON + NY OVERLAP (12:00 - 15:00 UTC) — BEST for signals
  if (utcHour >= 12 && utcHour < 15) {
    return {
      currentSession: 'LONDON_NY_OVERLAP',
      isKillzoneActive: true,
      activeKillzone: 'NEW_YORK',
      utcHour,
      utcMinute,
      minutesToNextKillzone: null,
      recommendation: '🟢 PRIME TIME — London/NY overlap. Highest liquidity.',
      quality: 'PRIME',
    };
  }

  // NEW YORK Killzone (15:00 - 17:00 UTC continuation)
  if (utcHour >= 15 && utcHour < 17) {
    return {
      currentSession: 'NEW_YORK',
      isKillzoneActive: true,
      activeKillzone: 'NEW_YORK',
      utcHour,
      utcMinute,
      minutesToNextKillzone: null,
      recommendation: '🟢 Good — NY session active. Solid setups.',
      quality: 'GOOD',
    };
  }

  // LONDON Killzone (07:00 - 10:00 UTC)
  if (utcHour >= 7 && utcHour < 10) {
    return {
      currentSession: 'LONDON',
      isKillzoneActive: true,
      activeKillzone: 'LONDON',
      utcHour,
      utcMinute,
      minutesToNextKillzone: null,
      recommendation: '🟢 London open — high probability setups.',
      quality: 'GOOD',
    };
  }

  // ASIAN Killzone (00:00 - 03:00 UTC) — accumulation
  if (utcHour >= 0 && utcHour < 3) {
    return {
      currentSession: 'TOKYO',
      isKillzoneActive: true,
      activeKillzone: 'ASIAN',
      utcHour,
      utcMinute,
      minutesToNextKillzone: null,
      recommendation: '🟡 Asian session — low volatility, range bound.',
      quality: 'GOOD',
    };
  }

  // ═══════════════════════════════════════════════════════
  // Outside killzones → compute minutes to next
  // ═══════════════════════════════════════════════════════
  let minutesToNextKillzone: number;
  let nextKillzoneName: string;

  if (utcHour >= 3 && utcHour < 7) {
    minutesToNextKillzone = (7 - utcHour) * 60 - utcMinute;
    nextKillzoneName = 'London (07:00 UTC)';
  } else if (utcHour >= 10 && utcHour < 12) {
    minutesToNextKillzone = (12 - utcHour) * 60 - utcMinute;
    nextKillzoneName = 'NY Open (12:00 UTC)';
  } else if (utcHour >= 17 && utcHour < 24) {
    minutesToNextKillzone = (24 - utcHour + 0) * 60 - utcMinute;
    nextKillzoneName = 'Asian (00:00 UTC)';
  } else {
    minutesToNextKillzone = 60;
    nextKillzoneName = 'Next session';
  }

  return {
    currentSession: 'DEAD_ZONE',
    isKillzoneActive: false,
    activeKillzone: null,
    utcHour,
    utcMinute,
    minutesToNextKillzone,
    recommendation: `🟠 Dead zone — wait for ${nextKillzoneName} (${minutesToNextKillzone} min).`,
    quality: 'AVOID',
  };
}

// ═══════════════════════════════════════════════════════════
// 🎯 Helper: Should we generate signal now?
// ═══════════════════════════════════════════════════════════

export function shouldGenerateSignal(
  strictMode: boolean = true
): { allowed: boolean; reason: string; killzone: KillzoneInfo } {
  const kz = getKillzoneInfo();

  if (!strictMode) {
    return { allowed: true, reason: 'Strict mode OFF', killzone: kz };
  }

  if (kz.quality === 'AVOID') {
    return {
      allowed: false,
      reason: kz.recommendation,
      killzone: kz,
    };
  }

  return {
    allowed: true,
    reason: `✅ ${kz.currentSession} killzone active`,
    killzone: kz,
  };
}

// ═══════════════════════════════════════════════════════════
// 📋 Session Label (for UI display)
// ═══════════════════════════════════════════════════════════

export function getSessionLabel(session: Session): string {
  const labels: Record<Session, string> = {
    SYDNEY: 'Sydney',
    TOKYO: 'Tokyo / Asian',
    LONDON: 'London',
    NEW_YORK: 'New York',
    LONDON_NY_OVERLAP: 'London-NY Overlap ⭐',
    DEAD_ZONE: 'Dead Zone',
  };
  return labels[session];
}