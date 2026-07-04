// ── AuditMD Zapier Webhook Proxy ──────────────────────────────────────────
// Netlify Function: /.netlify/functions/zapier-proxy
// Routes form submissions to the correct Zapier webhook based on the
// "service" field in the payload. Keeps all webhook URLs server-side.
//
// Setup — add these 5 keys in Netlify dashboard → Site → Environment Variables:
//   ZAPIER_WEBHOOK_PRECALL, ZAPIER_WEBHOOK_STAKEHOLDER, ZAPIER_WEBHOOK_GOVERNANCE,
//   ZAPIER_WEBHOOK_ASSESSMENT, ZAPIER_WEBHOOK_POSTAUDIT
//
// Note: HIPAA, EHR Workflow, and PMO Maturity all share ZAPIER_WEBHOOK_ASSESSMENT.
// ─────────────────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Map each form's "service" value to its Netlify env var.
// Resolved at request time so hot-reloads pick up env changes without redeploy.
function getWebhookUrl(service) {
  const map = {
    'Pre-Call Questionnaire':           process.env.ZAPIER_WEBHOOK_PRECALL,
    'AI Readiness Stakeholder Survey':  process.env.ZAPIER_WEBHOOK_STAKEHOLDER,
    'Governance Assessment':            process.env.ZAPIER_WEBHOOK_GOVERNANCE,
    'HIPAA Compliance Assessment':      process.env.ZAPIER_WEBHOOK_ASSESSMENT,
    'EHR Workflow Assessment':          process.env.ZAPIER_WEBHOOK_ASSESSMENT,
    'PMO Maturity Assessment':          process.env.ZAPIER_WEBHOOK_ASSESSMENT,
    'Post-Audit Debrief':               process.env.ZAPIER_WEBHOOK_POSTAUDIT,
  };
  return map[service] || null;
}

exports.handler = async function (event) {

  // ── CORS preflight ────────────────────────────────────────────────────────
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  // ── Method guard ─────────────────────────────────────────────────────────
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  // ── Validate service field ────────────────────────────────────────────────
  const { service } = payload;
  if (!service || typeof service !== 'string') {
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Missing or invalid "service" field' }),
    };
  }

  // ── Resolve webhook URL ───────────────────────────────────────────────────
  const webhookUrl = getWebhookUrl(service);
  if (!webhookUrl) {
    console.error(`[zapier-proxy] Unknown service or unconfigured env var: "${service}"`);
    return {
      statusCode: 400,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: `Unknown service: "${service}"` }),
    };
  }

  // ── Forward to Zapier ─────────────────────────────────────────────────────
  let zapierRes;
  try {
    zapierRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[zapier-proxy] Network error forwarding to Zapier:', err);
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to reach Zapier webhook. Please try again.' }),
    };
  }

  // ── Return Zapier's response ───────────────────────────────────────────────
  const zapierBody = await zapierRes.text();

  if (!zapierRes.ok) {
    console.error(`[zapier-proxy] Zapier returned ${zapierRes.status} for service "${service}":`, zapierBody);
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: `Zapier error ${zapierRes.status}` }),
    };
  }

  console.log(`[zapier-proxy] Forwarded "${service}" → ${zapierRes.status}`);

  return {
    statusCode: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, zapier: zapierBody }),
  };
};