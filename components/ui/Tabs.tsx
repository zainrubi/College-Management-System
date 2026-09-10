"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultActiveId?: string;
  activeId?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({
  tabs,
  defaultActiveId,
  activeId: controlledActiveId,
  onChange,
  className,
}: TabsProps) {
  const [internalActiveId, setInternalActiveId] = useState(
    defaultActiveId || tabs[0]?.id
  );

  const activeId = controlledActiveId ?? internalActiveId;

  const handleTabClick = (id: string) => {
    if (!controlledActiveId) setInternalActiveId(id);
    if (onChange) onChange(id);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-none",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-colors border-b-2 whitespace-nowrap cursor-pointer",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            )}
          >
            {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                  isActive
                    ? "bg-primary-light text-primary"
                    : "bg-background-secondary text-text-secondary"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
