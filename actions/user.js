"use server"
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { MarketOutlook } from "@prisma/client";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data){
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");
    
    // Validate that industry is present
    if (!data.industry) {
        throw new Error("Industry is required but was not provided");
    }

    const user = await db.user.findUnique({
         where:{
            clerkUserId  : userId,
         },
    });

    if (!user) throw new Error("User not found");

    try{

        const result = await db.$transaction(
            async (tx) => {
                //find if the industry exists
                let industryInsight  = await tx.industryInsight.findUnique({
                    where : {
                        industry : data.industry,
                    },
                });
                
                //If industry doesnt exist , create it with the default values- will replace it with ai later
                if (!industryInsight) {
                    console.log("🤖 Generating AI insights for industry:", data.industry);
                    try {
                        const insights = await generateAIInsights(data.industry);
                        console.log("✅ AI insights generated successfully");
                        
                        industryInsight = await tx.industryInsight.create({
                            data: {
                                industry: data.industry,
                                ...insights,
                                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            },
                        });
                    } catch (error) {
                        console.error("❌ AI insights generation failed:", error.message);
                        console.log("🔄 Falling back to default values");
                        // Fallback to default values if AI fails
                        const getDefaultSkills = (industry) => {
                            if (industry.includes('tech') || industry.includes('software')) {
                                return ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git'];
                            } else if (industry.includes('data')) {
                                return ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Excel'];
                            }
                            return ['Communication', 'Project Management', 'Problem Solving', 'Teamwork'];
                        };
                        
                        industryInsight = await tx.industryInsight.create({
                            data: {
                                industry: data.industry,
                                salaryRanges: [],
                                growthRate: 5.0,
                                demandLevel: "MEDIUM",
                                topSkills: getDefaultSkills(data.industry),
                                marketOutlook: "NEUTRAL",
                                keyTrends: ["Remote Work", "Digital Transformation"],
                                recommendedSkills: getDefaultSkills(data.industry),
                                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                            },
                        });
                    }
                } else {
                    // Check if existing insight has default/empty skills and needs AI update
                    const hasDefaultSkills = industryInsight.topSkills.length === 0 || 
                        (industryInsight.topSkills.includes('JavaScript') && 
                         industryInsight.topSkills.includes('Python') && 
                         industryInsight.topSkills.length <= 6);
                    
                    if (hasDefaultSkills) {
                        console.log("🔄 Updating existing industry insight with AI-generated skills");
                        try {
                            const insights = await generateAIInsights(data.industry);
                            console.log("✅ AI insights generated for existing industry");
                            
                            industryInsight = await tx.industryInsight.update({
                                where: { id: industryInsight.id },
                                data: {
                                    ...insights,
                                    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                                },
                            });
                        } catch (error) {
                            console.error("❌ Failed to update with AI insights:", error.message);
                            console.log("⚠️ Keeping existing insights");
                        }
                    }
                }

                //update the user
                const updatedUser = await tx.user.update({
                    where:{
                        id: user.id,
                    },
                    data:{
                        industry : data.industry,
                        experience : data.experience,
                        bio : data.bio,
                        skills : data.skills,
                    }
                });
                return {updatedUser, industryInsight};
            },
            {
                timeout: 10000, // 10 seconds
            }
        )
        return { success: true, ...result };
    }
    catch(error){
        console.error("Error updating user:", error.message);
        throw new Error("Failed to update user" + error.message);

    }
}


export async function getUserOnboardingStatus(){
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const user = await db.user.findUnique({
         where:{
            clerkUserId  : userId,
         },
    });

    if (!user) throw new Error("User not found");

    try{
        const user = await db.user.findUnique({
            where:{
                clerkUserId: userId,
            },
            select:{
                industry: true,
            },
        });
        return {
            isOnboarded: !!user?.industry,
        };

    }
    catch(error){
            console.error("Error fetching user onboarding status:", error);
            throw new Error("Failed to fetch user onboarding status");
    }

}

