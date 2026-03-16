import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { movieCount = 5 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating AI movie recommendations...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a movie recommendation expert. Provide movie recommendations based on popular, critically acclaimed, and trending films.",
          },
          {
            role: "user",
            content: `Recommend ${movieCount} popular movies. Return ONLY a JSON array of TMDB movie IDs (numbers). Example format: [550, 680, 13]`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("AI Gateway error");
    }

    const aiResponse = await response.json();
    console.log("AI Response:", JSON.stringify(aiResponse));

    let movieIds: number[] = [];
    
    // Extract movie IDs from AI response
    const content = aiResponse.choices?.[0]?.message?.content || "";
    try {
      // Try to parse as JSON array
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        movieIds = parsed.filter((id) => typeof id === "number");
      }
    } catch {
      // If parsing fails, try to extract numbers from text
      const matches = content.match(/\d+/g);
      if (matches) {
        movieIds = matches.slice(0, movieCount).map((id: string) => parseInt(id));
      }
    }

    // Fallback to popular movie IDs if AI doesn't provide valid ones
    if (movieIds.length === 0) {
      console.log("Using fallback movie IDs");
      movieIds = [550, 680, 13, 278, 238]; // Fight Club, Pulp Fiction, Forrest Gump, Shawshank, Godfather
    }

    console.log("Recommended movie IDs:", movieIds);

    return new Response(
      JSON.stringify({ movieIds: movieIds.slice(0, movieCount) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in get-ai-recommendations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
