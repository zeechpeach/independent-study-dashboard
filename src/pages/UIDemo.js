import React, { useState } from 'react';
import { BookOpen, Target, Calendar } from 'lucide-react';
import GoalPreviewCard from '../components/student/GoalPreviewCard';
import ReflectionCard from '../components/student/ReflectionCard';
import QuickActionCard from '../components/student/QuickActionCard';
import SegmentedControl from '../components/ui/SegmentedControl';
import { SkeletonCard, SkeletonQuickAction } from '../components/ui/Skeleton';

const UIDemo = () => {
  const [filter, setFilter] = useState('all');
  const [showSkeletons, setShowSkeletons] = useState(false);

  // Demo data
  const demoGoals = [
    {
      id: 1,
      title: 'Complete React Component Library',
      description: 'Build reusable UI components for the dashboard including cards, modals, and form elements',
      targetDate: '2024-02-15',
      status: 'active'
    },
    {
      id: 2,
      title: 'Learn Advanced TypeScript',
      description: 'Master generics, utility types, and advanced patterns for better code quality',
      targetDate: '2024-01-30',
      status: 'overdue'
    },
    {
      id: 3,
      title: 'Design System Documentation',
      description: 'Create comprehensive documentation for our design system',
      targetDate: '2024-03-01',
      status: 'not_started'
    }
  ];

  const demoReflections = [
    {
      id: 1,
      type: 'pre-meeting',
      accomplishments: 'Successfully implemented the new dashboard layout with improved card components. The user experience is much cleaner now with better visual hierarchy.',
      createdAt: new Date('2024-01-15T10:00:00Z')
    },
    {
      id: 2,
      type: 'post-meeting',
      keyInsights: 'Learned about micro-interactions and their impact on user engagement. Discussed the importance of skeleton loaders for perceived performance.',
      createdAt: new Date('2024-01-12T14:30:00Z')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Phase 2 UI/UX Improvements Demo
          </h1>
          <p className="text-gray-600">
            Showcasing the new interactive cards, segmented control, and improved design system
          </p>
          
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => setShowSkeletons(!showSkeletons)}
              className="btn btn-secondary btn-sm"
            >
              {showSkeletons ? 'Hide' : 'Show'} Skeleton Loaders
            </button>
          </div>
        </div>

        {showSkeletons ? (
          <div className="space-y-8">
            {/* Skeleton Demo */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Skeleton Loading States</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SkeletonQuickAction />
                <SkeletonQuickAction />
                <SkeletonQuickAction />
                <SkeletonQuickAction />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Quick Actions Demo */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Quick Actions (Redesigned)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickActionCard
                  icon={BookOpen}
                  title="Pre-Meeting Reflection"
                  subtitle="Prepare for your next meeting"
                  onClick={() => alert('Pre-Meeting Reflection clicked')}
                  isPrimary={true}
                />
                <QuickActionCard
                  icon={BookOpen}
                  title="Post-Meeting Summary"
                  subtitle="Document insights and action items"
                  onClick={() => alert('Post-Meeting Summary clicked')}
                />
                <QuickActionCard
                  icon={Target}
                  title="Manage Goals"
                  subtitle="Track progress and set new goals"
                  onClick={() => alert('Manage Goals clicked')}
                />
                <QuickActionCard
                  icon={Calendar}
                  title="Schedule Meeting"
                  subtitle="Book time with your advisor"
                  onClick={() => alert('Schedule Meeting clicked')}
                />
              </div>
            </div>

            {/* Segmented Control Demo */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Segmented Control (Goal Filters)</h2>
              <div className="flex justify-center">
                <SegmentedControl
                  options={[
                    { value: 'all', label: 'All Goals', count: 5 },
                    { value: 'active', label: 'Active', count: 2 },
                    { value: 'completed', label: 'Completed', count: 1 },
                    { value: 'overdue', label: 'Overdue', count: 1 },
                    { value: 'not_started', label: 'Not Started', count: 1 }
                  ]}
                  value={filter}
                  onChange={setFilter}
                />
              </div>
            </div>

            {/* Interactive Cards Demo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Goal Preview Cards */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Interactive Goal Cards
                </h2>
                <div className="space-y-3">
                  {demoGoals.map((goal) => (
                    <GoalPreviewCard
                      key={goal.id}
                      goal={goal}
                      onClick={(g) => alert(`Clicked goal: ${g.title}`)}
                    />
                  ))}
                </div>
                <div className="pt-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All Goals →
                  </button>
                </div>
              </div>

              {/* Reflection Cards */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Interactive Reflection Cards
                </h2>
                <div className="space-y-3">
                  {demoReflections.map((reflection) => (
                    <ReflectionCard
                      key={reflection.id}
                      reflection={reflection}
                      onClick={(r) => alert(`Clicked reflection: ${r.type}`)}
                    />
                  ))}
                </div>
                <div className="pt-2 flex gap-3">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    New Reflection
                  </button>
                  <span className="text-gray-300">•</span>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All Reflections →
                  </button>
                </div>
              </div>
            </div>

            {/* Design Improvements Notes */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Improvements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Visual Enhancements</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Removed redundant edit icon buttons</li>
                    <li>• Replaced gradient buttons with flat design</li>
                    <li>• Added subtle hover animations and micro-interactions</li>
                    <li>• Improved visual hierarchy with better spacing</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Interaction Improvements</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Cards are now fully clickable for modal opening</li>
                    <li>• Segmented control replaces cramped filter buttons</li>
                    <li>• Quick actions redesigned as responsive grid cards</li>
                    <li>• Added skeleton loaders for better perceived performance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UIDemo;