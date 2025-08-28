// If on Node 16 or lower, uncomment the next line:
// import fetch from 'node-fetch';

export async function handler(event, context) {
  try {
    const token = process.env.NITRADO_TOKEN;
    const serviceId = process.env.NITRADO_SERVICE_ID;
    if (!token || !serviceId) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // CORS
        },
        body: JSON.stringify({ error: "Missing NITRADO_TOKEN or NITRADO_SERVICE_ID environment variables." }),
      };
    }

    const url = `https://api.nitrado.net/services/${serviceId}/gameservers`;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!r.ok) {
      let errBody;
      try {
        errBody = await r.json();
      } catch {
        errBody = { error: "Failed to parse error response from Nitrado." };
      }
      return {
        statusCode: r.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*", // CORS
        },
        body: JSON.stringify({ error: "Nitrado API error", details: errBody }),
      };
    }

    const json = await r.json();

    // Uncomment for debugging:
    // console.log("Nitrado API response:", JSON.stringify(json));

    const gs = json?.data?.gameserver || json?.data?.game_server || json?.data || {};

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
        "Access-Control-Allow-Origin": "*", // CORS
      },
      body: JSON.stringify({
        status,
        players: Number(players) || 0,
        maxPlayers: Number(maxPlayers) || null,
        raw: rawStatus,
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // CORS
      },
      body: JSON.stringify({
        error: e.message,
        stack: process.env.NODE_ENV === "development" ? e.stack : undefined,
      }),
    };
  }
}
