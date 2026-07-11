import { createClient } from "npm:@supabase/supabase-js@2";

type NotificationRow = {
  id: string;
  event_type: string;
  to_email: string;
  subject: string;
  text_body: string;
  html_body: string;
  payload: Record<string, unknown> | null;
  status: "pending" | "processing" | "sent" | "failed";
  attempt_count: number;
};

type SendEmailResult = {
  id?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function createSupabaseAdminClient() {
  return createClient(
    getRequiredEnv("SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

function getAuthorizationToken(request: Request) {
  const value = request.headers.get("authorization") || "";
  return value.replace(/^Bearer\s+/i, "").trim();
}

async function sendViaResend(row: NotificationRow) {
  const resendApiKey = getRequiredEnv("RESEND_API_KEY");
  const emailFrom = getRequiredEnv("EMAIL_FROM");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [row.to_email],
      subject: row.subject,
      text: row.text_body,
      html: row.html_body,
    }),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `Resend request failed with status ${response.status}.`);
  }

  return text ? (JSON.parse(text) as SendEmailResult) : {};
}

async function markStatus(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  id: string,
  payload: Record<string, unknown>,
) {
  const { error } = await supabase
    .from("notification_events")
    .update(payload)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const token = getAuthorizationToken(request);

    if (!token || token !== serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const body =
      request.method === "POST"
        ? await request.json().catch(() => ({}))
        : {};
    const limit =
      typeof body.limit === "number" && body.limit > 0
        ? Math.min(body.limit, 25)
        : 10;

    const supabase = createSupabaseAdminClient();

    const { data: rows, error } = await supabase
      .from("notification_events")
      .select(
        "id,event_type,to_email,subject,text_body,html_body,payload,status,attempt_count",
      )
      .in("status", ["pending", "failed"])
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    const notifications = (rows ?? []) as NotificationRow[];
    let sent = 0;
    let failed = 0;

    for (const row of notifications) {
      try {
        await markStatus(supabase, row.id, {
          status: "processing",
          attempt_count: (row.attempt_count ?? 0) + 1,
          last_error: null,
        });

        const result = await sendViaResend(row);

        await markStatus(supabase, row.id, {
          status: "sent",
          processed_at: new Date().toISOString(),
          payload: {
            ...(row.payload ?? {}),
            resendId: result.id ?? null,
          },
        });

        sent += 1;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Email sending failed.";

        await markStatus(supabase, row.id, {
          status: "failed",
          last_error: message,
        });

        failed += 1;
      }
    }

    return new Response(
      JSON.stringify({
        processed: notifications.length,
        sent,
        failed,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unexpected error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
