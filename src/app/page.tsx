import { getServerSession } from 'next-auth';
import React from 'react'
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import Home from '@/components/index/Home';

 const page = async() => {
  const session = await getServerSession(authOptions);
    // Redirect to dashboard if already logged in
    if (session&&session.user.name) {    
      redirect('/dashboard');
    }
  return (
    <>
    <Home/>
    </>
  )
}

export default page