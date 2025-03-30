"use client"
import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SocialLinks({ stopPropagation = false, buttonHeight = "2.5rem" }) {
  // Define consistent colors for the UI
  const uiColors = {
    bgDark: "#0a1929",
    textBlue: "#4fc3f7",
    borderBlue: "#1e88e5",
    hoverBg: "#1e3a5f",
  }

  const handleClick = (url) => (e) => {
    if (stopPropagation) {
      e.stopPropagation()
    }
    window.open(url, "_blank")
  }

  return (
    <div className="flex gap-2 justify-center">
      <Button
        variant="outline"
        size="icon"
        className="transition-all duration-300 hover:scale-110 shadow-md"
        style={{
          backgroundColor: `${uiColors.bgDark}`,
          color: uiColors.textBlue,
          borderColor: `${uiColors.borderBlue}`,
          height: buttonHeight,
          width: buttonHeight,
        }}
        onClick={handleClick("https://instagram.com/ieee_spit")}
      >
        <Instagram className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="transition-all duration-300 hover:scale-110 shadow-md"
        style={{
          backgroundColor: `${uiColors.bgDark}`,
          color: uiColors.textBlue,
          borderColor: `${uiColors.borderBlue}`,
          height: buttonHeight,
          width: buttonHeight,
        }}
        onClick={handleClick("https://www.linkedin.com/company/ieee-spit/")}
      >
        <Linkedin className="h-5 w-5" />
      </Button>
    </div>
  )
}

