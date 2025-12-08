"use client";

import * as React from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BookFiltersProps {
  filters: {
    categories: string[];
    conditions: string[];
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

const CATEGORIES = [
  "Fiction",
  "Non-fiction",
  "Education",
  "Comics",
  "Sci-Fi",
  "Mystery",
  "Fantasy",
  "Romance",
  "Thriller",
  "Biography",
  "Self-Help",
  "History",
  "Other"
];
const CONDITIONS = ["New", "Good", "Used"];

export function BookFilters({ filters, onFiltersChange, onClearFilters }: BookFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const activeFilterCount = 
    filters.categories.length + 
    filters.conditions.length;

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const toggleCondition = (condition: string) => {
    const newConditions = filters.conditions.includes(condition)
      ? filters.conditions.filter((c) => c !== condition)
      : [...filters.conditions, condition];
    onFiltersChange({ ...filters, conditions: newConditions });
  };



  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center justify-between">
          Category
          {filters.categories.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {filters.categories.length}
            </Badge>
          )}
        </h3>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <label
              key={category}
              className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded"
            >
              <input
                type="checkbox"
                checked={filters.categories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <span className="text-sm">{category}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Condition Filter */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center justify-between">
          Condition
          {filters.conditions.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {filters.conditions.length}
            </Badge>
          )}
        </h3>
        <div className="space-y-2">
          {CONDITIONS.map((condition) => (
            <label
              key={condition}
              className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-2 rounded"
            >
              <input
                type="checkbox"
                checked={filters.conditions.includes(condition)}
                onChange={() => toggleCondition(condition)}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <span className="text-sm">{condition}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />



      {/* Clear All Filters */}
      {activeFilterCount > 0 && (
        <>
          <Separator />
          <Button
            type="button"
            variant="outline"
            onClick={onClearFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters ({activeFilterCount})
          </Button>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>



      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
          <div
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
