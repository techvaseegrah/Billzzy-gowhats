import React from "react";

export default function IconsMarquee() {
  // Adjust the total number (18) to however many icons you have
  const icons = Array.from({ length: 18 }, (_, i) => `/Icons_files/${i + 1}.gif`);

  return (
    <div className="overflow-hidden relative h-32 md:h-40 lg:h-48">
      {/* First copy of icons */}
      <div className="flex animate-marquee space-x-8 h-full w-[200%]">
        {icons.map((iconSrc, idx) => (
          <img
            key={`icon-${idx}`}
            src={iconSrc}
            alt={`Icon ${idx + 1}`}
            className="h-full w-auto bg-transparent"
          />
        ))}
        {/* Duplicate the set so the marquee loops seamlessly */}
        {icons.map((iconSrc, idx) => (
          <img
            key={`icon-2-${idx}`}
            src={iconSrc}
            alt={`Icon ${idx + 1}`}
            className="h-full w-auto bg-transparent"
          />
        ))}
      </div>
    </div>
  );
}
