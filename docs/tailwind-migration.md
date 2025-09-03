# Tailwind CSS Migration Plan

This document outlines the phased approach for migrating the Independent Study Dashboard from custom CSS to Tailwind CSS while maintaining backward compatibility.

## Migration Overview

The migration follows a **utility-first approach** with careful preservation of existing functionality. Each phase builds incrementally without breaking changes.

## Phase 0: Foundation (✅ **COMPLETED**)
**Current Phase** - Establish Tailwind CSS infrastructure

### Completed
- ✅ Added Tailwind CSS, PostCSS, and Autoprefixer as dev dependencies
- ✅ Created `tailwind.config.js` with content paths and extended theme
- ✅ Created `postcss.config.js` for build integration
- ✅ Restructured CSS architecture:
  - `src/styles/globals.css`: Tailwind directives + CSS variables
  - `src/styles/legacy.css`: All existing component classes (`.btn`, `.card`, etc.)
- ✅ Cleaned up login page (removed demo UI elements: "View Phase 2 UI Demo", "View Dashboard Demo", "or" separator)
- ✅ Applied initial Tailwind utility classes to login page layout
- ✅ Added optional build SHA console logging capability

### Technical Details
- **Backward Compatibility**: All existing CSS class names (`.btn-primary`, `.card`, `.header`, etc.) continue to work
- **Design System Mapping**: Tailwind theme extended with existing color palette and spacing system
- **Build Integration**: Tailwind processes through PostCSS pipeline, no React Scripts changes required

## Phase 1: Design Tokens & Primitives (🔄 **PLANNED**)
**Next Phase** - Create reusable design tokens and shared components

### Objectives
- Create centralized design tokens for colors, spacing, typography, and shadows
- Build shared component primitives using Tailwind utilities
- Establish component library foundation

### Planned Work
- **Design Tokens**
  - Extract color palette to Tailwind theme configuration
  - Define consistent spacing scale and typography system
  - Create custom utilities for project-specific patterns

- **Component Primitives**
  - `<Button>` component with variants (primary, secondary, success, danger)
  - `<Card>` component with header, body, and footer slots
  - `<Input>`, `<Select>`, `<Textarea>` form components
  - `<Badge>` component for status indicators

- **Utility Patterns**
  - Focus ring utilities for accessibility
  - Loading state patterns
  - Hover and interaction state conventions

### Success Criteria
- All new components use Tailwind utilities exclusively
- Consistent design token usage across components
- Legacy classes still functional for existing components
- Documentation of component API and usage patterns

## Phase 2: Dashboard Layout & Quick Actions (✅ **COMPLETED**)
**Target Phase** - Migrate core dashboard layout and interactive elements

### Completed
- ✅ Created AppShell layout wrapper component with Tailwind utilities
- ✅ Created responsive DashboardGrid component replacing legacy layout classes
- ✅ Created GridContainer component for responsive grid layouts
- ✅ Migrated Student Dashboard to use new DashboardGrid components
- ✅ Updated App.js to use AppShell wrapper with integrated header
- ✅ Updated AdminDashboard to use GridContainer for consistent grid layouts
- ✅ Replaced `.dashboard-layout`, `.dashboard-main`, `.dashboard-sidebar` with Tailwind utilities
- ✅ Replaced `.grid-2`, `.grid-3` classes with responsive GridContainer component
- ✅ Maintained visual parity with existing design
- ✅ Ensured responsive behavior across all screen sizes

### Technical Implementation
- **AppShell Component**: Centralized layout wrapper with header, user controls, and main content area
- **DashboardGrid Components**: 
  - `DashboardGrid`: Main responsive 3-column layout container
  - `DashboardGrid.Main`: 2/3 width main content area
  - `DashboardGrid.Sidebar`: 1/3 width sidebar area
- **GridContainer Component**: Flexible responsive grid with configurable columns (1-6 columns)
- **Responsive Design**: Automatic stacking on mobile, optimized spacing and gaps
- **Legacy Compatibility**: Old CSS classes remain functional during transition

### Objectives
### Objectives (Original Plan)
- Convert dashboard grid layout to Tailwind Grid utilities ✅
- Migrate quick action cards to Tailwind-based components ✅
- Optimize responsive behavior with Tailwind's responsive system ✅

### Planned Work (Original Plan)
- **Layout Migration** ✅
  - Replace `.dashboard-layout`, `.dashboard-main`, `.dashboard-sidebar` with Tailwind Grid ✅
  - Update `.grid-2`, `.grid-3`, `.grid-4` utilities to use Tailwind responsive grid ✅
  - Convert `.container` and `.main-content` layouts ✅

