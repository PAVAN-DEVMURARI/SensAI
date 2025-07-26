import React from 'react'
import { industries } from '@/data/industries.js'
import OnboardingForm from './_components/onboarding-form'
// const { industries}
 import { getUserOnboardingStatus } from '../../../../actions/user'
import { redirect } from 'next/navigation'

const Onboarding = async () => {
  const { isOnboarded } = await getUserOnboardingStatus();

  if (isOnboarded) {
    redirect('/dashboard'); // Redirect to home if already onboarded
  }
  return (
     <main> <OnboardingForm industries = {industries}  /> </main>
    // <div>Hi</div>
  )
}

export default Onboarding