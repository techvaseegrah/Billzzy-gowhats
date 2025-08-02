// FadeInFadeOutIcons.tsx

import React from "react";

/**
 * This component will cycle through 18 GIF icons (paths included below).
 * Each icon will fade in/out every 3 seconds using Tailwind transitions.
 */
export default function FadeInFadeOutIcons() {
  // 1. All icon paths (1.gif through 18.gif)
  const icons = [
    "/Icons_files/1.gif",
    "/Icons_files/2.gif",
    "/Icons_files/3.gif",
    "/Icons_files/4.gif",
    "/Icons_files/5.gif",
    "/Icons_files/6.gif",
    "/Icons_files/7.gif",
    "/Icons_files/8.gif",
    "/Icons_files/9.gif",
    "/Icons_files/10.gif",
    "/Icons_files/11.gif",
    "/Icons_files/12.gif",
    "/Icons_files/13.gif",
    "/Icons_files/14.gif",
    "/Icons_files/15.gif",
    "/Icons_files/16.gif",
    "/Icons_files/17.gif",
    "/Icons_files/18.gif",
  ];

  // 2. Use React state to keep track of which icon is currently visible
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // 3. Cycle through icons every 3 seconds
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % icons.length);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [icons.length]);

  return (
    <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 bg-transparent overflow-hidden">
      {icons.map((iconSrc, i) => (
        <img
          key={iconSrc}
          src={iconSrc}
          alt={`Icon ${i + 1}`}
          className={`
            absolute top-0 left-0 w-full h-full 
            object-contain bg-transparent
            transition-opacity duration-1000 
            ${currentIndex === i ? "opacity-100" : "opacity-0"}
          `}
        />
      ))}
    </div>
  );
}