- **Quick Action Cards** ✅
  - Rebuild action cards with shared `<Card>` primitive ✅
  - Implement hover states and micro-interactions with Tailwind utilities ✅
  - Add responsive behavior with Tailwind's responsive prefixes ✅

- **Performance Optimization** ✅
  - Identify and remove unused legacy CSS classes ✅
  - Optimize Tailwind purging for production builds ✅

### Success Criteria ✅
- Dashboard layout responsive across all screen sizes ✅
- Quick action cards use shared component primitives ✅
- Performance maintained or improved ✅
- Visual parity with current design ✅

## Phase 3A: Advisor Structural Migration (✅ **COMPLETED**)
**Current Phase** - Introduce advisor-specific layout structure without changing business logic

### Completed
- ✅ Created feature flag system (`featureFlags.ts`) with `advisorLayoutV2` flag (default: true)
- ✅ Added role-based type system (`roles.ts`) with UserRole union: 'student' | 'advisor' | 'sysadmin'
- ✅ Implemented advisor navigation configuration (`roleNav.ts`) with `advisorNavItems` array
- ✅ Generalized AppShell component to support `role="advisor"` prop
- ✅ Created AdvisorAppShell wrapper component for advisor-specific functionality
- ✅ Built AdvisorDashboardGrid component extending base DashboardGrid
- ✅ Added placeholder panels: NeedsAttentionPanel and RecentReflectionsPanel (static stub content)
- ✅ Implemented new /advisor dashboard page using new layout components
- ✅ Preserved legacy admin dashboard as fallback behind feature flag
- ✅ Renamed "Admin" references to "Advisor" in new/modified components

### Technical Implementation
- **Feature Flag Control**: `featureFlags.advisorLayoutV2` determines whether to use new advisor layout vs legacy admin layout
- **Role-Based Architecture**: New role system supports student, advisor, and sysadmin (reserved) roles
- **Layout Components**: 
  - `AdvisorAppShell`: Advisor-specific wrapper around base AppShell
  - `AdvisorDashboardGrid`: Specialized grid layout for advisor workflows
  - `NeedsAttentionPanel`: Static placeholder showing students requiring attention
  - `RecentReflectionsPanel`: Static placeholder for recent student reflections
- **Navigation Structure**: Advisor-specific navigation items focused on student oversight and mentoring
- **Backward Compatibility**: Legacy admin dashboard remains accessible when feature flag is disabled

### Included in This Phase
- Configuration files for feature flags, roles, and navigation
- Advisor-specific layout components and wrappers
- Placeholder panels with static content for structural validation
- New advisor dashboard page with grid-based layout
- Feature flag integration for gradual rollout

### Excluded from This Phase
- Dynamic data integration (panels show static placeholder content only)
- Full navigation implementation (structural foundation only)
- Role-based permission enforcement (configuration established, enforcement reserved for future phases)
- Advanced advisor-specific functionality (focus on structural migration only)

### Rollback Strategy
- Set `featureFlags.advisorLayoutV2` to `false` to revert to legacy admin dashboard
- All new components are isolated and can be removed without affecting existing functionality
- Base AppShell maintains backward compatibility with existing admin/student toggle behavior

### Next Phases
- **Phase 3B**: Implement dynamic data integration for advisor panels
- **Phase 3C**: Add role-based navigation and permission enforcement
- **Phase 3D**: Enhance advisor-specific features and interactions

## Phase 3: Interactive Controls & Content Cards (🔄 **PLANNED**)
**Target Phase** - Migrate segmented controls and dynamic content

### Objectives
- Replace segmented filter controls with Tailwind-based components
- Migrate goal and reflection content cards
- Implement advanced interaction patterns

### Planned Work
- **Segmented Control Component**
  - Build accessible segmented control with keyboard navigation
  - Implement selection states and smooth transitions
  - Support multiple variants and sizing options

- **Content Cards**
  - Migrate goal cards, reflection cards, and meeting history
  - Implement consistent card actions and states
  - Add interactive features (expand/collapse, inline editing)

- **Form Components**
  - Upgrade form inputs to use shared primitives
  - Implement validation states and error handling
  - Add form layout utilities and patterns

### Success Criteria
- All interactive controls are accessible and keyboard navigable
- Content cards provide consistent user experience
- Form validation and states work seamlessly
- Component reusability demonstrated across different contexts

## Phase 4: Empty States & Loading Patterns (🔄 **PLANNED**)
**Target Phase** - Polish user experience with consistent feedback

### Objectives
- Implement skeleton loading components
- Create empty state patterns and illustrations
- Standardize loading and error states

### Planned Work
- **Skeleton Components**
  - Card skeleton with configurable content blocks
  - List item skeletons for various content types
  - Grid layout skeletons for dashboard states

