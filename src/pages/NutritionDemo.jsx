import React, { useState } from 'react';
import { Apple, Plus, Search, Star, Clock, Trash2, Edit2 } from 'lucide-react';

// Demo component to showcase the Nutrition Tracker UI without authentication
const NutritionDemo = () => {
  const [view, setView] = useState('tracker');
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showSavedFoodForm, setShowSavedFoodForm] = useState(false);

  // Demo data
  const demoMealEntries = [
    { id: 1, name: 'Chicken Breast (4oz)', protein: 35, carbs: 0, fats: 4, calories: 184, meal: 'breakfast' },
    { id: 2, name: 'Brown Rice (1 cup)', protein: 5, carbs: 45, fats: 2, calories: 216, meal: 'breakfast' },
    { id: 3, name: 'Salmon (6oz)', protein: 40, carbs: 0, fats: 15, calories: 310, meal: 'lunch' },
  ];

  const demoSavedFoods = [
    { id: 1, name: 'Chicken Breast (4oz)', protein: 35, carbs: 0, fats: 4, calories: 184, isFavorite: true },
    { id: 2, name: 'Brown Rice (1 cup)', protein: 5, carbs: 45, fats: 2, calories: 216, isFavorite: true },
    { id: 3, name: 'Salmon (6oz)', protein: 40, carbs: 0, fats: 15, calories: 310, isFavorite: false },
    { id: 4, name: 'Greek Yogurt (1 cup)', protein: 20, carbs: 10, fats: 5, calories: 170, isFavorite: true },
    { id: 5, name: 'Banana', protein: 1.3, carbs: 27, fats: 0.4, calories: 105, isFavorite: false },
  ];

  const getDailyTotals = () => {
    return demoMealEntries.reduce((totals, entry) => ({
      protein: totals.protein + entry.protein,
      carbs: totals.carbs + entry.carbs,
      fats: totals.fats + entry.fats,
      calories: totals.calories + entry.calories
    }), { protein: 0, carbs: 0, fats: 0, calories: 0 });
  };

  const getMealEntries = (meal) => {
    return demoMealEntries.filter(entry => entry.meal === meal);
  };

  const dailyTotals = getDailyTotals();
  const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Apple className="w-8 h-8 text-green-600" />
            </div>
            Nutrition Tracker - Demo
          </h1>
          <p className="text-gray-600 mt-2">Track your daily nutrition and manage saved foods</p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setView('tracker')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'tracker'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Daily Tracker
          </button>
          <button
            onClick={() => setView('savedFoods')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === 'savedFoods'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Saved Foods
          </button>
        </div>

        {view === 'tracker' ? (
          <div className="grid gap-6">
            {/* Daily Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Today's Summary</h2>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border-2 bg-blue-50 text-blue-700 border-blue-200">
                  <p className="text-xs font-medium uppercase tracking-wide opacity-75 mb-1">Protein</p>
                  <p className="text-2xl font-bold">
                    {dailyTotals.protein.toFixed(1)}
                    <span className="text-sm font-normal ml-1">g</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg border-2 bg-orange-50 text-orange-700 border-orange-200">
                  <p className="text-xs font-medium uppercase tracking-wide opacity-75 mb-1">Carbs</p>
                  <p className="text-2xl font-bold">
                    {dailyTotals.carbs.toFixed(1)}
                    <span className="text-sm font-normal ml-1">g</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg border-2 bg-purple-50 text-purple-700 border-purple-200">
                  <p className="text-xs font-medium uppercase tracking-wide opacity-75 mb-1">Fats</p>
                  <p className="text-2xl font-bold">
                    {dailyTotals.fats.toFixed(1)}
                    <span className="text-sm font-normal ml-1">g</span>
                  </p>
                </div>
                <div className="p-4 rounded-lg border-2 bg-green-50 text-green-700 border-green-200">
                  <p className="text-xs font-medium uppercase tracking-wide opacity-75 mb-1">Calories</p>
                  <p className="text-2xl font-bold">
                    {dailyTotals.calories.toFixed(1)}
                    <span className="text-sm font-normal ml-1">cal</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Meal Logging Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Log Meal</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowQuickAdd(!showQuickAdd)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Star className="w-4 h-4" />
                    Quick Add
                  </button>
                  <button
                    onClick={() => setShowManualEntry(!showManualEntry)}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Manual Entry
                  </button>
                </div>
              </div>

              {/* Meal Type Selector */}
              <div className="flex gap-2 mb-4">
                {meals.map(meal => (
                  <button
                    key={meal}
                    onClick={() => setSelectedMeal(meal)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                      selectedMeal === meal
                        ? 'bg-green-100 text-green-700 border-2 border-green-500'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {meal}
                  </button>
                ))}
              </div>

              {/* Manual Entry Form */}
              {showManualEntry && (
                <div className="border-t pt-4 mt-4">
                  <form className="space-y-4">
                    <div>
                      <label className="block font-medium mb-2 text-gray-700 text-sm">Food Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Chicken Breast"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          <span className="font-semibold text-blue-600">P:</span> Protein (g)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          <span className="font-semibold text-orange-600">C:</span> Carbs (g)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          <span className="font-semibold text-purple-600">F:</span> Fats (g)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          <span className="font-semibold text-green-600">Cal:</span> Calories
                        </label>
                        <input
                          type="number"
                          step="1"
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowManualEntry(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Entry
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Quick Add Panel */}
              {showQuickAdd && (
                <div className="border-t pt-4 mt-4">
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search saved foods..."
                        className="w-full pl-10 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recently Used
                    </h4>
                    <div className="space-y-2">
                      {demoSavedFoods.slice(0, 3).map(food => (
                        <button
                          key={food.id}
                          className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors flex items-center justify-between group"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{food.name}</p>
                            <p className="text-xs text-gray-600">
                              P: {food.protein}g • C: {food.carbs}g • F: {food.fats}g • {food.calories} cal
                            </p>
                          </div>
                          <Plus className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Meal Entries */}
              <div className="space-y-4 mt-4">
                <h3 className="font-medium text-gray-900 capitalize">{selectedMeal} Entries</h3>
                {getMealEntries(selectedMeal).length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">No entries for {selectedMeal} yet</p>
                  </div>
                ) : (
                  getMealEntries(selectedMeal).map(entry => (
                    <div key={entry.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{entry.name}</p>
                        <p className="text-sm text-gray-600">
                          <span className="text-blue-600">P: {entry.protein}g</span> • 
                          <span className="text-orange-600"> C: {entry.carbs}g</span> • 
                          <span className="text-purple-600"> F: {entry.fats}g</span> • 
                          <span className="text-green-600"> {entry.calories} cal</span>
                        </p>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Saved Foods View */
          <div className="space-y-6">
            {/* Search and Add */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search saved foods..."
                    className="w-full pl-10 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
                <button
                  onClick={() => setShowSavedFoodForm(!showSavedFoodForm)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add Food
                </button>
              </div>

              {showSavedFoodForm && (
                <div className="border-t pt-4 mt-4">
                  <form className="space-y-4">
                    <div>
                      <label className="block font-medium mb-2 text-gray-700 text-sm">Food Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Chicken Breast (4oz)"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          <span className="font-semibold text-blue-600">P:</span> Protein (g)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          <span className="font-semibold text-orange-600">C:</span> Carbs (g)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          <span className="font-semibold text-purple-600">F:</span> Fats (g)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium">
                          <span className="font-semibold text-green-600">Cal:</span> Calories
                        </label>
                        <input
                          type="number"
                          step="1"
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Mark as favorite</span>
                      </label>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowSavedFoodForm(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Save Food
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Saved Foods List */}
            <div className="grid gap-4">
              {demoSavedFoods.map(food => (
                <div key={food.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">{food.name}</h3>
                        {food.isFavorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-blue-600">P: {food.protein}g</span>
                        <span className="text-orange-600">C: {food.carbs}g</span>
                        <span className="text-purple-600">F: {food.fats}g</span>
                        <span className="text-green-600">{food.calories} cal</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionDemo;
