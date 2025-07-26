"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { useRef } from "react";
import { useEffect } from "react";
const HeroSection = () => {
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

      const handleScroll = ()=>{

        const imageElement = imageRef.current;
        const scrollPosition = window.scrollY;
        const scrollThreshold = 100; 
        
        if (scrollPosition > scrollThreshold) {
          if (imageElement) {
            imageElement.classList.add("scrolled");
          }
        } else {
          if (imageElement) {
            imageElement.classList.remove("scrolled");
          }
        }
      }
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
  },[])

  return (

    <section className="w-full pt-36 md:pt-48 pb-32 min-h-[150vh]">
    {/* Hero Section Content */}
    <div className="space-y-6 text-center">
      <div className="space-y-6 mx-auto">
        <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title">
            Your AI Career Coach for 
            <br />
            Professional Success
        </h1>
        <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl" >
            Advance Your Career with personalized guidance, interview prep, and AI-powered tools for job success
        </p>
      </div>

    <div className="flex justify-center space-x-4">
      <Link href="/dashboard">
         <Button size="lg" className="px-8">Get Started</Button>
      </Link>
    </div>

    <div className="hero-image-wrapper mt-16 md:mt-20 mb-16">
      <div ref={imageRef} className="hero-image">
        <Image 
        src={"/banner.jpeg"}
        width={1280}
        height={720}
        alt="Banner Sensai"
        className="w-full h-auto max-w-5xl rounded-lg shadow-2xl border mx-auto object-cover"
        priority
        />
      </div>
    </div>


    </div>
  </section>
  );
};

export default HeroSection;