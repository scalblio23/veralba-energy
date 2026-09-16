# Solar Selector Landing Page — Build Brief

## Goal

Build a responsive, production-ready recreation of `https://solarselector.com.au/apply/` as a modern frontend application deployable on Vercel. Match the source page's information architecture, visual hierarchy, multi-step survey flow, branching, responsive behavior, and interaction patterns.

Use the captured source references in `docs/reference/source-landing-page-desktop.png` and `docs/reference/source-landing-page-mobile.png` for the exact first-step composition, section spacing, responsive stacking, and footer proportions. The desktop capture is 1440px wide; the mobile capture is 390px wide.

This implementation is a frontend demonstration only. Do not copy or call the source site's Zapier webhooks, SMS endpoints, Google Maps key, TrustedForm integration, tracking scripts, or lead-processing backend. The final form action should show a clear local success/demo state without transmitting personal information externally.

## Recommended stack

- Next.js with App Router
- TypeScript
- React components and local state
- CSS Modules or a focused global stylesheet
- No unnecessary component library
- Vercel-compatible build

## Page structure

1. **Top navigation**
   - Full-width deep navy bar (`#000033`, subtle darker/lighter bottom border).
   - Centered max-width content container.
   - Solar Selector logo aligned left, approximately 45px high.
   - Secure/SSL badge aligned right, approximately 50px high.
   - Mobile retains both assets with compact spacing.
   - In the desktop reference the bar is about 87px tall; on mobile it is about 40px tall, with both marks scaled down but still readable.

2. **Hero/qualification heading**
   - Very light grey background (`#f9f9f9`).
   - Centered headline: **“Check Your Eligibility For Government Solar Incentives & No-Net-Cost Solar”**.
   - Poppins, deep navy, bold; about 2.4rem desktop and 24px mobile.
   - Desktop top spacing about 50px; mobile about 30px.

3. **Multi-step survey**
   - Same light grey background and a centered container capped around 910px.
   - Thin 8px square-corner progress track with turquoise fill (`#1ae2c2`).
   - One logical step visible at a time; grouped fields can appear together where noted.
   - Centered question title in deep navy, supporting copy beneath it.
   - Radio choices render as white cards with semantic illustrations/icons, rounded 5px corners, navy text, turquoise hover outline, and navy selected outline.
   - Desktop choice cards run horizontally; mobile choices stack vertically and use smaller icons.
   - Selecting a radio choice automatically advances after a subtle transition.
   - Text inputs are centered, white, navy bordered, about 41px high with restrained rounded corners.
   - Turquoise **Next** button and understated **Previous** button; keyboard Enter should advance valid text steps.
   - Preserve answers when navigating backward and calculate progress from the active logical path.
   - Show accessible inline validation messages. Use semantic labels, keyboard-focus styles, and ARIA where appropriate.

4. **Why Use Solar Selector?**
   - White section with generous vertical padding (approximately 80px top / 60px bottom).
   - Centered deep navy heading.
   - Three desktop columns, stacked on mobile:
     - **Access Solar Incentives** — “In less than 60 seconds you'll find out if you qualify for Government solar incentives worth up to $5,960*.”
     - **Accredited Solar Experts** — “Our free service ensures you're matched with a leading SAA Accredited Solar installer.”
     - **No Net Cost Solar** — “Those who qualify can get solar panels installed without adding a dollar to their monthly expenses.” plus a **More** link.
   - Each item has a meaningful 50px icon.
   - Keep the three columns left-aligned beneath the centered section heading. On mobile, use generous vertical gaps and keep each icon left-aligned above its heading.

5. **No Net Cost Solar modal**
   - Opened by the **More** link.
   - Navy header, white body, square corners, soft shadow, turquoise close button.
   - Explain that rebate plus energy savings and installer finance/payment plans can make repayments comparable with savings; qualification depends on location, home, usage, system, and finance plan.
   - Must be keyboard accessible and closable with Escape.

6. **Footer**
   - Dark navy (`#011640`) with white text.
   - Three desktop columns: logo, short company description, contact heading/details; stacked and centered on mobile.
   - Disclaimer about the $5,960 example, referral-service status, informational nature, partner fees, Terms, and Privacy.
   - Bottom copyright row with Privacy Policy and Terms links.

## Survey map and branching

1. **Postcode eligibility**
   - Prompt: “See If Your Postcode Qualifies”
   - Supporting text: “Please Enter Your Postcode Below.”
   - Four-digit Australian postcode input (`0000` placeholder), required.
   - Continue to Homeowner.

