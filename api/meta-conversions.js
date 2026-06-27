export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  const testEventCode = process.env.META_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    return res.status(500).json({
      error: "Missing META_PIXEL_ID or META_ACCESS_TOKEN environment variables",
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!body || typeof body !== "object") {
      return res.status(400).json({ error: "Invalid payload" });
    }

    if (!body.event_name || !body.event_time || !body.action_source) {
      return res.status(400).json({
        error: "Missing required fields: event_name, event_time, action_source",
      });
    }

    const eventData = {
      event_name: body.event_name,
      event_time: body.event_time,
      event_id: body.event_id,
      action_source: body.action_source,
      event_source_url: body.event_source_url,
      user_data: {
        fbp: body.user_data?.fbp || undefined,
        fbc: body.user_data?.fbc || undefined,
        client_user_agent:
          body.user_data?.client_user_agent || req.headers["user-agent"],
        client_ip_address:
          (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
          req.socket?.remoteAddress ||
          undefined,
      },
      custom_data: body.custom_data || undefined,
    };

    const payload = {
      data: [eventData],
    };

    if (testEventCode) {
      payload.test_event_code = testEventCode;
    }

    const metaUrl = `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`;

    const response = await fetch(metaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Meta API request failed",
        details: responseData,
      });
    }

    return res.status(200).json({ ok: true, meta: responseData });
  } catch (error) {
    return res.status(500).json({
      error: "Unexpected error while sending CAPI event",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
