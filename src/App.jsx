"use client"

import { useState, useEffect, useRef } from "react"
import Spline from "@splinetool/react-spline"
import { Button } from "@/components/ui/button"
import { LinkIcon } from "lucide-react"
import CountdownTimer from "@/components/countdown-timer"
import SocialLinks from "@/components/social-links"
import Loader from "@/components/Loader"

export default function App() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [splineLoaded, setSplineLoaded] = useState(false)
  const splineContainerRef = useRef(null)

  // Define consistent colors for the UI
  const uiColors = {
    bgDark: "#0a1929",
    textBlue: "#4fc3f7",
    borderBlue: "#1e88e5",
    hoverBg: "#1e3a5f",
  }

  useEffect(() => {
    // Check device type on component mount
    const checkDeviceType = () => {
      setIsMobile(window.innerWidth <= 768) // Typical mobile breakpoint
    }

    // Initial check
    checkDeviceType()

    // Add event listener to handle resizing
    window.addEventListener("resize", checkDeviceType)

    // Cleanup event listener
    return () => {
      window.removeEventListener("resize", checkDeviceType)
    }
  }, [])

  // Handle Spline load completion
  const handleSplineLoad = () => {
    setSplineLoaded(true)
  }

  // Common button style for consistent sizing
  const buttonStyle = {
    backgroundColor: uiColors.bgDark,
    color: uiColors.textBlue,
    borderColor: uiColors.borderBlue,
    height: isMobile ? "3.5rem" : "2.75rem",
  }

  const handleLoadComplete = () => {
    setIsLoading(false)
  }

  return (
    <>
      {/* Loader */}
      <Loader onLoadComplete={handleLoadComplete} uiColors={uiColors} />

      {/* Main Content */}
      <div
        className={`h-screen w-full flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat relative overflow-hidden transition-opacity duration-700 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        style={{
          backgroundImage: `url('/artwork-simple-background-blue-stars-wallpaper-ebf69cfd13211fe92594cb491dfc1c80.jpg')`,
        }}
      >
        {/* Logo - Always in top left */}
        <div className="absolute top-5 left-5 z-10 pointer-events-auto">
          <img src="/ieee-BladhgC_.png" alt="IEEE SPIT" className="h-16" />
        </div>

        {/* IEEE SPIT Header - Always in top center */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto">
          <div
            className="px-8 py-3 rounded-md border-2 shadow-lg"
            style={{
              backgroundColor: uiColors.bgDark,
              color: uiColors.textBlue,
              borderColor: uiColors.borderBlue,
            }}
          >
            <h1 className="text-2xl font-bold">TechTopia</h1>
          </div>
        </div>

        {/* Countdown Timer - Bottom right on mobile, top right on desktop */}
        <div className={`absolute ${isMobile ? "bottom-1 right-1" : "top-5 right-5"} z-10 pointer-events-auto`}>
          <CountdownTimer targetDate="2025-04-05T12:00:00" uiColors={uiColors} isMobile={isMobile} />
        </div>

        {/* Register Button - Bottom center on desktop, bottom left on mobile */}
        <div
          className={`absolute ${isMobile ? "bottom-1 left-1" : "bottom-5 left-1/2 transform -translate-x-1/2"} z-10 pointer-events-auto`}
        >
          <Button
            className={`px-6 text-lg font-bold rounded-md border-2 shadow-lg transition-all duration-300 ${isMobile ? "w-32" : "w-40"}`}
            style={buttonStyle}
          >
            IEEE SPIT
          </Button>
        </div>

        {/* Social Media Links - Only visible on desktop (bottom left) */}
        {!isMobile && (
          <div className="absolute bottom-5 left-5 z-10 pointer-events-auto">
            <SocialLinks uiColors={uiColors} buttonHeight="2.75rem" />
          </div>
        )}

        {/* Linktree Button - Bottom right on desktop, top right on mobile */}
        <div className={`absolute ${isMobile ? "top-5 right-5" : "bottom-5 right-5"} z-10 pointer-events-auto`}>
          <Button
            variant="outline"
            className="flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-md"
            style={{
              ...buttonStyle,
              padding: isMobile ? "0.75rem" : "0.5rem 1rem",
              width: isMobile ? "3.5rem" : "auto",
            }}
            onClick={() => window.open("https://linktr.ee/Tech_Topia", "_blank")}
          >
            <LinkIcon className={`${isMobile ? "h-6 w-6" : "h-5 w-5"}`} />
            {!isMobile && <span>TechTopia Linktree</span>}
          </Button>
        </div>

        {/* 3D Spline Scene */}
        <div className="flex-1 w-full h-full absolute inset-0" ref={splineContainerRef}>
          {isMobile ? (
            <Spline
              scene="https://prod.spline.design/e0MT89M0cxovG7VG/scene.splinecode"
              width={428}
              height={926}
              onLoad={handleSplineLoad}
            />
          ) : (
            <Spline scene="https://prod.spline.design/qPaFK4QbIyWDYm7T/scene.splinecode" onLoad={handleSplineLoad} />
          )}
        </div>
      </div>
    </>
  )
}

