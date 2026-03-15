

## Plan: Enhance Survey with "Open to Anything" + Top 5 Prioritization

### Overview

The guest survey will have a **3-phase flow**:

1. **Phase 1 — Rank attractions**: Each attraction gets Must-Do / Like-to-Do / Will Avoid (existing plan)
2. **Phase 2 — "Open to Anything" opt-in**: A prominent toggle/card at the end of ranking that says *"I'm open to whatever everyone else wants"* — if selected, their rankings still count but they're flagged as flexible in the leader summary
3. **Phase 3 — Top 5 Must-Dos**: After ranking, any items marked "Must-Do" are shown in a draggable/numbered list where the guest picks and orders their **Top 5 priorities**

### Data model additions (`src/data/types.ts`)

```
SurveyResponse {
  memberId: string;
  rankings: Record<string, "must-do" | "like-to-do" | "will-avoid">;
  openToAnything: boolean;           // ← new
  topFiveMustDos: string[];          // ← new, ordered attraction IDs
  status: "pending" | "completed";
}
```

### Survey page flow (`src/pages/Survey.tsx`)

The survey becomes a multi-step form within a single page:

- **Step 1**: Scroll through attractions, rank each one (Must-Do / Like-to-Do / Will Avoid)
- **Step 2**: "Flexibility" card — *"I'm open to what everyone else wants."* Toggle with explanation: "Your rankings still matter, but we'll know you're flexible when resolving conflicts."
- **Step 3**: Shows only items ranked Must-Do. User drags or clicks to order their **Top 5**. If fewer than 5 Must-Dos, they order all of them.
- **Submit**

### Leader summary impact

In the Consensus section on `/adventure`:
- Members flagged as "open to anything" get a ✨ flexible badge
- Top 5 priorities are weighted higher in conflict resolution display
- Attractions that appear in multiple members' Top 5 are highlighted as "Party Priorities"

### Files to create/modify

| File | Change |
|------|--------|
| `src/data/types.ts` | Add `SurveyAttraction`, `SurveyResponse` with `openToAnything` and `topFiveMustDos` |
| `src/data/mockData.ts` | Add mock attractions + pre-filled survey responses |
| `src/pages/Survey.tsx` | New — 3-step survey page |
| `src/pages/Adventure.tsx` | Add Consensus summary section |
| `src/App.tsx` | Add `/survey/:tripId/:memberId` route |

