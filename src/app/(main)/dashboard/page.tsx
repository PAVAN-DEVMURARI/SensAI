import React from 'react'
import { getUserOnboardingStatus } from '../../../../actions/user'
import { redirect } from 'next/navigation'
import { getIndustryInsights } from '../../../../actions/dashboard' // Assuming this function fetches industry insights
import DashboardView from './_components/DashboardView' // Adjust the import path as necessary

const IndustryInsights = async() => {

   const { isOnboarded } = await getUserOnboardingStatus();
  
    if (!isOnboarded) {
      redirect('/onboarding'); // Redirect to onboarding if not onboarded
    }

   const insights  = await getIndustryInsights(); // Only call this after confirming user is onboarded
  
  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} />
    </div>
  )
}

export default IndustryInsights