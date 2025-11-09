"use client";

import { useState, DragEvent } from "react";
import { CriterionKey, CRITERIA_CONFIG } from "@/lib/criteria-config";

interface CriteriaRankingProps {
  orderedKeys: CriterionKey[];
  onReorder: (newOrder: CriterionKey[]) => void;
}

export function CriteriaRanking({ orderedKeys, onReorder }: CriteriaRankingProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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

    const newOrder = [...orderedKeys];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);

    onReorder(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getCriterionLabel = (key: CriterionKey) => {
    return CRITERIA_CONFIG.find(c => c.key === key)?.label || key;
  };

  return (
    <div className="space-y-2">
      <div className="text-sm text-gray-600 mb-3">
        Drag to reorder by importance (top = most important)
      </div>
      {orderedKeys.map((key, index) => (
        <div
          key={key}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            flex items-center gap-3 p-3 bg-white border rounded-lg cursor-move
            transition-all duration-150
            ${draggedIndex === index ? "opacity-40" : "opacity-100"}
            ${dragOverIndex === index ? "border-blue-500 border-2" : "border-gray-200"}
            hover:shadow-md hover:border-gray-300
          `}
        >
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold text-sm">
              {index + 1}
            </div>
            <span className="font-medium text-gray-900">{getCriterionLabel(key)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
