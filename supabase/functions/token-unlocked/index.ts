// @supabase:allowAll
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt/mod.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const API_KEY = Deno.env.get("VIDEOSDK_API_KEY");
  const SECRET_KEY_RAW = Deno.env.get("VIDEOSDK_SECRET_KEY");

  if (!API_KEY || !SECRET_KEY_RAW) {
    return new Response(
      JSON.stringify({ error: "Missing API_KEY or SECRET_KEY" }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(SECRET_KEY_RAW);
    const SECRET_KEY = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    const payload = {
      apikey: API_KEY,
      permissions: ["allow_join", "allow_mod"],
      exp: getNumericDate(60 * 60 * 24),
    };

    const token = await create(
      { alg: "HS256", typ: "JWT" },
      payload,
      SECRET_KEY
    );

    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Token generation failed:", err);
    return new Response(JSON.stringify({ error: "Failed to generate token" }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  }
});
