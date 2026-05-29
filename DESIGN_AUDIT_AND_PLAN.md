# Global Availability Globe design audit and implementation plan

## Current project state before editing

The cloned project is a React + Vite prototype using `cobe` for a WebGL globe, `jszip` for timezone boundary data, and `lucide-react` for icons. The app currently renders a light UI with three main columns: hero copy on the left, a single large globe in the middle, and an active-region/location list panel on the right. A small commercial strip sits below the hero.

## Visual audit against the supplied target design

### 1. Header

Target design:

- Top-left product identity.
- Circular technical globe/coordinate logo.
- Two-line name:
  - `Global Availability`
  - `Globe`
- `Globe` is blue.
- Header is compact and does not compete with the hero.

Current project:

- No separate header.
- Product identity appears only inside the hero eyebrow.
- No persistent logo/title block.

Required correction:

- Add a real top header with the product logo and two-line title.

### 2. Hero block

Target design:

- Dark premium SaaS landing page.
- Two-column hero:
  - left: badge, headline, supporting text, feature indicators, CTA buttons;
  - right: large dark WebGL globe.
- Badge text:
  - `INTERACTIVE WEBGL GLOBE`
- Main headline:
  - `Show customers`
  - `when and where`
  - `your global team`
  - `is available`
- `global team` and `is available` are blue.
- Supporting text:
  - `An interactive globe that visualizes your offices, timezones,`
  - `local time and team availability in real-time.`
- Feature indicators:
  - `Real-time` / `Local Time`
  - `Timezone` / `Boundaries`
  - `Office & Team` / `Availability`
- CTA buttons:
  - `Contact active region ->`
  - `Explore features`

Current project:

- Light glass card, not dark premium.
- Hero is one card with text, not a full dark landing layout.
- Eyebrow says `Global availability layer`, not the target badge.
- Headline is single text flow and has no blue emphasis.
- Feature indicators are missing.
- Secondary button is `Reset view`, not `Explore features`.

Required correction:

- Rebuild hero as dark two-column composition.
- Add highlighted headline spans, feature indicators, and target CTA labels.
- Move reset behavior out of the hero CTA set.

### 3. Hero globe

Target design:

- Large dark blue/black WebGL globe.
- Dotted continents.
- Latitude/longitude grid.
- Timezone boundary overlay.
- Multiple colored markers.
- Active yellow tooltip:
  - `PACIFIC DESK`
  - `Honolulu`
  - `00:56 · UTC-10`

Current project:

- Globe is light/white.
- Active default is Kyiv.
- Tooltip exists, but text and visual context do not match target.
- Marker colors are mostly inactive grey plus active overlay.

Required correction:

- Change globe to dark mode and set Honolulu as the initial active region.
- Use a fixed portfolio demo time of `10:56 UTC` so the displayed times match the provided visual.
- Use yellow active tooltip and colored inactive markers.

### 4. Stats strip

Target design:

- Wide dark glass stat card below hero.
- Four columns:
  - `10` / `GLOBAL NODES`
  - `4` / `AVAILABLE NOW`
  - `10` / `SERVICE REGIONS`
  - `24/7` / `GLOBAL COVERAGE`

Current project:

- Three stats are embedded inside the left hero card.
- No `24/7 GLOBAL COVERAGE`.
- Styling is light and card-like.

Required correction:

- Create a full-width dark stat strip with four columns and colored icon circles.

### 5. Main demo/dashboard block

Target design:

- Large dark glass dashboard card.
- Three internal zones:
  1. left location list;
  2. center interactive globe;
  3. right active-region detail panel.
- Header text:
  - `Global Availability`
  - `Live`
- Dropdown:
  - `Sort by timezone`

Current project:

- Right-side panel contains active detail, boundary source, and location list.
- No dashboard card header matching the target.
- Boundary source error is visible, which weakens the portfolio presentation.

Required correction:

- Recompose dashboard into the target three-zone layout.
- Hide technical boundary-source diagnostics from the commercial UI.
- Add the `Global Availability` / `Live` header and `Sort by timezone` control.

### 6. Location list

Target design:

- Active row is Honolulu.
- Rows:
  - `Honolulu` / `UTC-10 · Pacific Desk` / `00:56`
  - `Los Angeles` / `UTC-07 · West Coast` / `03:56`
  - `New York` / `UTC-04 · North America` / `06:56`
  - `London` / `UTC+01 · United Kingdom` / `11:56`
  - `Kyiv` / `UTC+03 · Eastern Europe` / `13:56`
  - `Dubai` / `UTC+04 · Middle East` / `14:56`
  - `Delhi` / `UTC+05:30 · South Asia` / `16:26`
  - `Singapore` / `UTC+08 · Southeast Asia` / `18:56`
  - `Tokyo` / `UTC+09 · Japan` / `19:56`
  - `Sydney` / `UTC+10 · Australia` / `20:56`

