'use client';

import React, { Suspense } from 'react';

import Navbar from '../landingPage/Navbar';
import Hero from '../landingPage/Hero';
import Features from '../landingPage/Features';
import FeatureImage from '../landingPage/Feature_img';
import UseCases from '../landingPage/UseCase';
import Pricing from '../landingPage/Pricing';
import Contact from '../landingPage/Contact';
import Footer from '../landingPage/Footer';

export default function Home() {

  return (

    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-screen">
            <img src="/assets/loading.gif" alt="Loading..." />
          </div>
        }
      >
        <Navbar />
        <Hero />
        <Features />
        <FeatureImage />
        {/* <Brands /> */}
        <UseCases />
        {/* <About /> */}
        <Pricing />
        <Contact />
        <Footer />
      </Suspense>
    </div>
  );
}