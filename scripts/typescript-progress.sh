#!/bin/bash

# TypeScript Migration Progress Tracker
# Usage: ./scripts/typescript-progress.sh

echo "================================================"
echo "  TypeScript Migration Progress Tracker"
echo "================================================"
echo ""

# Count TypeScript files
TS_COUNT=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | wc -l)

# Count JavaScript files
JS_COUNT=$(find src -type f \( -name "*.js" -o -name "*.jsx" \) 2>/dev/null | wc -l)

# Calculate total and percentage
TOTAL=$((TS_COUNT + JS_COUNT))

if [ $TOTAL -eq 0 ]; then
  echo "No source files found in src/"
  exit 1
fi

PERCENTAGE=$(echo "scale=2; ($TS_COUNT / $TOTAL) * 100" | bc)

echo "Overall Progress:"
echo "  TypeScript files: $TS_COUNT"
echo "  JavaScript files: $JS_COUNT"
echo "  Total files: $TOTAL"
echo "  Progress: $PERCENTAGE%"
echo ""

# Progress bar
PROGRESS_WIDTH=50
FILLED=$(echo "scale=0; ($PERCENTAGE * $PROGRESS_WIDTH) / 100" | bc)
EMPTY=$((PROGRESS_WIDTH - FILLED))

printf "  ["
printf "%${FILLED}s" | tr ' ' '█'
printf "%${EMPTY}s" | tr ' ' '░'
printf "] $PERCENTAGE%%\n"
echo ""

# Phase tracking
if [ $(echo "$PERCENTAGE < 25" | bc) -eq 1 ]; then
  echo "Current Phase: Phase 1 - Type Definitions & Utilities"
  echo "Target: 25% by Week 4"
elif [ $(echo "$PERCENTAGE < 50" | bc) -eq 1 ]; then
  echo "Current Phase: Phase 2 - Hooks & Components"
  echo "Target: 50% by Week 8"
elif [ $(echo "$PERCENTAGE < 75" | bc) -eq 1 ]; then
  echo "Current Phase: Phase 3 - Pages & Routes"
  echo "Target: 75% by Week 10"
elif [ $(echo "$PERCENTAGE < 100" | bc) -eq 1 ]; then
  echo "Current Phase: Phase 4 - Final Migration"
  echo "Target: 100% by Week 12"
else
  echo "🎉 Migration Complete! 100% TypeScript"
fi
echo ""

# Breakdown by directory
echo "Breakdown by Directory:"
echo "------------------------------------------------"

for dir in src/lib src/utils src/hooks src/api src/components src/pages; do
  if [ -d "$dir" ]; then
    TS=$(find "$dir" -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | wc -l)
    JS=$(find "$dir" -type f \( -name "*.js" -o -name "*.jsx" \) 2>/dev/null | wc -l)
    TOTAL_DIR=$((TS + JS))
    
    if [ $TOTAL_DIR -gt 0 ]; then
      PERC=$(echo "scale=1; ($TS / $TOTAL_DIR) * 100" | bc)
      
      # Status indicator
      if [ $(echo "$PERC >= 90" | bc) -eq 1 ]; then
        STATUS="✅"
      elif [ $(echo "$PERC >= 50" | bc) -eq 1 ]; then
        STATUS="🚧"
      else
        STATUS="⏳"
      fi
      
      printf "  %-20s %s %6.1f%%  (%3d/%3d)\n" "$dir:" "$STATUS" "$PERC" "$TS" "$TOTAL_DIR"
    fi
  fi
done

echo ""
echo "Legend: ✅ Complete (90%+)  🚧 In Progress (50-89%)  ⏳ Not Started (<50%)"
echo ""

# Next steps
echo "Next Steps:"
if [ $JS_COUNT -gt 0 ]; then
  echo "  1. Run: find src -name '*.js' -o -name '*.jsx' | head -5"
  echo "  2. Convert one file at a time"
  echo "  3. Test: npm run typecheck"
  echo "  4. Run tests: npm test"
else
  echo "  1. Remove jsconfig.json"
  echo "  2. Switch to strict mode (rename tsconfig.strict.json to tsconfig.json)"
  echo "  3. Fix any remaining type errors"
  echo "  4. Celebrate! 🎉"
fi
echo ""

echo "================================================"
