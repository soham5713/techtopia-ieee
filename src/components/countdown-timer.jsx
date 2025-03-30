"use client"

import { useState, useEffect } from "react"

export default function CountdownTimer({ targetDate, uiColors, isMobile }) {
  // Use provided colors or fallback to defaults
  const colors = uiColors || {
    bgDark: "#0a1929",
    textBlue: "#4fc3f7",
    borderBlue: "#1e88e5",
    hoverBg: "#1e3a5f",
  }

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  const formatNumber = (num) => {
    return num.toString().padStart(2, "0")
  }

  return (
    <div
      className="rounded-lg text-center shadow-lg border"
      style={{
        backgroundColor: colors.bgDark,
        borderColor: colors.borderBlue,
        boxShadow: `0 0 15px rgba(30,136,229,0.3)`,
        height: isMobile ? "3.5rem" : "3.7rem",
        display: "flex",
        alignItems: "center",
        padding: "0 0.75rem",
      }}
    >
      <div className="flex justify-center items-center gap-2" style={{ color: colors.textBlue }}>
        <div className="flex flex-col items-center">
          <span className={`${isMobile ? "text-xl" : "text-lg"} font-bold`}>{formatNumber(timeLeft.days)}</span>
          <span className="text-[10px]">DAYS</span>
        </div>
        <span className={`${isMobile ? "text-xl" : "text-lg"}`}>:</span>
        <div className="flex flex-col items-center">
          <span className={`${isMobile ? "text-xl" : "text-lg"} font-bold`}>{formatNumber(timeLeft.hours)}</span>
          <span className="text-[10px]">HOURS</span>
        </div>
        <span className={`${isMobile ? "text-xl" : "text-lg"}`}>:</span>
        <div className="flex flex-col items-center">
          <span className={`${isMobile ? "text-xl" : "text-lg"} font-bold`}>{formatNumber(timeLeft.minutes)}</span>
          <span className="text-[10px]">MINS</span>
        </div>
        <span className={`${isMobile ? "text-xl" : "text-lg"}`}>:</span>
        <div className="flex flex-col items-center">
          <span className={`${isMobile ? "text-xl" : "text-lg"} font-bold`}>{formatNumber(timeLeft.seconds)}</span>
          <span className="text-[10px]">SECS</span>
        </div>
      </div>
    </div>
  )
}