2. **Home ownership**
   - Prompt: “Do you own your home?”
   - Options: **Own**, **Rent**.
   - Own → Existing solar.
   - Rent → terminal ineligible state: “I'm sorry, currently Solar Selector can only assist homeowners.” Supporting text recommends the Energy Assistance website. Include Previous; do not submit or collect contact details.

3. **Existing solar**
   - Prompt: “Do you already have solar panels?”
   - Options: **Yes**, **No**, **Solar Hot Water**.
   - Yes → Existing system age.
   - No / Solar Hot Water → Quarterly bill.

4. **Existing system age** (Yes branch only)
   - Prompt: “How old is your existing solar system?”
   - Supporting text: “Your best guess is ok.”
   - Options: **More than 5 years**, **Less than 5 years**.
   - Continue to reason.

5. **Reason for enquiry** (Yes branch only)
   - Prompt: “Why are you interested in solar?”
   - Supporting text: “Tell us why you're enquiring today.”
   - Options: **Upgrading System**, **Adding A Battery**, **Not Interested**.
   - Continue to quarterly bill.

6. **Quarterly electricity bill**
   - Prompt: “How high is your quarterly electricity bill?”
   - Supporting text: “Your best guess is ok.”
   - Options: **$300 - $600**, **$600 - $900**, **$900 - $1200**, **$1200 +**.

7. **Home age**
   - Prompt: “What's the age of your home?”
   - Supporting text: “Your best guess is ok.”
   - Options: **0 - 10 Years**, **10 - 20 Years**, **20 + Years**.

8. **Roof type**
   - Prompt: “What type of roof do you have?”
   - Options: **Tin**, **Tile**, **Other**.

9. **Roof shading**
   - Prompt: “Do you have any roof shading issues?”
   - Options: **No Issues**, **Minor Shade**, **Major Shade**, **Not Sure**.

10. **Address group**
    - Heading: “What's your home address?”
    - Supporting text: “Your address is required to provide accurate results.”
    - Inputs: street address (`Start Typing Your Address`), suburb/city (`My Suburb`), postcode (`2001`).
    - Do not use the source Google Maps key. Basic text inputs and validation are sufficient.

11. **Name group**
    - First name and last name, required.

12. **Contact group**
    - Best email address and Australian mobile number, required.
    - Email validation and an Australian mobile format beginning with `04`.

13. **Demo verification/final state**
    - Mirror the source's visual final step: explain that a verification code would be sent and show a six-digit OTP input plus **See If I Qualify**.
    - Do not send SMS and do not call external services. Clearly label it as a demo. Accept a documented demo code such as `123456`, then display a polished eligibility-request success state.
    - Include consent copy with Privacy Policy and Terms links, but keep the action local-only.

## Visual tokens

- Font: Poppins, weights 300/400/700, with a system sans-serif fallback.
- Primary navy: `#000033`.
- Footer navy: `#011640`.
- Accent turquoise: `#1ae2c2`.
- Page/survey background: `#f9f9f9`.
- White cards: `#ffffff`.
- Main card text: approximately `#151f47`.
- Progress track: `#e9ecef`.
- Desktop content widths should closely match Bootstrap-style centered containers.

## Assets

Store all local assets in a coherent directory such as `public/assets/`. Use meaningful kebab-case filenames rather than the source's numbered names, for example:

- `solar-selector-logo.png`
- `secure-ssl-badge.png`
- `home-owner.png`, `home-renter.png`
- `solar-existing-yes.png`, `solar-existing-no.png`, `solar-hot-water.png`
- `system-age-over-five-years.png`, `system-age-under-five-years.png`
- `reason-upgrade-system.png`, `reason-add-battery.png`
- `bill-300-600.png`, `bill-600-900.png`, `bill-900-1200.png`, `bill-over-1200.png`
- `home-age-0-10.png`, `home-age-10-20.png`, `home-age-over-20.png`
- `roof-tin.png`, `roof-tile.png`, `option-unsure.png`
- `shade-none.png`, `shade-minor.png`, `shade-major.png`
- `benefit-solar-incentives.png`, `benefit-accredited-experts.png`, `benefit-no-net-cost.png`

If downloading publicly served source images, save local copies under these names so the deployed page does not hotlink. Do not include hidden keys, webhook URLs, tracking pixels, or backend endpoints from the source.

## Quality and acceptance criteria

- Faithful visual hierarchy on desktop and mobile.
- All branches and Previous navigation work correctly.
- Progress accurately reflects the chosen path.
- No external lead submission, SMS, source webhooks, exposed credentials, tracking scripts, or console errors.
- Accessible keyboard navigation and visible focus states.
- No horizontal overflow at 375px width.
- Production build and lint/type checks pass.
- Add a clear README with local-development, build, survey-demo, and deployment instructions.
