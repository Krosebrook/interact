# Cognitive Loop Example: Implementing Activity Search Feature

This document demonstrates how to use the Cognitive Prompt Loop framework for a real-world feature implementation.

## User Request
"Add a search functionality to the Activities page that allows users to filter activities by name, category, and date."

---

## ITERATION 1

### ANALYSIS:
- **Intent:** code_feature
- **State:** nothing exists
- **Missing:** None (requirements are clear from PRD and existing activities page)
- **Risk:** low (straightforward feature, existing UI patterns available)
- **Summary:** Need to implement search/filter functionality on Activities page. Requirements are clear - filter by name, category, and date. Existing page at src/pages/Activities.jsx can be extended. Similar search patterns exist in other pages.

### DECISION:
- **Action Type:** generate_instruction
- **Rationale:** Requirements are clear, risk is low, and we have existing patterns to follow. Ready to proceed with implementation.

### INSTRUCTION:

**Task:** Implement search and filter functionality on the Activities page

**Context:**
- Files involved: 
  - `src/pages/Activities.jsx` (main activities page)
  - `src/components/activities/ActivityCard.jsx` (individual activity display)
  - `src/components/ui/input.jsx` (search input component)
  - `src/hooks/useActivities.js` (activity data hook)
- Dependencies: 
  - React Hook Form for search form
  - Existing Radix UI components
  - date-fns for date filtering
- Patterns to follow: 
  - Similar search in `src/pages/Dashboard.jsx`
  - Filter pattern in `src/components/gamification/LeaderboardFilters.jsx`

**Constraints:**
- Must use existing UI components from `src/components/ui/`
- Search must be case-insensitive
- Must maintain existing page layout and responsive design
- No external search libraries (use native JavaScript filtering)
- Must handle empty states gracefully

**Acceptance Criteria:**
- [ ] Search input field added to Activities page header
- [ ] Category dropdown filter implemented
- [ ] Date range filter implemented (start date, end date)
- [ ] Real-time filtering as user types in search field
- [ ] Clear filters button that resets all filters
- [ ] Empty state shown when no activities match filters
- [ ] All filters work together (AND logic)
- [ ] Responsive design maintained on mobile

**Verification Steps:**
1. Load Activities page and verify search UI appears
2. Test text search with various keywords
3. Test category filter with different categories
4. Test date range filter with various date ranges
5. Test combination of all filters together
6. Test clear filters button
7. Test empty state when no results
8. Test responsive behavior on mobile viewport

**Output Artifacts:**
- Modified: `src/pages/Activities.jsx`
- Created: `src/components/activities/ActivitySearch.jsx`
- Created: `src/components/activities/ActivityFilters.jsx`
- Modified: `src/hooks/useActivities.js` (add filtering logic)

### RESULT:

**Artifacts Created/Modified:**
1. `src/components/activities/ActivitySearch.jsx` - New search input component with debounced input
2. `src/components/activities/ActivityFilters.jsx` - Category and date range filters
3. `src/pages/Activities.jsx` - Integrated search and filters, added empty state
4. `src/hooks/useActivities.js` - Added `useActivityFilters` hook for filter state management

**Code Changes Summary:**
- Created reusable ActivitySearch component with debounced search (300ms)
- Created ActivityFilters component with category dropdown and date pickers
- Implemented filter logic using useMemo for performance
- Added empty state with helpful message and clear filters action
- Maintained existing responsive grid layout
- Used existing UI components (Input, Select, Button, Calendar)

**Test Results:**
```
Manual Testing:
✓ Search input appears and is responsive
✓ Text search filters activities case-insensitively
✓ Category filter works (tested 3 categories)
✓ Date range filter works (tested past, future, and custom ranges)
✓ All filters work together correctly
✓ Clear filters resets all filter state
✓ Empty state appears when no matches found
✓ Mobile responsive behavior maintained
✓ No console errors
```

**Notes:**
- Used lodash.debounce for search input (already in dependencies)
- Followed existing pattern from Dashboard search
- Added "All Categories" option to category filter as default
- Date filtering uses inclusive ranges (start <= date <= end)

### EVALUATION:

**Status:** PARTIAL_PASS

**Acceptance Criteria Check:**
- [✓] Search input field added to Activities page header
- [✓] Category dropdown filter implemented
- [✓] Date range filter implemented (start date, end date)
- [✓] Real-time filtering as user types in search field
- [✓] Clear filters button that resets all filters
- [✓] Empty state shown when no activities match filters
- [✓] All filters work together (AND logic)
- [✗] Responsive design maintained on mobile - **Filter layout breaks on small screens**

**Defects Found:**
- Filter buttons stack vertically on mobile but overlap on tablet breakpoint (768px)

**Missing Elements:**
- None

