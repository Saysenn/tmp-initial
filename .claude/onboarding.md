# Onboarding Guide Rules

Every admin area (and any dashboard with more than a few pages) ships with a guided tour written for a non-technical person.

## First Sign-In Tour
1. On the first sign-in, a tour walks through the layout one step at a time, highlighting each item while dimming the rest of the screen.
2. Sidebar and header items come first: every menu link and header button gets its own step saying what it is and when to use it ("Add and edit your products here", "See your customers and their orders here").
3. The last step points to the Help button, where the tour can be replayed.

## First Visit to Each Page
1. The first time a user opens a page, a short tour (3 to 6 steps) highlights its main buttons and sections: what the page shows, the main action, filters and search, and where results appear.
2. Each step says what to do, not how it works: "Click Add product to create a new item", never "This triggers the create modal".

## Writing the Steps
- Plain, friendly language, one idea per step, two short sentences at most.
- Name things exactly as they appear on screen.
- Follow @contents.md (no dashes in visible text).

## How It Is Built
- **Steps live in config** (`configs/tours.js`): one tour per page, each step with a target element, title, and text. No tour text inside components.
- **Targets use stable attributes** (`data-tour="sidebar-products"`), never CSS classes that may change.
- **Shown once per user:** completed and skipped tours are saved in the database, not only in the browser, so they don't reappear on another device.
- **Controls on every step:** Next, Back, Skip tour, and a step counter ("2 of 5").
- **Replay anytime** from a Help button in the header, for the whole app or for the current page.
- **Works everywhere:** keyboard navigation, screen reader labels, `prefers-reduced-motion`, and phone layouts (steps for hidden sidebar items open the mobile menu first).
- **Use the shared tour component**, never a one-off per page.

## After Adding or Changing a Tour
Run through it with the Claude browser extension at phone and desktop widths, and confirm every step highlights the right element.
