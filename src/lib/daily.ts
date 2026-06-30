const DAILY_API_BASE = "https://api.daily.co/v1";

export function isDailyConfigured() {
  return !!process.env.DAILY_API_KEY;
}

/**
 * Creates (or reuses) a Daily.co room for a booking. Requires DAILY_API_KEY.
 * Docs: https://docs.daily.co/reference/rest-api/rooms/create-room
 */
export async function createDailyRoom(bookingId: string): Promise<string | null> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(`${DAILY_API_BASE}/rooms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: `lookeyy-tour-${bookingId}`,
      privacy: "private",
      properties: {
        enable_chat: true,
        enable_screenshare: true,
        exp: Math.round(Date.now() / 1000) + 60 * 60 * 6, // 6h expiry
      },
    }),
  });

  if (!res.ok) {
    // Room may already exist — fetch it instead.
    if (res.status === 400) {
      const existing = await fetch(`${DAILY_API_BASE}/rooms/lookeyy-tour-${bookingId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (existing.ok) {
        const data = await existing.json();
        return data.url as string;
      }
    }
    console.error("[daily] failed to create room", await res.text());
    return null;
  }

  const data = await res.json();
  return data.url as string;
}

/** Generates a short-lived meeting token so a participant can join a private room. */
export async function createDailyMeetingToken(roomName: string, userName: string): Promise<string | null> {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(`${DAILY_API_BASE}/meeting-tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties: { room_name: roomName, user_name: userName } }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.token as string;
}
