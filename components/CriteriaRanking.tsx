"use client";

import { useLayoutEffect, useRef, useState, type DragEvent, type MouseEvent } from "react";
import { CriterionKey, CRITERIA_CONFIG } from "@/lib/criteria-config";

interface CriteriaRankingProps {
  orderedKeys: CriterionKey[];
  onReorder: (newOrder: CriterionKey[]) => void;
  interactive: boolean;
}

function getCriterionLabel(key: CriterionKey) {
  return CRITERIA_CONFIG.find(criterion => criterion.key === key)?.label || key;
}

export function CriteriaRanking({ orderedKeys, onReorder, interactive }: CriteriaRankingProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [movedKey, setMovedKey] = useState<CriterionKey | null>(null);
  const keyboardButton = useRef<HTMLButtonElement | null>(null);

  useLayoutEffect(() => {
    const button = keyboardButton.current;
    if (!button) return;
    // Moving a DOM node can drop focus. At either end, focus the available direction.
    const next = button.disabled ? button.parentElement?.querySelector<HTMLButtonElement>("button:enabled") : button;
    next?.focus();
    keyboardButton.current = null;
  }, [orderedKeys]);

  const move = (from: number, to: number) => {
    if (from === to) return;
    const newOrder = [...orderedKeys];
    const [key] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, key);
    onReorder(newOrder);
    setMovedKey(key);
  };

  const moveWithButton = (event: MouseEvent<HTMLButtonElement>, from: number, to: number) => {
    if (event.detail === 0) keyboardButton.current = event.currentTarget;
    move(from, to);
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null) return;

    move(draggedIndex, dropIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600 mb-3">
        Put your highest priority first. Use the arrows or drag a priority to move it.
        Each position carries twice the weight of the one below.
        The weighted average of the eight grades gives the overall score out of 100.
      </div>
      {orderedKeys.map((key, index) => (
        <div
          key={key}
          draggable={interactive}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            flex items-center gap-2 px-2 py-3 sm:gap-3 sm:px-3 bg-white border rounded-lg cursor-move
            transition-all duration-150
            ${draggedIndex === index ? "opacity-40" : "opacity-100"}
            ${dragOverIndex === index ? "border-blue-500 border-2" : "border-gray-200"}
            hover:shadow-md hover:border-gray-300
          `}
        >
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 flex-1">
            <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold text-sm">
              {index + 1}
            </div>
            <span className="min-w-0 wrap-break-word font-medium text-gray-900">{getCriterionLabel(key)}</span>
          </div>
          <div className="flex shrink-0 gap-1">
            {(["up", "down"] as const).map(direction => {
              const destination = index + (direction === "up" ? -1 : 1);
              return (
                <button
                  key={direction}
                  type="button"
                  aria-label={"Move " + getCriterionLabel(key) + " " + direction}
                  disabled={!interactive || destination < 0 || destination >= orderedKeys.length}
                  onClick={event => moveWithButton(event, index, destination)}
                  className="h-11 w-11 rounded-md border border-gray-300 bg-white text-xl text-gray-800 enabled:hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:opacity-30"
                >
                  {direction === "up" ? "↑" : "↓"}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="sr-only" role="status">
        {movedKey && getCriterionLabel(movedKey) + " moved to " + (orderedKeys.indexOf(movedKey) + 1) + " of " + orderedKeys.length + "."}
      </p>
    </div>
  );
}