Current project:

- List exists but appears in the right panel.
- Active row defaults to Kyiv.
- Live current time means numbers do not match the provided design.

Required correction:

- Move the list into the left dashboard panel.
- Default active region to Honolulu.
- Use fixed demo time values for portfolio fidelity.

### 7. Center demo globe

Target design:

- Second large dark globe in dashboard center.
- Active marker has yellow ring.
- Helper text:
  - `Drag to rotate the globe`

Current project:

- Only one globe exists.
- Helper text is missing.

Required correction:

- Render a second interactive globe in the dashboard card.
- Add the drag helper below it.

### 8. Active region panel

Target design:

- Right panel text:
  - `ACTIVE REGION`
  - `Honolulu`
  - `Pacific Desk`
  - `00:56`
  - `UTC-10`
  - `STATUS`
  - `Available now`
  - `Working hours`
  - `08:00 - 17:00 (Local time)`
  - `CONTACT`
  - `pacific@company.com`
  - `Contact this region ->`

Current project:

- Panel exists but is light.
- Email is `pacific@example.com`.
- Active default is Kyiv.
- Does not include the exact section labels and CTA button.

Required correction:

- Restyle as dark glass panel.
- Update demo contact email to `pacific@company.com`.
- Add status, working-hours, contact labels, and CTA.

### 9. Feature strip

Target design:

- Four horizontal feature items:
  - `Click any location` / `to focus the globe`
  - `See local time` / `for each region`
  - `Understand team` / `availability instantly`
  - `Reduce timezone` / `confusion`

Current project:

- A three-item commercial strip exists instead.

Required correction:

- Replace with four target interaction features.

### 10. Business value section

Target design:

- Label:
  - `BUSINESS VALUE`
- Heading:
  - `Why companies use it`
- Four benefit cards:
  - `Improve customer experience`
  - `Show your global presence`
  - `Reduce timezone friction`
  - `Increase trust and engagement`

Current project:

- Missing.

Required correction:

- Add full business value section.

### 11. Technology stack section

Target design:

- Label:
  - `TECHNOLOGY STACK`
- Heading:
  - `Built with modern technologies`
- Cards:
  - `React`
  - `Vite`
  - `COBE WebGL Globe`
  - `Canvas Overlay`
  - `Timezone Boundary Builder`
  - `Vercel Deployment`

Current project:

- Missing.

Required correction:

- Add technology cards with icons.

### 12. Use cases section

Target design:

- Label:
  - `PERFECT FOR`
- Heading:
  - `Use cases`
- Cards:
  - `SaaS & Software`
  - `IT & Agencies`
  - `Logistics & Shipping`
  - `Consulting`
  - `Startups`

Current project:

- Missing.

Required correction:

- Add target use-case card row.

### 13. Final CTA

Target design:

- Dark blue CTA card.
- Main text:
  - `Ready to showcase your`
  - `global team the right way?`
- `the right way?` is blue.
- Supporting text:
  - `Add the Global Availability Globe`
  - `to your website and let your customers`
  - `know you’re always within reach.`
- Button:
  - `Let’s build it ->`

Current project:

- Missing.

Required correction:

- Add bottom CTA with logo accent, copy, and primary button.

### 14. Footer

Target design:

- Left:
  - `Global Availability Globe`
  - `Interactive. Real-time. Global.`
- Right links:
  - `View on GitHub`
  - `Live Demo`

Current project:

- Missing.

Required correction:

- Add footer with repeated logo and links.

## Implementation plan

1. Rebuild `src/App.jsx` around a full landing-page structure while preserving the existing globe math, marker projection, overlay drawing, drag rotation, and location-focus behavior.
2. Convert the globe rendering into reusable hero/demo globe surfaces so the page can display a large hero globe and a second dashboard globe.
3. Set the portfolio demo time to `2026-05-29T10:56:00Z` so the visible local times match the supplied design exactly.
4. Update office metadata, active defaults, emails, working hours, labels, and CTAs to match the target copy.
5. Replace the current light CSS with a dark premium SaaS visual system: navy background, glass panels, blue CTAs, yellow active tooltip, green status, purple accents, responsive grids.
6. Add the missing sections: header, stats strip, dashboard feature strip, business value, technology stack, use cases, final CTA, and footer.
7. Build the project and verify the local UI in the browser at desktop and mobile widths.
