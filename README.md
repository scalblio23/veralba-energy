# Veralba Solar Landing Page

A responsive Next.js (App Router) and TypeScript "Check Your Eligibility" landing page for Veralba Solar. It includes the full multi-step survey with branching, validation, Previous navigation, path-aware progress, the No Net Cost Solar modal, and a success screen.

> **Frontend demo only.** Nothing you enter leaves the browser. There is no lead submission, SMS verification, webhook, TrustedForm, Google Maps key or any other credential. Answers live in React state and are cleared on refresh. The only third-party script is the Meta Pixel (see below).

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
6. Choose **See If I Qualify** on the contact question to go straight to the thank-you screen. There is no SMS verification. The thank-you screen summarises the answers from the active path only.

Behaviour notes:

- Choosing a card selects it and moves on automatically after a short pause. Arrow keys move between options without advancing. Enter, Space or **Next** confirms.
- **Previous** keeps every answer. If you change a branching answer, the path, progress bar and summary all follow the new branch.
- Progress is `completed questions / questions on the active path`: 10 questions without existing solar, 12 with it. It reaches 100% on the success and renter screens.
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

## Meta Pixel

`components/MetaPixel.tsx` loads the Meta Pixel base code in the root layout and fires the standard `PageView` on every load. When the survey reaches the success screen, `components/survey/Survey.tsx` calls `trackPixelEvent("Lead")` from `lib/pixel.ts`, which fires the standard `Lead` event. The helper is a no-op if the pixel is blocked or not loaded. The pixel ID lives in `lib/site.ts` as `metaPixelId`; set it to an empty string to disable the pixel entirely.

To change the brand name, contact email or the Privacy, Terms and energy assistance links, edit `lib/site.ts`. Brand colours are CSS variables at the top of `app/globals.css` (`--color-accent` is the yellow).

## Deployment (Vercel)

1. Push the repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository. The Next.js preset is detected automatically; the defaults `npm install` / `npm run build` are correct.
3. Deploy. No environment variables are required.

Or with the CLI:

```bash
npx vercel        # preview
npx vercel --prod # production
```

The page is statically prerendered. `next.config.ts` adds basic security headers. `robots` is set to `noindex` because this is a demo build; remove that from `app/layout.tsx` for a real launch.

## Accessibility

- Skip link to the eligibility check, semantic landmarks and headings
- Native radio inputs inside a labelled `radiogroup`, with visible focus rings on cards, inputs and buttons
- Focus moves to each new question's heading, and the progress bar exposes `aria-valuenow` and a text value
- Modal uses `role="dialog"` and `aria-modal`, traps focus, closes with Escape, the backdrop or either close button, and returns focus to **More**
- Button text and links on light backgrounds use navy or a dark gold (`#6b5800`) so they meet WCAG AA contrast. Yellow (`#ffe600`) stays the brand accent.
- Respects `prefers-reduced-motion`
