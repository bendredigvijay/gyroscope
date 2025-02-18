import React, { useState, useEffect, useRef } from "react";
import "./index.css";

const GyroScope = ({ heading = 10, rateOfTurn = 10 }) => {
  const [currentHeading, setCurrentHeading] = useState(0);
  const animationRef = useRef(null);

  // Normalize the target heading within 0-360 degrees
  const normalizedTargetHeading =
    heading % 360 < 0 ? (heading % 360) + 360 : heading % 360;

  useEffect(() => {
    let startTime = null;
    const animationDuration = 10000; // Animation duration in milliseconds
    const startHeading = currentHeading;

    // Calculate the shortest path between headings
    let diff = normalizedTargetHeading - startHeading;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / animationDuration;

      if (progress < 1) {
        // Ease-out animation for smooth transition
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const newHeading = startHeading + diff * easeProgress;
        const normalized =
          newHeading % 360 < 0 ? (newHeading % 360) + 360 : newHeading % 360;
        setCurrentHeading(normalized);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentHeading(normalizedTargetHeading);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [normalizedTargetHeading]);

  const containerStyle = {
    width: "100%",
    height: "100%",
    maxWidth: "600px",
    margin: "0 auto",
    padding: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    aspectRatio: "1",
  };

  const svgStyle = {
    width: "100%",
    height: "100%",
    display: "block",
    maxHeight: "100vh",
  };

  // Style for inner texts (should be white)
  const textStyleWhite = {
    fontFamily: "Arial",
    fontWeight: "bold",
    fill: "white",
  };

  // Style for outer degree numbers (should be black)
  const textStyleBlack = {
    fontFamily: "Arial",
    fontWeight: "bold",
    fill: "black",
  };

  return (
    <div style={containerStyle}>
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <svg
          viewBox="0 0 500 500"
          style={svgStyle}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background Circle */}
          <circle cx="250" cy="250" r="220" fill="black" />

          {/* Rotating Scale */}
          <g
            style={{
              transform: `rotate(${-currentHeading}deg)`,
              transformOrigin: "250px 250px",
            }}
          >
            {Array.from({ length: 360 }, (_, i) => {
              const angle = i;
              const isMainTick = angle % 30 === 0;
              const isMediumTick = angle % 10 === 0;
              const innerRadius = isMainTick ? 190 : isMediumTick ? 195 : 200;
              const outerRadius = isMainTick ? 220 : isMediumTick ? 215 : 210;
              const textRadius = 235;

              const x1 = 250 + innerRadius * Math.sin((angle * Math.PI) / 180);
              const y1 = 250 - innerRadius * Math.cos((angle * Math.PI) / 180);
              const x2 = 250 + outerRadius * Math.sin((angle * Math.PI) / 180);
              const y2 = 250 - outerRadius * Math.cos((angle * Math.PI) / 180);
              const textX =
                250 + textRadius * Math.sin((angle * Math.PI) / 180);
              const textY =
                250 - textRadius * Math.cos((angle * Math.PI) / 180);

              return (
                <g key={angle}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="white"
                    strokeWidth={
                      isMainTick ? "1.5" : isMediumTick ? "1" : "0.5"
                    }
                  />
                  {isMainTick && (
                    <g transform={`translate(${textX},${textY})`}>
                      <text
                        className="gyro-text"
                        style={textStyleBlack} // Outer numbers remain black
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${currentHeading})`}
                      >
                        {angle}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Fixed Arrow */}
          <path
            d="M250,70 L240,90 L260,90 Z"
            fill="red"
            stroke="red"
            strokeWidth="1"
          />

          {/* Display Panel */}
          <g>
            {/* Gyro Heading Text (White) */}
            <text x="250" y="200" textAnchor="middle" style={textStyleWhite} fontSize="20">
              GYRO HEADING
            </text>

            {/* Current Heading Display Box */}
            <path d="M180,220 L320,220 L310,270 L190,270 Z" fill="black" stroke="white" strokeWidth="2" />

            {/* Current Heading Text (White) */}
            <text x="250" y="260" textAnchor="middle" style={textStyleWhite} fontSize="36">
              {Math.round(currentHeading)}°
            </text>

            {/* Rate of Turn Box */}
            <rect x="190" y="275" width="120" height="50" fill="black" stroke="white" strokeWidth="2" />

            {/* Rate of Turn Value (White) */}
            <text x="250" y="305" textAnchor="middle" style={textStyleWhite} fontSize="20">
              {(rateOfTurn ?? 0).toFixed(1)}°/MIN
            </text>

            {/* Rate of Turn Label (White) */}
            <text x="250" y="350" textAnchor="middle" style={textStyleWhite} fontSize="18">
              RATE OF TURN
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default GyroScope;
