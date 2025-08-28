# HexHub — Icon Nav + Palworld (Nitrado) hook

## Deploy
- Netlify: New site from Git (no build), publish dir `.`
- Add env vars in Site Settings → Build & Deploy → Environment:
  - `NITRADO_TOKEN` = your Nitrado API token
  - `NITRADO_SERVICE_ID` = the numeric service id for your Palworld server
- Redeploy. The Servers page will call `/.netlify/functions/palworld-status` and update the badge.

## Where to find Service ID
- In the Nitrado web panel URL for the service, or via the API at `GET https://api.nitrado.net/services` (use the same token).

