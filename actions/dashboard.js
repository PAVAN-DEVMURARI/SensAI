"use server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateAIInsights = async (industry) => {
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

        const result = await model.generateContent(prompt)
        const response = result.response;
        const text = response.text()
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
        const raw = JSON.parse(cleanedText);
        const normalize = (val, enums, fallback) => {
          if (!val) return fallback;
          const v = String(val).toUpperCase();
          if (enums.includes(v)) return v;
          // heuristics
          if (v.startsWith("HI")) return "HIGH";
          if (v.startsWith("ME")) return "MEDIUM";
          if (v.startsWith("LO")) return "LOW";
          if (v.startsWith("PO")) return "POSITIVE";
          if (v.startsWith("NEU")) return "NEUTRAL";
          if (v.startsWith("NEGA")) return "NEGATIVE";
          return fallback;
        };
        return {
          ...raw,
          demandLevel: normalize(raw.demandLevel, ["HIGH","MEDIUM","LOW"], "MEDIUM"),
          marketOutlook: normalize(raw.marketOutlook, ["POSITIVE","NEUTRAL","NEGATIVE"], "NEUTRAL"),
          growthRate: raw.growthRate != null ? Number(raw.growthRate) || 0 : 0,
        };
}

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      industryInsight: true,
    },
  });

  if (!user) throw new Error("User not found");

  // Check if user has completed onboarding
  if (!user.industry) {
    // Return null instead of throwing error - let the page handle redirect
    return null;
  }

  if (!user.industryInsight) {
    console.log("Creating industry insight for user industry:", user.industry);
    
    try {
  const insights = await generateAIInsights(user.industry);
      
      const industryInsight = await db.industryInsight.create({
        data: {
          industry: user.industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
      return industryInsight;
    } catch (error) {
      console.error("Failed to create industry insight:", error);
      throw new Error("Failed to generate industry insights");
    }
  }

  return user.industryInsight;
}