// Netlify Function: Palworld status via Nitrado API
// Set env vars in Netlify: NITRADO_TOKEN, NITRADO_SERVICE_ID
export async function handler() {
  try {
    const token = process.env.NITRADO_TOKEN;
    const serviceId = process.env.NITRADO_SERVICE_ID;
    if (!token || !serviceId) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Missing NITRADO_TOKEN or NITRADO_SERVICE_ID env vars' }) };
    }
    const res = await fetch(`https://api.nitrado.net/services/${serviceId}/gameservers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const json = await res.json();
    const gs = json?.data?.gameserver || (json?.data?.gameservers && json.data.gameservers[0]) || null;
    if (!gs) {
      return { statusCode: 200, body: JSON.stringify({ status: 'unknown' }) };
    }
    const status = (gs.status || gs.details?.status || '').toLowerCase();
    const online = ['started','online','running'].includes(status);
    const ip = gs.ip || gs.query_ip || gs.details?.ip || null;
    const port = gs.port || gs.query_port || gs.details?.port || null;
    const name = gs.settings?.hostname || gs.details?.name || 'Palworld Server';
    const players = gs.players || gs.details?.players || null;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: online ? 'online' : 'offline', online, ip, port, name, players })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: 'fetch_failed' }) };
  }
}
