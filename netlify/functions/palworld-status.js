export async function handler() {
  try {
    const token = process.env.NITRADO_TOKEN;
    const serviceId = process.env.NITRADO_SERVICE_ID;
    if (!token || !serviceId) {
      return { statusCode: 500, body: JSON.stringify({ error: "Missing env vars" }) };
    }

    const r = await fetch(`https://api.nitrado.net/services/${serviceId}/gameservers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await r.json();
    if (!r.ok) return { statusCode: r.status, body: JSON.stringify(json) };

    const gs = json?.data?.gameserver || json?.data?.game_server || json?.data;
    const raw = String(gs?.status || gs?.status_human || "").toLowerCase();
    const map = { started: "Online", running: "Online", online: "Online",
                  starting: "Starting", "starting...": "Starting",
                  stopping: "Stopping", stopped: "Offline", offline: "Offline" };
    const status = map[raw] || "Unknown";

    const players = gs?.player_current ?? gs?.players ?? 0;
    const maxPlayers = gs?.player_max ?? gs?.slots ?? null;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ status, players, maxPlayers, raw })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
