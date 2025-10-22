import React, { useState, useEffect, useCallback } from 'react';
import { Apple, Plus, Search, Star, Clock, Trash2, Edit2 } from 'lucide-react';
import { 
  getUserSavedFoods, 
  saveFood, 
  deleteFood,
  addMealEntry,
  getUserMealEntries,
  deleteMealEntry 
} from '../../services/firebase';

const NutritionTracker = ({ user, onBack }) => {
  const [view, setView] = useState('tracker'); // 'tracker' or 'savedFoods'
  const [savedFoods, setSavedFoods] = useState([]);
  const [mealEntries, setMealEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState('breakfast');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [foods, entries] = await Promise.all([
        getUserSavedFoods(user.uid),
        getUserMealEntries(user.uid, new Date().toISOString().split('T')[0])
      ]);
      setSavedFoods(foods);
      setMealEntries(entries);
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadData();
    }
  }, [user?.uid, loadData]);

  const handleAddMealEntry = async (foodData) => {
    try {
      await addMealEntry(user.uid, {
        ...foodData,
        meal: selectedMeal,
        date: new Date().toISOString().split('T')[0]
      });
      await loadData();
    } catch (error) {
      console.error('Error adding meal entry:', error);
      alert('Failed to add meal entry. Please try again.');
    }
  };

  const handleDeleteMealEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this meal entry?')) return;
    try {
      await deleteMealEntry(entryId);
      await loadData();
    } catch (error) {
      console.error('Error deleting meal entry:', error);
      alert('Failed to delete meal entry. Please try again.');
    }
  };

  const getDailyTotals = () => {
    return mealEntries.reduce((totals, entry) => ({
      protein: totals.protein + (entry.protein || 0),
      carbs: totals.carbs + (entry.carbs || 0),
      fats: totals.fats + (entry.fats || 0),
      calories: totals.calories + (entry.calories || 0)
    }), { protein: 0, carbs: 0, fats: 0, calories: 0 });
  };

  const getMealEntries = (meal) => {
    return mealEntries.filter(entry => entry.meal === meal);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner" />
        <span className="ml-3 text-gray-600">Loading nutrition data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-6 border border-green-200 shadow-sm">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 text-sm mb-3 flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Apple className="w-8 h-8 text-green-600" />
            </div>
            Nutrition Tracker
          </h1>
          <p className="text-gray-600 mt-2">Track your daily nutrition and manage saved foods</p>
        </div>
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
        <DailyTrackerView
          selectedMeal={selectedMeal}
          setSelectedMeal={setSelectedMeal}
          savedFoods={savedFoods}
          mealEntries={mealEntries}
          onAddEntry={handleAddMealEntry}
          onDeleteEntry={handleDeleteMealEntry}
          getDailyTotals={getDailyTotals}
          getMealEntries={getMealEntries}
        />
      ) : (
        <SavedFoodsView
          user={user}
          savedFoods={savedFoods}
          onReload={loadData}
        />
      )}
    </div>
  );
};

