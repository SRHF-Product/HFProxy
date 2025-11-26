export default async function handler(req, res) {
  try {
    const { endpoint, body } = req.body || {};

    if (!endpoint) {
      return res.status(400).json({ error: "Missing 'endpoint' field" });
    }

    const SESSION_COOKIE = process.env.HYPERFACE_SESSION;

    const hfResponse = await fetch(
      `https://dashboard-sandbox.hyperface.co/dashboard/api/dashboard${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": SESSION_COOKIE
        },
        body: JSON.stringify(body)
      }
    );

    const json = await hfResponse.json();
    return res.status(hfResponse.status).json(json);

  } catch (e) {
    res.status(500).json({
      error: "Proxy error",
      details: e.message
    });
  }
}
