'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { MealType } from '@/types/database';
import { Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { SelectedFoodForm } from './SelectedFoodForm';
import type { FoodSearchResult } from '../types';

interface FoodSearchProps {
  mealType: MealType;
  loggedOn: string;
  onSuccess: () => void;
  onClose?: () => void;
}

export function FoodSearch({ mealType, loggedOn, onSuccess, onClose }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/foods/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        } else {
          setError('Failed to fetch food search results.');
        }
      } catch (err) {
        console.error('Food search failed:', err);
        setError('Network error while searching foods.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  function handleSuccess() {
    setSelectedFood(null);
    setQuery('');
    setResults([]);
    onSuccess();
    if (onClose) onClose();
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search food (e.g. roti, dal, banana, oats, paneer)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          autoFocus
        />
        {loading && (
          <Loader2 className="absolute right-3.5 top-3.5 h-4 w-4 text-emerald-600 animate-spin" />
        )}
      </div>

      {error && (
        <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected Food Logging Form */}
      {selectedFood && (
        <SelectedFoodForm
          selectedFood={selectedFood}
          mealType={mealType}
          loggedOn={loggedOn}
          initialGrams={selectedFood.serving_grams || 100}
          onSuccess={handleSuccess}
          onCancel={() => setSelectedFood(null)}
          onClose={onClose}
        />
      )}

      {/* Search Results List */}
      {!selectedFood && results.length > 0 && (
        <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
          {results.map((food, idx) => (
            <button
              key={`${food.name}-${idx}`}
              onClick={() => setSelectedFood(food)}
              className="w-full text-left p-3 hover:bg-emerald-50/50 flex justify-between items-center transition-colors text-sm"
            >
              <div className="truncate pr-2">
                <span className="font-medium text-gray-900 block truncate">{food.name}</span>
                <span className="text-xs text-gray-500">
                  {food.serving_desc} • P:{food.protein_g}g C:{food.carbs_g}g F:{food.fat_g}g
                </span>
                {food.source === 'openfoodfacts' && (
                  <span className="block text-[10px] text-gray-400 mt-0.5">
                    Source:{' '}
                    <a
                      href="https://world.openfoodfacts.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Open Food Facts (ODbL)
                    </a>
                  </span>
                )}
              </div>
              <div className="shrink-0 text-right">
                <span className="font-semibold text-emerald-600 text-xs">
                  {Math.round(food.calories_per_100g)} kcal
                </span>
                <span className="block text-[10px] text-gray-400">/ 100g</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results prompt */}
      {!selectedFood && query.length >= 2 && !loading && results.length === 0 && (
        <div className="text-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <p className="text-sm text-gray-600">No matching food items found.</p>
          <Link
            href="/foods/custom"
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <Sparkles className="h-3.5 w-3.5" /> Create a custom food item
          </Link>
        </div>
      )}

      {/* Custom food footer link */}
      <div className="pt-2 border-t border-gray-100 text-center">
        <Link
          href="/foods/custom"
          className="text-xs text-gray-500 hover:text-emerald-600 font-medium inline-flex items-center gap-1"
        >
          Can&apos;t find what you need? <span className="underline">Add a custom food</span>
        </Link>
      </div>
    </div>
  );
}
