"use client";

import { ReactNode, useState, useRef, useEffect } from "react";

interface CategoryTooltipProps {
  notes: string;
  sources: string[];
  children: ReactNode;
}

export function CategoryTooltip({ notes, sources, children }: CategoryTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);

  return (
    <div
      ref={tooltipRef}
      className="relative inline-block"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
      >
        {children}
      </div>
      {isVisible && (
        <div className="fixed z-[100] w-80 p-4 bg-gray-900 text-white text-xs rounded-lg shadow-xl"
          style={{
            top: tooltipRef.current ? `${tooltipRef.current.getBoundingClientRect().top - 10}px` : '0',
            left: tooltipRef.current ? `${Math.min(tooltipRef.current.getBoundingClientRect().left, window.innerWidth - 340)}px` : '0',
            transform: 'translateY(-100%)',
          }}
        >
          <div className="mb-2">
            <p className="leading-relaxed">{notes}</p>
          </div>
          {sources.length > 0 && (
            <div className="pt-2 border-t border-gray-700">
              <p className="font-semibold mb-1">Sources:</p>
              <ul className="space-y-1">
                {sources.map((source, idx) => (
                  <li key={idx} className="break-all">
                    <a
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {new URL(source).hostname}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Arrow pointing down */}
          <div className="absolute top-full left-4">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
