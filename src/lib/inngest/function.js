import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Map free-form strings from AI to Prisma enum values
function normalizeDemandLevel(value) {
  if (!value) return "MEDIUM";
  const v = String(value).toUpperCase();
  if (["HIGH", "MEDIUM", "LOW"].includes(v)) return v;
  if (v.startsWith("HI")) return "HIGH";
  if (v.startsWith("ME")) return "MEDIUM";
  if (v.startsWith("LO")) return "LOW";
  return "MEDIUM";
}

function normalizeMarketOutlook(value) {
  if (!value) return "NEUTRAL";
  const v = String(value).toUpperCase();
  if (["POSITIVE", "NEUTRAL", "NEGATIVE"].includes(v)) return v;
  if (v.startsWith("PO")) return "POSITIVE";
  if (v.startsWith("NEU")) return "NEUTRAL";
  if (v.startsWith("NEGA")) return "NEGATIVE";
  return "NEUTRAL";
}

function normalizeInsights(raw) {
  const insights = { ...raw };
  insights.demandLevel = normalizeDemandLevel(raw.demandLevel);
  insights.marketOutlook = normalizeMarketOutlook(raw.marketOutlook);
  if (insights.growthRate != null) insights.growthRate = Number(insights.growthRate) || 0;
  return insights;
}

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // Run every Sunday at midnight
  async ({ event: _event, step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

      const res = await step.ai.wrap(
        "gemini",
        async (p) => {
          return await model.generateContent(p);
        },
        prompt
      );

      const text = res.response.candidates[0].content.parts[0].text || "";
      const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  const parsed = JSON.parse(cleanedText);
  const insights = normalizeInsights(parsed);

      await step.run(`Update ${industry} insights`, async () => {
  await db.industryInsight.update({
          where: { industry },
          data: {
            ...insights,
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      });
    }
  }
); 