**Risks Introduced:**
- None (no security issues, performance impact minimal due to memoization)

**Overall Assessment:**
Feature is 90% complete and functional. One responsive design issue on tablet breakpoint needs fixing before PASS.

### LOOP_DECISION:

**Decision:** CONTINUE

**Next Action:** refine_previous_output

**Reason:** Core functionality works perfectly, but there's a CSS/layout bug on tablet screens that needs fixing. This is a minor issue that requires a simple refinement.

---

## ITERATION 2

### ANALYSIS:
- **Intent:** bug_fix
- **State:** near-complete but unverified (responsive issue on tablet)
- **Missing:** None
- **Risk:** low
- **Summary:** One responsive design issue identified at tablet breakpoint (768px). Filters overlap instead of wrapping or stacking properly.

### DECISION:
- **Action Type:** generate_instruction
- **Rationale:** Specific bug identified with clear fix needed. Can be resolved quickly.

### INSTRUCTION:

**Task:** Fix responsive layout issue for activity filters on tablet breakpoint

**Context:**
- Files involved: `src/components/activities/ActivityFilters.jsx`
- Current issue: Filters overlap at 768px breakpoint
- Target: Proper stacking or wrapping at tablet sizes

**Constraints:**
- Use Tailwind CSS responsive utilities
- Match existing responsive patterns in codebase
- Don't break desktop or mobile layouts

**Acceptance Criteria:**
- [ ] Filters display correctly at 768px breakpoint
- [ ] No overlap of filter elements
- [ ] Maintains desktop layout (≥1024px)
- [ ] Maintains mobile layout (<640px)

**Verification Steps:**
1. Test at 768px width
2. Test at 640px, 768px, 1024px, and 1920px
3. Verify no layout shifts or overlaps at any breakpoint

**Output Artifacts:**
- Modified: `src/components/activities/ActivityFilters.jsx`

### RESULT:

**Artifacts Created/Modified:**
- `src/components/activities/ActivityFilters.jsx` - Fixed responsive layout

**Code Changes Summary:**
- Changed flex wrap behavior: `flex-wrap md:flex-nowrap`
- Added proper gap spacing: `gap-4`
- Adjusted date range picker width for better tablet fit
- Filter container now stacks vertically on mobile/tablet, horizontal on desktop

**Test Results:**
```
Responsive Testing:
✓ 320px (mobile): Filters stack vertically, full width
✓ 640px (mobile-lg): Filters stack vertically, full width
✓ 768px (tablet): Filters stack vertically, proper spacing
✓ 1024px (desktop): Filters display horizontally, no overlap
✓ 1920px (desktop-xl): Filters display horizontally, proper spacing
```

**Notes:**
- Used `md:flex-nowrap` breakpoint modifier
- All filter controls now have consistent spacing

### EVALUATION:

**Status:** PASS

**Acceptance Criteria Check:**
- [✓] Search input field added to Activities page header
- [✓] Category dropdown filter implemented
- [✓] Date range filter implemented (start date, end date)
- [✓] Real-time filtering as user types in search field
- [✓] Clear filters button that resets all filters
- [✓] Empty state shown when no activities match filters
- [✓] All filters work together (AND logic)
- [✓] Responsive design maintained on mobile

**Defects Found:**
- None

**Missing Elements:**
- None

**Risks Introduced:**
- None

**Overall Assessment:**
All acceptance criteria met. Feature is complete, tested, and production-ready. No defects or missing elements.

### LOOP_DECISION:

**Decision:** EXIT

**Next Action:** Complete

**Reason:** All acceptance criteria satisfied, responsive layout issue fixed, no defects remain.

**Summary:**
Successfully implemented activity search and filter functionality:
- Created ActivitySearch component with debounced search input
- Created ActivityFilters component with category and date range filters
- Integrated filters into Activities page with proper empty states
- Implemented efficient filtering using React useMemo
- Fixed responsive layout issue on tablet breakpoint
- All manual tests passing
- Code follows existing patterns and standards
- Feature ready for code review and deployment

**Files Changed:**
1. `src/components/activities/ActivitySearch.jsx` (created)
2. `src/components/activities/ActivityFilters.jsx` (created, modified)
3. `src/pages/Activities.jsx` (modified)
4. `src/hooks/useActivities.js` (modified)

---

## Key Takeaways

This example demonstrates:

1. **Structured Analysis:** Breaking down requirements and assessing risk before coding
2. **Clear Instructions:** Precise acceptance criteria and verification steps
3. **Iterative Refinement:** Catching and fixing issues through evaluation
4. **Verification:** Testing at each step before marking complete
5. **Explicit Loop Control:** Clear decision on when to continue vs. exit
6. **Documentation:** Tracking decisions and changes throughout the process

The cognitive loop ensures nothing is missed and quality is maintained through systematic verification.
