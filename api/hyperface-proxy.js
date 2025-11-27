export default async function handler(req, res) {
  try {
    // 1. Validate Input
    const { endpoint, body } = req.body || {};

    if (!endpoint) {
      return res.status(400).json({ error: "Missing 'endpoint' field" });
    }

    const SESSION_COOKIE = process.env.HYPERFACE_SESSION;
    const targetUrl = `https://dashboard-sandbox.hyperface.co/dashboard/api/dashboard${endpoint}`;

    // 2. Log outgoing request for debugging (Optional but recommended)
    console.log(`Proxying to: ${targetUrl}`);

    // 3. Make the Request
    const hfResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": SESSION_COOKIE || "" // Handle missing cookie gracefully
      },
      body: JSON.stringify(body)
    });

    // 4. Safely Handle the Response
    // We use .text() instead of .json() to prevent crashing on empty/HTML responses
    const responseText = await hfResponse.text();
    
    let responseJson;
    try {
      // Try to parse the text as JSON
      responseJson = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      // If parsing fails, the upstream returned HTML or non-JSON text.
      // We return this as a readable error instead of crashing.
      console.error("Upstream returned non-JSON:", responseText);
      return res.status(502).json({
        error: "Upstream API response was not valid JSON",
        upstreamStatus: hfResponse.status,
        rawResponse: responseText // This will show you the actual HTML error or empty string
      });
    }

    // 5. Return success to client
    return res.status(hfResponse.status).json(responseJson);

  } catch (e) {
    // Global catch for network errors or logic bugs
    console.error("Proxy Internal Error:", e);
    return res.status(500).json({
      error: "Proxy internal server error",
      details: e.message
    });
  }
}
