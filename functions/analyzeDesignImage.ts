import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { image_url, prompt } = await req.json();

        const analysis = await base44.integrations.Core.InvokeLLM({
            prompt: prompt || `You are a veteran UI/UX designer analyzing this background image for an employee engagement platform called INTeract.

Analyze this image and provide:
1. Color palette extraction (hex codes for primary, secondary, accent colors)
2. Mood and emotional impact assessment
3. UI overlay recommendations (what text colors, card opacity, glassmorphism settings would work best)
4. Accessibility considerations (contrast ratios, readability zones)
5. Brand alignment suggestions for a modern, aspirational employee engagement platform
6. Specific CSS/Tailwind recommendations for overlaying UI elements

Be specific and actionable with your recommendations.`,
            file_urls: [image_url],
            add_context_from_internet: false
        });

        return Response.json({ analysis });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});