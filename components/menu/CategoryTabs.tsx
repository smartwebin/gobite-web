import { motion } from "framer-motion";
import React from "react";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onSelect,
}: CategoryTabsProps) {
  return (
    <div className="bg-bgLight border-b border-borderLite sticky top-[65px] z-30 shadow-sm overflow-x-auto no-scrollbar">
      <div className="flex px-4 py-2 gap-2 min-w-max">
        {categories.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              onClick={() => onSelect(category)}
              className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                isActive ? "text-white" : "text-inkMid hover:bg-gray-100"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-primary rounded-full shadow-md"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
