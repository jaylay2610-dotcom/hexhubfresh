export async function handler() {
  try {
    const token = process.env.NITRADO_TOKEN;
    const serviceId = process.env.NITRADO_SERVICE_ID;
    if (!token || !serviceId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing NITRADO_TOKEN or NITRADO_SERVICE_ID environment variables." }),
      };
    }

    const url = `https://api.nitrado.net/services/${serviceId}/gameservers`;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Handle HTTP/network errors
    if (!r.ok) {
      let errBody;
      try {
        errBody = await r.json();
      } catch {
        errBody = { error: "Failed to parse error response from Nitrado." };
      }
      return {
        statusCode: r.status,
        body: JSON.stringify({ error: "Nitrado API error", details: errBody }),
      };
    }

    const json = await r.json();

    // Log the raw response for debugging (remove in prod if needed)
    // console.log("Nitrado API response:", JSON.stringify(json));

    // Safely find the gameserver object
    const gs = json?.data?.gameserver || json?.data?.game_server || json?.data || {};

    // Extract status with fallback
    const rawStatus = String(gs?.status ?? gs?.status_human ?? gs?.query_status ?? "").toLowerCase();
    const map = {
      started: "Online",
      running: "Online",
      online: "Online",
      starting: "Starting",
      "starting...": "Starting",
      stopping: "Stopping",
      stopped: "Offline",
      offline: "Offline",
    };
    const status = map[rawStatus] || "Unknown";

    // Extract player info with robust fallbacks
    const players =
      gs?.player_current ??
      gs?.players ??
      gs?.player ??
      gs?.query_players ??
      0;
    const maxPlayers =
      gs?.player_max ??
      gs?.slots ??
      gs?.maxplayers ??
      gs?.max_players ??
      null;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({
        status,
        players: Number(players) || 0,
        maxPlayers: Number(maxPlayers) || null,
        raw: rawStatus,
      }),
    };
  } catch (e) {
    // More verbose error output for debugging
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: e.message,
        stack: process.env.NODE_ENV === "development" ? e.stack : undefined,
      }),
    };
  }
}
