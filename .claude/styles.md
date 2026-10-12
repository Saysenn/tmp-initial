# Style Rules

## Never Do
- Dash characters in visible text (see @contents.md for the full rule and exceptions)
- Thick borders anywhere, including tags and cards
- Decorative dots on tags or cards
- AI style glass backgrounds (glassmorphism, frosted or blurred panels)
- Decorative underline designs on headings, titles, or navigation

## Always Do
- Stick with smooth border designs: rounded corners, thin and subtle borders in soft colors, applied consistently across components. Border widths, colors, and radii come from design tokens.
- Pull colors, spacing, font sizes, and radii from design tokens (CSS variables) defined in one central theme file. No hex values hardcoded in components.
- Use a consistent spacing scale.
- Design mobile first and make every layout responsive.
- Meet WCAG AA color contrast.
- Respect `prefers-reduced-motion` for animations.
- Handle long content: no horizontal or vertical overflow when text, lists, or tables grow (wrap, truncate, or scroll inside the component).

## Cards
No generic AI-looking cards. Avoid the usual pattern:
- A row of identical cards, each with an icon in a colored rounded square, a bold title, and two lines of gray text
- Gradient borders, glows, purple and blue gradients, or emoji used as icons
- Everything centered, every card the same size, and a hover that only lifts the card with a shadow

Instead:
- **Texture:** give cards a real surface (subtle grain, paper, or a soft pattern from the project's assets), not a flat white box.
- **Human layout:** let the content shape the card. Vary sizes and emphasis, use asymmetry, and lead with the most important thing (a number, a screenshot, a quote, a name) rather than an icon.
- **Icons only when they add meaning,** from one consistent icon set, sized and colored to fit the design rather than as decoration.
- **Real content:** concrete details, real data, and specific wording, never filler text.

## CTA Sections
No generic CTA blocks. Avoid the usual pattern: a centered rounded box with a gradient background, a "Ready to get started?" heading, one line of text, and one or two buttons.

Instead:
- **Full width:** CTA sections run edge to edge across the page, not as a boxed card inside the content width.
- **Distinct design:** give each CTA its own layout and texture that fits the page (an image, a product shot, a real stat, or a quote alongside the action), not the same template on every page.
- **Specific copy:** say exactly what happens next ("Track your first 10 applications free"), never stock lines like "Ready to get started?" or "Join thousands of users".
- **One clear primary action,** with at most one secondary action.

## After Every UI Change
Use the Claude browser extension to:
- Check the layout at phone, tablet, and desktop widths, including overflow.
- Click through the changed flow as a user would and confirm it works.
