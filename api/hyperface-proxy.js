export default async function handler(req, res) {
  try {
    const { endpoint, method, body } = req.body || {};

    if (!endpoint) {
      return res.status(400).json({ error: "Missing 'endpoint' field" });
    }

    const SESSION_COOKIE = process.env.HYPERFACE_SESSION;

    const response = await fetch(
      `https://dashboard-sandbox.hyperface.co/dashboard/api/dashboard${endpoint}`,
      {
        method: method || "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": SESSION_COOKIE
        },
        body: JSON.stringify(body || {})
      }
    );

    const data = await response.json();

    res.status(response.status).json(data);

  } catch (err) {
    res.status(500).json({
      error: "Proxy error",
      details: err.message
    });
  }
}