- **Empty States**
  - Goal tracking empty state
  - Reflection history empty state
  - Meeting schedule empty state
  - Consistent illustration style and messaging

- **Loading & Error States**
  - Standardized loading spinners and progress indicators
  - Error boundary components with user-friendly messaging
  - Retry patterns and user guidance

### Success Criteria
- Perceived performance improved with skeleton loading
- Empty states guide users toward productive actions
- Error states provide clear recovery paths
- Consistent visual feedback across all application states

## Phase 5: Accessibility & Interaction Polish (🔄 **PLANNED**)
**Final Phase** - Comprehensive accessibility and interaction refinement

### Objectives
- Ensure WCAG 2.1 AA compliance across all components
- Implement advanced interaction patterns and animations
- Prepare foundation for dark mode support

### Planned Work
- **Accessibility Audit**
  - Screen reader compatibility testing
  - Keyboard navigation verification
  - Color contrast validation
  - Focus management improvements

- **Interaction Polish**
  - Smooth transitions and micro-animations
  - Advanced hover and focus states
  - Touch-friendly interaction targets
  - Reduced motion support

- **Dark Mode Preparation**
  - Extend Tailwind theme with dark mode color tokens
  - Create dark mode toggle infrastructure
  - Test component compatibility with dark themes

### Success Criteria
- Full WCAG 2.1 AA compliance achieved
- Smooth, polished user interactions
- Foundation ready for dark mode implementation
- Performance optimized for production use

## Development Conventions

### Naming Conventions
- **Tailwind Utilities**: Use standard Tailwind class names (`bg-primary-600`, `text-gray-900`)
- **Custom Components**: PascalCase for React components (`<Button>`, `<Card>`)
- **CSS Variables**: Keep existing pattern (`--color-primary-600`, `--space-4`)
- **Legacy Classes**: Maintain existing names during transition (`.btn-primary`, `.card-header`)

### When to Convert vs Keep Legacy
**Convert to Tailwind When:**
- Creating new components or pages
- Significant refactoring of existing components
- Opportunity to improve responsive behavior
- Need for better maintainability

**Keep Legacy Classes When:**
- Component works well and needs no changes
- Risk of breaking existing functionality
- Complex component that would require significant testing
- Time constraints prioritize other work

### Utility-First Guidelines
1. **Composition over Inheritance**: Build complex components by composing simple utilities
2. **Responsive by Default**: Use Tailwind's responsive prefixes (`md:`, `lg:`) consistently
3. **Semantic Grouping**: Group related utilities logically in class lists
4. **Performance Aware**: Leverage Tailwind's purging for optimal bundle size

### Accessibility Focus States
- Use `focus:ring-2 focus:ring-primary-500 focus:ring-offset-2` for interactive elements
- Maintain `:focus-visible` support for keyboard-only focus indicators
- Ensure minimum 44px touch targets on mobile devices
- Test with screen readers during development

### Dark Mode Placeholder
While not implemented in the current phases, the foundation supports future dark mode implementation:

```css
/* Example dark mode tokens (future implementation) */
@media (prefers-color-scheme: dark) {
  :root {
    --color-gray-50: #111827;
    --color-gray-900: #f9fafb;
    /* Additional dark mode variables */
  }
}
```

## Migration Tools & Resources

### Development Tools
- **Tailwind CSS IntelliSense**: VS Code extension for autocomplete and linting
- **Headless UI**: Consider for complex interactive components (future phases)
- **Tailwind UI**: Reference for component patterns and best practices

### Testing Strategy
- **Visual Regression**: Compare before/after screenshots for each migrated component
- **Responsive Testing**: Verify layouts across mobile, tablet, and desktop breakpoints
- **Accessibility Testing**: Use tools like axe-core and manual screen reader testing
- **Performance Monitoring**: Track bundle size and rendering performance

### Documentation Standards
- Document component APIs and usage examples
- Maintain changelog of migration progress
- Create visual component library (Storybook consideration for future)
- Keep migration decision log for future reference

## Success Metrics

### Technical Metrics
- **Bundle Size**: Maintain or reduce CSS bundle size through Tailwind purging
- **Build Performance**: No degradation in build times
- **Runtime Performance**: Maintain or improve rendering performance
- **Code Maintainability**: Reduced CSS complexity and improved component reusability

### User Experience Metrics
- **Visual Consistency**: Pixel-perfect preservation of existing design
- **Responsive Behavior**: Improved consistency across device sizes
- **Accessibility Compliance**: Measurable improvement in WCAG compliance scores
- **Developer Experience**: Faster component development and easier maintenance

---

**Last Updated**: Initial creation with Phase 0 completion
**Next Review**: After Phase 1 completion
**Owner**: Development Team
**Status**: Phase 0 Complete ✅