# Veralba Solar Landing Page

A responsive Next.js (App Router) and TypeScript "Check Your Eligibility" landing page for Veralba Solar. It includes the full multi-step survey with branching, validation, Previous navigation, path-aware progress, the No Net Cost Solar modal, and a demo verification step. Completed surveys are sent to a Make webhook (see [Lead webhook](#lead-webhook)).

> **SMS verification is still a demo.** No text message is sent; the code is always `123456`. Renters are never submitted.

## Requirements

- Node.js 20.9 or newer (Node 22 LTS recommended)
- npm

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command             | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Start the dev server                             |
| `npm run build`     | Build for production                             |
| `npm start`         | Serve the production build                       |
| `npm run lint`      | ESLint (Next.js core-web-vitals + TypeScript)    |
| `npm run typecheck` | `tsc --noEmit`                                   |
| `npm test`          | Vitest unit and integration tests (jsdom)        |

## Survey demo

1. **Postcode**: a 4-digit postcode (for example `2000`). Press Enter or **Next**.
2. **Do you own your home?**
   - **Rent** ends the flow on an ineligible screen. It links to an energy assistance website and shows **Previous**. No contact details are collected.
   - **Own** continues.
3. **Do you already have solar panels?**
   - **Yes** adds _How old is your existing solar system?_ and _Why are you interested in solar?_
   - **No** / **Solar Hot Water** skip straight to the bill question.
4. Quarterly bill, home age, roof type and roof shading.
5. Address (street, suburb/city, postcode; the postcode is pre-filled from step 1), then first and last name, then email and an Australian mobile number starting with `04`.
6. **Demo verification**: no text message is sent. Enter **`123456`** and choose **See If I Qualify**. The lead is posted to the webhook; the success screen only appears once it is accepted, and it summarises the answers from the active path only. If delivery fails, an error is shown and the visitor can try again.

Behaviour notes:

- Choosing a card selects it and moves on automatically after a short pause. Arrow keys move between options without advancing. Enter, Space or **Next** confirms.
- **Previous** keeps every answer. If you change a branching answer, the path, progress bar and summary all follow the new branch.
- Progress is `completed questions / questions on the active path`: 11 questions without existing solar, 13 with it. It reaches 100% on the success and renter screens.
- Validation messages appear inline, are linked with `aria-describedby`, and the first invalid control gets focus.

## Project structure

```
app/
  layout.tsx          Poppins via next/font, metadata
  page.tsx            Page composition
  globals.css         Design tokens, reset, Bootstrap-width container
  icon.svg            Favicon (navy tile with a yellow sun)
components/
  BrandLogo.tsx       Inline SVG wordmark (white "Veralba", yellow "Solar")
  SiteHeader.tsx      Navy bar with logo and SSL badge
  WhyUseUs.tsx        Benefits section and "More" modal trigger
  Modal.tsx           Accessible dialog (focus trap, Escape, inert background, focus restore)
  SiteFooter.tsx      Footer, disclaimer, legal links
  survey/             Survey state machine UI and step components
lib/
  survey.ts           Step definitions, branching, progress and validation (pure functions)
  site.ts             Brand name, contact email and legal links
public/assets/        Local images with descriptive kebab-case names
tests/                Vitest unit and integration tests
docs/reference/       Source screenshots used for visual matching
```

## Lead webhook

When a homeowner completes verification, `components/survey/Survey.tsx` posts the answers to `app/api/lead/route.ts`. The route re-validates them on the server, builds a flat record (`lib/lead.ts`) and forwards it as JSON to the Make webhook. The webhook URL never reaches the browser.

- Default URL: `https://hook.eu1.make.com/tds511csbujm4nrdfxvtntlgxpfidfjr`. Override it with the `MAKE_WEBHOOK_URL` environment variable.
- Only answers on the active path are sent; abandoned branches and the verification code are dropped. The mobile is normalised to `04XXXXXXXX`.
- Fields: `event_id`, `submitted_at`, `postcode`, `homeowner`, `existing_solar`, `system_age`, `reason`, `quarterly_bill`, `home_age`, `roof_type`, `roof_shading`, `street`, `suburb`, `address_postcode`, `first_name`, `last_name`, `email`, `mobile`, `page_url`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`. Empty answers are sent as `""`.
- The route returns `200` when Make accepts the lead, `400`/`422` for malformed or incomplete surveys, and `502` if Make fails or takes longer than 10 seconds.

## Meta Pixel

`components/MetaPixel.tsx` loads the Meta Pixel base code in the root layout and fires the standard `PageView` on every load. Once the webhook has accepted a lead, `components/survey/Survey.tsx` calls `trackPixelEvent("Lead")` from `lib/pixel.ts`, which fires the standard `Lead` event with an `eventID` equal to the webhook's `event_id`, so it can be deduplicated against a later Conversions API event. The helper is a no-op if the pixel is blocked or not loaded. The pixel ID lives in `lib/site.ts` as `metaPixelId`; set it to an empty string to disable the pixel entirely.

To change the demo code, edit `DEMO_OTP` in `lib/survey.ts`. To change the brand name, contact email or the Privacy, Terms and energy assistance links, edit `lib/site.ts`. Brand colours are CSS variables at the top of `app/globals.css` (`--color-accent` is the yellow).

## Deployment (Vercel)

1. Push the repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository. The Next.js preset is detected automatically; the defaults `npm install` / `npm run build` are correct.
3. Deploy. No environment variables are required; optionally set `MAKE_WEBHOOK_URL` to send leads to a different Make scenario.

Or with the CLI:

```bash
npx vercel        # preview
npx vercel --prod # production
```

The page is statically prerendered; `/api/lead` runs as a serverless function, so the site cannot be deployed as a pure static export. `next.config.ts` adds basic security headers. `robots` is set to `noindex` because this is a demo build; remove that from `app/layout.tsx` for a real launch.

## Accessibility

- Skip link to the eligibility check, semantic landmarks and headings
- Native radio inputs inside a labelled `radiogroup`, with visible focus rings on cards, inputs and buttons
- Focus moves to each new question's heading, and the progress bar exposes `aria-valuenow` and a text value
- Modal uses `role="dialog"` and `aria-modal`, traps focus, closes with Escape, the backdrop or either close button, and returns focus to **More**
- Button text and links on light backgrounds use navy or a dark gold (`#6b5800`) so they meet WCAG AA contrast. Yellow (`#ffe600`) stays the brand accent.
- Respects `prefers-reduced-motion`
