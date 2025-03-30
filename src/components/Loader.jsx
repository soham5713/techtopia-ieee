"use client"

import { useEffect, useState, useRef } from "react"

export default function Loader({ onLoadComplete, uiColors }) {
  const [progress, setProgress] = useState(0)
  const [showLoader, setShowLoader] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const canvasRef = useRef(null)
  const cityGridRef = useRef([])
  const requestRef = useRef()
  const previousTimeRef = useRef()

  // Use provided colors or fallback to defaults
  const colors = uiColors || {
    bgDark: "#0a1929",
    textBlue: "#4fc3f7",
    borderBlue: "#1e88e5",
    hoverBg: "#1e3a5f",
  }

  // Handle mouse movement for interactive effects
  const handleMouseMove = (e) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    })
  }

  // Canvas animation for city grid system
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const width = window.innerWidth
    const height = window.innerHeight

    // Set canvas dimensions
    canvas.width = width
    canvas.height = height

    // Initialize city grid if not already done
    if (cityGridRef.current.length === 0) {
      // Create buildings for the skyline
      const buildingCount = Math.floor(width / 30)

      for (let i = 0; i < buildingCount; i++) {
        const buildingWidth = Math.random() * 20 + 10
        const buildingHeight = Math.random() * 150 + 50
        const x = (i * width) / buildingCount + (Math.random() * 10 - 5)

        cityGridRef.current.push({
          type: "building",
          x: x,
          y: height - buildingHeight,
          width: buildingWidth,
          height: buildingHeight,
          color: i % 5 === 0 ? colors.borderBlue : colors.textBlue,
          windows: Array.from({ length: Math.floor(buildingHeight / 15) }, (_, j) => ({
            lit: Math.random() > 0.5,
            blinkRate: Math.random() * 0.01,
            lastBlink: 0,
          })),
          powered: false,
          powerDelay: i * 100,
        })
      }

      // Create grid nodes (representing city infrastructure)
      const gridSize = 40
      const rows = Math.ceil(height / gridSize)
      const cols = Math.ceil(width / gridSize)

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (Math.random() > 0.7) {
            // Only create some nodes for performance
            cityGridRef.current.push({
              type: "node",
              x: col * gridSize,
              y: row * gridSize,
              size: Math.random() * 3 + 1,
              color: colors.textBlue,
              connections: [],
              active: false,
              activationDelay: (row + col) * 100,
            })
          }
        }
      }

      // Create connections between nearby nodes (city grid)
      const nodes = cityGridRef.current.filter((item) => item.type === "node")
      nodes.forEach((node) => {
        nodes.forEach((otherNode) => {
          if (node !== otherNode) {
            const dx = node.x - otherNode.x
            const dy = node.y - otherNode.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < gridSize * 1.5) {
              node.connections.push({
                target: otherNode,
                active: false,
                pulsePosition: 0,
                pulseSpeed: Math.random() * 0.02 + 0.01,
              })
            }
          }
        })
      })

      // Create flying vehicles (drones, flying cars)
      for (let i = 0; i < 15; i++) {
        cityGridRef.current.push({
          type: "vehicle",
          x: Math.random() * width,
          y: Math.random() * height * 0.7,
          size: Math.random() * 4 + 2,
          speedX: (Math.random() - 0.5) * 2,
          color: i % 2 === 0 ? colors.borderBlue : colors.textBlue,
          tailLength: Math.random() * 20 + 10,
          active: false,
          activationDelay: i * 300,
        })
      }
    }

    const animate = (time) => {
      if (!previousTimeRef.current) previousTimeRef.current = time
      const deltaTime = time - previousTimeRef.current
      previousTimeRef.current = time

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw dark city background
      ctx.fillStyle = `${colors.bgDark}90`
      ctx.fillRect(0, 0, width, height)

      // Update and draw city elements based on progress
      cityGridRef.current.forEach((element, index) => {
        // Activate elements based on progress and delay
        if (progress > 20 && time > element.activationDelay) {
          if (element.type === "building") {
            element.powered = true
          } else if (element.type === "node") {
            element.active = true
            element.connections.forEach((conn) => {
              if (time > element.activationDelay + 500) {
                conn.active = true
              }
            })
          } else if (element.type === "vehicle") {
            element.active = true
          }
        }

        // Draw and update based on element type
        if (element.type === "building") {
          // Draw building
          ctx.fillStyle = element.powered ? `${element.color}40` : `${colors.bgDark}80`
          ctx.fillRect(element.x, element.y, element.width, element.height)

          // Draw building outline
          ctx.strokeStyle = element.powered ? element.color : `${element.color}40`
          ctx.lineWidth = 1
          ctx.strokeRect(element.x, element.y, element.width, element.height)

          // Draw windows
          const windowWidth = element.width / 3
          const windowHeight = 10

          element.windows.forEach((window, wIndex) => {
            // Update window lighting
            if (element.powered) {
              if (time - window.lastBlink > 5000 * window.blinkRate) {
                window.lit = !window.lit
                window.lastBlink = time
              }
            }

            // Draw window
            const windowY = element.y + wIndex * 15 + 5

            // Left window
            ctx.fillStyle = element.powered && window.lit ? `${colors.textBlue}80` : `${colors.bgDark}60`
            ctx.fillRect(element.x + 2, windowY, windowWidth, windowHeight)

            // Right window
            ctx.fillRect(element.x + element.width - windowWidth - 2, windowY, windowWidth, windowHeight)
          })

          // Draw antenna on some buildings
          if (index % 5 === 0) {
            ctx.beginPath()
            ctx.moveTo(element.x + element.width / 2, element.y)
            ctx.lineTo(element.x + element.width / 2, element.y - 15)
            ctx.strokeStyle = element.powered ? colors.textBlue : `${colors.textBlue}40`
            ctx.stroke()

            // Blinking light on antenna
            if (element.powered && Math.sin(time * 0.005) > 0.7) {
              ctx.beginPath()
              ctx.arc(element.x + element.width / 2, element.y - 15, 2, 0, Math.PI * 2)
              ctx.fillStyle = colors.textBlue
              ctx.fill()
            }
          }
        } else if (element.type === "node") {
          if (element.active) {
            // Draw node
            ctx.beginPath()
            ctx.arc(element.x, element.y, element.size, 0, Math.PI * 2)
            ctx.fillStyle = element.color
            ctx.fill()

            // Draw connections
            element.connections.forEach((conn) => {
              if (conn.active) {
                const target = conn.target

                ctx.beginPath()
                ctx.moveTo(element.x, element.y)
                ctx.lineTo(target.x, target.y)
                ctx.strokeStyle = `${element.color}40`
                ctx.lineWidth = 0.5
                ctx.stroke()

                // Draw pulse along connection
                if (progress > 50) {
                  conn.pulsePosition += conn.pulseSpeed
                  if (conn.pulsePosition > 1) conn.pulsePosition = 0

                  const pulseX = element.x + (target.x - element.x) * conn.pulsePosition
                  const pulseY = element.y + (target.y - element.y) * conn.pulsePosition

                  ctx.beginPath()
                  ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2)
                  ctx.fillStyle = element.color
                  ctx.fill()
                }
              }
            })
          }
        } else if (element.type === "vehicle") {
          if (element.active) {
            // Update position
            element.x += element.speedX

            // Boundary check
            if (element.x < -20) element.x = width + 20
            if (element.x > width + 20) element.x = -20

            // Draw vehicle
            ctx.beginPath()
            ctx.arc(element.x, element.y, element.size, 0, Math.PI * 2)
            ctx.fillStyle = element.color
            ctx.fill()

            // Draw tail/light trail
            ctx.beginPath()
            ctx.moveTo(element.x, element.y)
            ctx.lineTo(element.x - element.speedX * element.tailLength, element.y)

            const gradient = ctx.createLinearGradient(
              element.x,
              element.y,
              element.x - element.speedX * element.tailLength,
              element.y,
            )
            gradient.addColorStop(0, element.color)
            gradient.addColorStop(1, `${element.color}00`)

            ctx.strokeStyle = gradient
            ctx.lineWidth = element.size / 2
            ctx.stroke()
          }
        }
      })

      // Draw mouse interaction effect (like a scanning beam)
      if (mousePosition.x && mousePosition.y && progress > 30) {
        ctx.beginPath()
        ctx.arc(mousePosition.x, mousePosition.y, 50, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(
          mousePosition.x,
          mousePosition.y,
          0,
          mousePosition.x,
          mousePosition.y,
          50,
        )
        gradient.addColorStop(0, `${colors.textBlue}40`)
        gradient.addColorStop(1, `${colors.textBlue}00`)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw scan lines
        ctx.beginPath()
        ctx.arc(mousePosition.x, mousePosition.y, 50, 0, Math.PI * 2)
        ctx.strokeStyle = colors.textBlue
        ctx.lineWidth = 0.5
        ctx.stroke()

        // Draw crosshair
        ctx.beginPath()
        ctx.moveTo(mousePosition.x - 10, mousePosition.y)
        ctx.lineTo(mousePosition.x + 10, mousePosition.y)
        ctx.moveTo(mousePosition.x, mousePosition.y - 10)
        ctx.lineTo(mousePosition.x, mousePosition.y + 10)
        ctx.strokeStyle = colors.textBlue
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(requestRef.current)
    }
  }, [mousePosition, colors, progress])

  // Progress simulation
  useEffect(() => {
    // Simulate loading progress with variable speed
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        // Slow down as we approach 100%
        const increment = prevProgress < 70 ? Math.random() * 10 : Math.random() * 5

        const newProgress = prevProgress + increment
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 200)

    // When progress reaches 100, trigger fade out animation
    if (progress >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        setShowLoader(false)
        if (onLoadComplete) onLoadComplete()
      }, 800)
    }

    return () => clearInterval(interval)
  }, [progress, onLoadComplete])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight

        // Reset city grid on resize for better performance
        cityGridRef.current = []
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!showLoader) return null

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 transition-opacity duration-700 overflow-hidden"
      style={{
        backgroundColor: colors.bgDark,
        opacity: progress >= 100 ? 0 : 1,
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Interactive city background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* City hologram effect */}
      <div className="relative w-64 h-64 mb-8 perspective-1000">
        <div
          className="absolute inset-0 animate-float"
          style={{
            transform: `rotateX(${mousePosition.y / 50}deg) rotateY(${mousePosition.x / 50}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* City hologram */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full relative" style={{ transform: "translateZ(20px)" }}>
              {/* City skyline silhouette */}
              <svg viewBox="0 0 400 200" className="w-full h-full">
                <defs>
                  <linearGradient id="skylineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={`${colors.textBlue}20`} />
                    <stop offset="100%" stopColor={`${colors.textBlue}80`} />
                  </linearGradient>
                </defs>

                {/* Base platform */}
                <rect x="50" y="180" width="300" height="20" fill={`${colors.borderBlue}40`} />

                {/* Buildings */}
                <path
                  d="M50,180 L50,120 L70,120 L70,100 L90,100 L90,140 L110,140 L110,80 
                     L130,80 L130,60 L150,60 L150,100 L170,100 L170,130 L190,130 L190,70 
                     L210,70 L210,40 L230,40 L230,90 L250,90 L250,120 L270,120 L270,60 
                     L290,60 L290,110 L310,110 L310,80 L330,80 L330,130 L350,130 L350,180"
                  fill="url(#skylineGradient)"
                  stroke={colors.textBlue}
                  strokeWidth="1"
                  className={progress > 30 ? "animate-pulse-slow" : ""}
                />

                {/* Windows (randomly placed) */}
                {progress > 40 &&
                  Array.from({ length: 40 }).map((_, i) => {
                    const x = 60 + (i % 10) * 30
                    const y = 90 + Math.floor(i / 10) * 30
                    const width = 5
                    const height = 8
                    const lit = Math.random() > 0.5

                    return (
                      <rect
                        key={i}
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={lit ? colors.textBlue : `${colors.textBlue}30`}
                        className={lit ? "animate-pulse-slow" : ""}
                      />
                    )
                  })}

                {/* Antennas */}
                {progress > 50 && (
                  <>
                    <line x1="210" y1="40" x2="210" y2="20" stroke={colors.borderBlue} strokeWidth="1" />
                    <circle cx="210" cy="20" r="2" fill={colors.textBlue} className="animate-pulse" />

                    <line x1="130" y1="60" x2="130" y2="40" stroke={colors.borderBlue} strokeWidth="1" />
                    <circle cx="130" cy="40" r="2" fill={colors.textBlue} className="animate-pulse" />

                    <line x1="270" y1="60" x2="270" y2="40" stroke={colors.borderBlue} strokeWidth="1" />
                    <circle cx="270" cy="40" r="2" fill={colors.textBlue} className="animate-pulse" />
                  </>
                )}

                {/* Flying vehicles */}
                {progress > 60 &&
                  Array.from({ length: 5 }).map((_, i) => {
                    const x = i * 80 + ((Date.now() / 1000) % 400)
                    const y = 30 + i * 10

                    return (
                      <g key={i} className="animate-pulse-slow">
                        <circle cx={x % 400} cy={y} r="2" fill={colors.textBlue} />
                        <line
                          x1={(x % 400) - 10}
                          y1={y}
                          x2={(x % 400) - 2}
                          y2={y}
                          stroke={`${colors.textBlue}80`}
                          strokeWidth="1"
                        />
                      </g>
                    )
                  })}

                {/* Grid overlay */}
                {progress > 20 &&
                  Array.from({ length: 10 }).map((_, i) => (
                    <line
                      key={`h${i}`}
                      x1="50"
                      y1={40 + i * 16}
                      x2="350"
                      y2={40 + i * 16}
                      stroke={`${colors.borderBlue}30`}
                      strokeWidth="0.5"
                      strokeDasharray="5,5"
                    />
                  ))}

                {progress > 20 &&
                  Array.from({ length: 10 }).map((_, i) => (
                    <line
                      key={`v${i}`}
                      x1={50 + i * 30}
                      y1="40"
                      x2={50 + i * 30}
                      y2="180"
                      stroke={`${colors.borderBlue}30`}
                      strokeWidth="0.5"
                      strokeDasharray="5,5"
                    />
                  ))}

                {/* City name */}
                <text
                  x="200"
                  y="160"
                  textAnchor="middle"
                  fill={colors.textBlue}
                  fontSize="12"
                  fontWeight="bold"
                  style={{
                    filter: `drop-shadow(0 0 2px ${colors.textBlue})`,
                    textShadow: `0 0 5px ${colors.textBlue}`,
                  }}
                >
                  TECHTOPIA CITY
                </text>
              </svg>
            </div>
          </div>

          {/* Circular platform with rotating elements */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full relative">
              {/* Outer ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-dashed animate-spin"
                style={{
                  borderColor: colors.borderBlue,
                  animationDuration: "20s",
                  opacity: 0.5,
                }}
              />

              {/* Inner ring */}
              <div
                className="absolute inset-8 rounded-full border-2 border-dotted animate-spin"
                style={{
                  borderColor: colors.textBlue,
                  animationDuration: "15s",
                  animationDirection: "reverse",
                  opacity: 0.5,
                }}
              />

              {/* Coordinate markers */}
              {progress > 30 &&
                Array.from({ length: 8 }).map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2
                  const radius = 120
                  const x = Math.cos(angle) * radius + 128
                  const y = Math.sin(angle) * radius + 128

                  return (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-blue-400"
                      style={{
                        left: x,
                        top: y,
                        backgroundColor: colors.textBlue,
                      }}
                    />
                  )
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Futuristic progress bar */}
      <div className="w-80 mb-4 relative">
        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden flex">
          <div
            className="h-full transition-all duration-200 ease-out relative"
            style={{
              width: `${progress}%`,
              backgroundColor: colors.textBlue,
              boxShadow: `0 0 10px ${colors.textBlue}, 0 0 20px ${colors.textBlue}`,
            }}
          />
        </div>

        {/* Progress markers */}
        <div className="w-full flex justify-between mt-1">
          {[0, 25, 50, 75, 100].map((marker) => (
            <div
              key={marker}
              className="relative"
              style={{
                opacity: progress >= marker ? 1 : 0.3,
                transition: "opacity 0.3s ease",
              }}
            >
              <div
                className="w-1 h-3 rounded-full"
                style={{
                  backgroundColor: progress >= marker ? colors.textBlue : colors.borderBlue,
                  boxShadow: progress >= marker ? `0 0 5px ${colors.textBlue}` : "none",
                }}
              />
              <span
                className="absolute -left-2 top-4 text-xs font-mono"
                style={{
                  color: colors.textBlue,
                  textShadow: progress >= marker ? `0 0 5px ${colors.textBlue}` : "none",
                }}
              >
                {marker}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic loading text with glitch effect */}
      <div className="relative overflow-hidden mb-8">
        <div
          className="text-2xl font-bold font-mono relative overflow-hidden px-4 py-2 rounded-md"
          style={{
            color: colors.textBlue,
            textShadow: `0 0 5px ${colors.textBlue}, 0 0 10px ${colors.textBlue}`,
            backgroundColor: `${colors.bgDark}80`,
            borderLeft: `2px solid ${colors.borderBlue}`,
            borderRight: `2px solid ${colors.borderBlue}`,
            boxShadow: `0 0 15px ${colors.bgDark}`,
          }}
        >
          <span className="inline-block">INITIALIZING TECHTOPIA CITY {Math.floor(progress)}%</span>

          {/* Glitch overlay */}
          <span
            className="absolute inset-0 overflow-hidden"
            style={{
              color: "#ff00ff",
              left: "2px",
              top: "0",
              clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)",
              opacity: Math.random() > 0.9 ? 0.8 : 0,
              textShadow: "0 0 5px #ff00ff",
            }}
          >
            INITIALIZING TECHTOPIA CITY {Math.floor(progress)}%
          </span>

          <span
            className="absolute inset-0 overflow-hidden"
            style={{
              color: "#00ffff",
              left: "-2px",
              top: "0",
              clipPath: "polygon(0 55%, 100% 55%, 100% 100%, 0 100%)",
              opacity: Math.random() > 0.9 ? 0.8 : 0,
              textShadow: "0 0 5px #00ffff",
            }}
          >
            INITIALIZING TECHTOPIA CITY {Math.floor(progress)}%
          </span>
        </div>

        {/* Scanning line effect */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, transparent, ${colors.textBlue}80, transparent)`,
            height: "2px",
            top: `${(Math.sin(Date.now() * 0.005) * 0.5 + 0.5) * 100}%`,
            animation: "scan 2s linear infinite",
          }}
        />
      </div>

      {/* Loading status messages - City themed */}
      <div
        className="w-80 h-24 overflow-hidden font-mono text-xs rounded-md p-2 mb-4"
        style={{
          backgroundColor: `${colors.bgDark}90`,
          color: colors.textBlue,
          border: `1px solid ${colors.borderBlue}`,
          boxShadow: `0 0 10px ${colors.bgDark}`,
        }}
      >
        {progress > 10 && <div className="mb-1">$ Initializing city infrastructure...</div>}
        {progress > 20 && (
          <div className="mb-1">
            $ Connecting smart grid network... <span className="animate-pulse">■</span>
          </div>
        )}
        {progress > 30 && <div className="mb-1">$ Activating traffic management systems...</div>}
        {progress > 40 && <div className="mb-1">$ Powering up city buildings...</div>}
        {progress > 50 && <div className="mb-1">$ Syncing urban IoT devices...</div>}
        {progress > 60 && <div className="mb-1">$ Calibrating autonomous transport...</div>}
        {progress > 70 && <div className="mb-1">$ Enabling public WiFi networks...</div>}
        {progress > 80 && <div className="mb-1">$ Activating security protocols...</div>}
        {progress > 90 && (
          <div className="mb-1">
            $ Launching TechTopia City environment... <span className="animate-pulse">■</span>
          </div>
        )}
        {progress >= 100 && <div className="text-green-400">$ City systems online. Welcome to TechTopia City.</div>}
      </div>

      {/* City map decorative element */}
      <div className="absolute bottom-4 left-4 w-32 h-32 opacity-50">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* City grid/map */}
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            stroke={colors.borderBlue}
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />

          {/* Main roads */}
          <line x1="10" y1="50" x2="90" y2="50" stroke={colors.borderBlue} strokeWidth="1" />
          <line x1="50" y1="10" x2="50" y2="90" stroke={colors.borderBlue} strokeWidth="1" />

          {/* Secondary roads */}
          <line x1="10" y1="30" x2="90" y2="30" stroke={colors.borderBlue} strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="10" y1="70" x2="90" y2="70" stroke={colors.borderBlue} strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="30" y1="10" x2="30" y2="90" stroke={colors.borderBlue} strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="70" y1="10" x2="70" y2="90" stroke={colors.borderBlue} strokeWidth="0.5" strokeDasharray="2,2" />

          {/* City blocks/buildings */}
          <rect
            x="20"
            y="20"
            width="20"
            height="20"
            fill={`${colors.textBlue}20`}
            stroke={colors.borderBlue}
            strokeWidth="0.5"
          />
          <rect
            x="60"
            y="20"
            width="20"
            height="20"
            fill={`${colors.textBlue}20`}
            stroke={colors.borderBlue}
            strokeWidth="0.5"
          />
          <rect
            x="20"
            y="60"
            width="20"
            height="20"
            fill={`${colors.textBlue}20`}
            stroke={colors.borderBlue}
            strokeWidth="0.5"
          />
          <rect
            x="60"
            y="60"
            width="20"
            height="20"
            fill={`${colors.textBlue}20`}
            stroke={colors.borderBlue}
            strokeWidth="0.5"
          />

          {/* City center */}
          <circle cx="50" cy="50" r="5" fill={`${colors.textBlue}40`} stroke={colors.textBlue} strokeWidth="0.5" />

          {/* Moving dot (like a vehicle) */}
          <circle
            cx={50 + Math.cos(Date.now() * 0.001) * 20}
            cy={50 + Math.sin(Date.now() * 0.001) * 20}
            r="1"
            fill={colors.textBlue}
          />
        </svg>
      </div>

      {/* City stats decorative element */}
      <div className="absolute bottom-4 right-4 w-32 h-32 opacity-50">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* City stats display */}
          <rect x="10" y="10" width="80" height="80" stroke={colors.borderBlue} strokeWidth="0.5" />

          {/* Stats bars */}
          {[0, 1, 2, 3, 4].map((i) => {
            const height = 10 + (progress / 100) * (i % 3 === 0 ? 50 : i % 3 === 1 ? 40 : 30)
            return (
              <rect
                key={i}
                x={20 + i * 15}
                y={90 - height}
                width="10"
                height={height}
                fill={`${colors.textBlue}${40 + i * 10}`}
                stroke={colors.borderBlue}
                strokeWidth="0.5"
              />
            )
          })}

          {/* Labels */}
          <text x="15" y="95" fill={colors.textBlue} fontSize="4">
            ENERGY
          </text>
          <text x="30" y="95" fill={colors.textBlue} fontSize="4">
            TRAFFIC
          </text>
          <text x="45" y="95" fill={colors.textBlue} fontSize="4">
            SAFETY
          </text>
          <text x="60" y="95" fill={colors.textBlue} fontSize="4">
            COMMS
          </text>
          <text x="75" y="95" fill={colors.textBlue} fontSize="4">
            TECH
          </text>
        </svg>
      </div>

      <div className="absolute top-4 left-4 text-xs font-mono opacity-70" style={{ color: colors.textBlue }}>
        CITY SYSTEMS: INITIALIZING
      </div>

      <div className="absolute top-4 right-4 text-xs font-mono opacity-70" style={{ color: colors.textBlue }}>
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  )
}

