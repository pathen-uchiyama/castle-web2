

## Plan: Add Rope Drop & Hotel Stay Options to Trip Wizard

### What to add

Two new fields on **Page 1 (The Foundation)**, placed after the Napping Strategy section:

1. **Rope Drop** — A toggle: "Are you willing to arrive at park opening (Rope Drop)?" with a brief explanation that Rope Drop means arriving 30–45 minutes before official opening for the best ride availability.

2. **Accommodation & Extra Access** — A selection for where they're staying, with plain-language explanations of the access benefits each provides:
   - **On-Property (Disney Resort)** — Early Entry (30 min before opening), Extended Evening Hours (select nights, Deluxe resorts)
   - **Partner Hotel with Benefits** — Some offer Early Entry but not Extended Evening Hours
   - **Off-Property (No Extra Access)** — Standard park hours only

### Data model changes

Add to `WizardData`:
- `willingRopeDrop: boolean` (default `false`)
- `accommodationType: string | null` (values: `"on-property"`, `"partner-hotel"`, `"off-property"`)

### UI pattern

- **Rope Drop**: Same toggle style as the existing Napping Strategy toggle, with a short description underneath.
- **Accommodation**: Same card-selection pattern as Resort Destination — three styled cards with label, description, and benefit callouts.

### File changes

- `src/components/TripWizard.tsx` — Add the two new fields to `WizardData` initial state, add accommodation options array, render both new sections on Page 1 after Napping Strategy.