// Daily Tracker View Component
const DailyTrackerView = ({
  selectedMeal,
  setSelectedMeal,
  savedFoods,
  mealEntries,
  onAddEntry,
  onDeleteEntry,
  getDailyTotals,
  getMealEntries
}) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
  const dailyTotals = getDailyTotals();

  return (
    <div className="grid gap-6">
      {/* Daily Summary Card */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Today's Summary</h2>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
        <div className="grid grid-4 gap-4">
          <MacroCard label="Protein" value={dailyTotals.protein} unit="g" color="blue" />
          <MacroCard label="Carbs" value={dailyTotals.carbs} unit="g" color="orange" />
          <MacroCard label="Fats" value={dailyTotals.fats} unit="g" color="purple" />
          <MacroCard label="Calories" value={dailyTotals.calories} unit="cal" color="green" />
        </div>
      </div>

      {/* Meal Selection */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Log Meal</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="btn btn-primary btn-sm"
            >
              <Star className="w-4 h-4" />
              Quick Add
            </button>
            <button
              onClick={() => setShowManualEntry(!showManualEntry)}
              className="btn btn-secondary btn-sm"
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

        {/* Quick Add Panel */}
        {showQuickAdd && (
          <QuickAddPanel
            savedFoods={savedFoods}
            onAddEntry={onAddEntry}
            onClose={() => setShowQuickAdd(false)}
          />
        )}

        {/* Manual Entry Form */}
        {showManualEntry && (
          <ManualEntryForm
            onAddEntry={onAddEntry}
            onClose={() => setShowManualEntry(false)}
          />
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
              <MealEntryCard
                key={entry.id}
                entry={entry}
                onDelete={onDeleteEntry}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Saved Foods View Component
const SavedFoodsView = ({ user, savedFoods, onReload }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  const filteredFoods = savedFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveFood = async (foodData) => {
    try {
      await saveFood(user.uid, foodData, editingFood?.id);
      setShowAddForm(false);
      setEditingFood(null);
      await onReload();
    } catch (error) {
      console.error('Error saving food:', error);
      alert('Failed to save food. Please try again.');
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (!window.confirm('Are you sure you want to delete this saved food?')) return;
    try {
      await deleteFood(foodId);
      await onReload();
    } catch (error) {
      console.error('Error deleting food:', error);
      alert('Failed to delete food. Please try again.');
    }
  };

  const handleEditFood = (food) => {
    setEditingFood(food);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Search and Add */}
      <div className="card">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved foods..."
              className="form-input pl-10"
            />
          </div>
          <button
            onClick={() => {
              setEditingFood(null);
              setShowAddForm(!showAddForm);
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Food
          </button>
        </div>

        {showAddForm && (
          <div className="mt-4">
            <SavedFoodForm
              food={editingFood}
              onSave={handleSaveFood}
              onCancel={() => {
                setShowAddForm(false);
                setEditingFood(null);
              }}
            />
          </div>
        )}
      </div>

      {/* Saved Foods List */}
      <div className="grid gap-4">
        {filteredFoods.length === 0 ? (
          <div className="card text-center py-12">
            <Apple className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No foods found' : 'No saved foods yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try a different search term'
                : 'Save your commonly eaten foods for quick logging'
              }
            </p>
          </div>
        ) : (
          filteredFoods.map(food => (
            <SavedFoodCard
              key={food.id}
              food={food}
              onEdit={handleEditFood}
              onDelete={handleDeleteFood}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Macro Card Component
const MacroCard = ({ label, value, unit, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-green-50 text-green-700 border-green-200'
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-75 mb-1">{label}</p>
      <p className="text-2xl font-bold">
        {value.toFixed(1)}
        <span className="text-sm font-normal ml-1">{unit}</span>
      </p>
    </div>
  );
};

// Quick Add Panel Component
const QuickAddPanel = ({ savedFoods, onAddEntry, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFoods = savedFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentFoods = savedFoods
    .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
    .slice(0, 5);

  return (
    <div className="border-t pt-4 mt-4">
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search saved foods..."
            className="form-input pl-10"
          />
        </div>
      </div>

      {!searchTerm && recentFoods.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recently Used
          </h4>
          <div className="space-y-2">
            {recentFoods.map(food => (
              <QuickAddFoodItem
                key={food.id}
                food={food}
                onAdd={() => {
                  onAddEntry(food);
                  onClose();
                }}
              />
            ))}
          </div>
        </div>
      )}

      {searchTerm && (
        <div className="space-y-2">
          {filteredFoods.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-4">No foods found</p>
          ) : (
            filteredFoods.map(food => (
              <QuickAddFoodItem
                key={food.id}
                food={food}
                onAdd={() => {
                  onAddEntry(food);
                  onClose();
                }}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Quick Add Food Item Component
const QuickAddFoodItem = ({ food, onAdd }) => (
  <button
    onClick={onAdd}
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
);

// Manual Entry Form Component
const ManualEntryForm = ({ onAddEntry, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    protein: '',
    carbs: '',
    fats: '',
    calories: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a food name');
      return;
    }
    onAddEntry({
      name: formData.name,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fats: parseFloat(formData.fats) || 0,
      calories: parseFloat(formData.calories) || 0
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="border-t pt-4 mt-4">
      <div className="space-y-4">
        <div className="form-group">
          <label className="form-label">Food Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Chicken Breast"
            className="form-input"
            required
          />
        </div>

        <div className="grid grid-4 gap-3">
          <div className="form-group">
            <label className="form-label">
              <span className="font-semibold text-blue-600">P:</span> Protein (g)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.protein}
              onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
              placeholder="0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="font-semibold text-orange-600">C:</span> Carbs (g)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.carbs}
              onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
              placeholder="0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="font-semibold text-purple-600">F:</span> Fats (g)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.fats}
              onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
              placeholder="0"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span className="font-semibold text-green-600">Cal:</span> Calories
            </label>
            <input
              type="number"
              step="1"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              placeholder="0"
              className="form-input"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        </div>
      </div>
    </form>
  );
};

// Meal Entry Card Component
const MealEntryCard = ({ entry, onDelete }) => (
  <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
    <div>
      <p className="font-medium text-gray-900">{entry.name}</p>
      <p className="text-sm text-gray-600">
        <span className="text-blue-600">P: {entry.protein}g</span> • 
        <span className="text-orange-600"> C: {entry.carbs}g</span> • 
        <span className="text-purple-600"> F: {entry.fats}g</span> • 
        <span className="text-green-600"> {entry.calories} cal</span>
      </p>
    </div>
    <button
      onClick={() => onDelete(entry.id)}
      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
      title="Delete entry"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

// Saved Food Form Component
const SavedFoodForm = ({ food, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: food?.name || '',
    protein: food?.protein || '',
    carbs: food?.carbs || '',
    fats: food?.fats || '',
    calories: food?.calories || '',
    isFavorite: food?.isFavorite || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a food name');
      return;
    }
    onSave({
      name: formData.name,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fats: parseFloat(formData.fats) || 0,
      calories: parseFloat(formData.calories) || 0,
      isFavorite: formData.isFavorite
    });
  };

  return (
    <form onSubmit={handleSubmit} className="border-t pt-4 space-y-4">
      <div className="form-group">
        <label className="form-label">Food Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Chicken Breast (4oz)"
          className="form-input"
          required
        />
      </div>

      <div className="grid grid-4 gap-3">
        <div className="form-group">
          <label className="form-label">
            <span className="font-semibold text-blue-600">P:</span> Protein (g)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.protein}
            onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
            placeholder="0"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="font-semibold text-orange-600">C:</span> Carbs (g)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.carbs}
            onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
            placeholder="0"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="font-semibold text-purple-600">F:</span> Fats (g)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.fats}
            onChange={(e) => setFormData({ ...formData, fats: e.target.value })}
            placeholder="0"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="font-semibold text-green-600">Cal:</span> Calories
          </label>
          <input
            type="number"
            step="1"
            value={formData.calories}
            onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
            placeholder="0"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isFavorite}
            onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
            className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
          />
          <span className="text-sm text-gray-700">Mark as favorite</span>
        </label>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {food ? 'Update Food' : 'Save Food'}
        </button>
      </div>
    </form>
  );
};

// Saved Food Card Component
const SavedFoodCard = ({ food, onEdit, onDelete }) => (
  <div className="card">
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
        <button
          onClick={() => onEdit(food)}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          title="Edit food"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(food.id)}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          title="Delete food"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

export default NutritionTracker;
