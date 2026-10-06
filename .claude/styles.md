# Style Rules

## Never Do
- Dash characters in visible text (see @contents.md for the full rule and exceptions)
- Thick border designs
- AI style glass backgrounds (glassmorphism, frosted or blurred panels)
- Decorative underline designs on headings, titles, or navigation

## Always Do
- Stick with smooth border designs: rounded corners, thin and subtle borders in soft colors, applied consistently across components. Border widths, colors, and radii come from design tokens.
- Pull colors, spacing, font sizes, and radii from design tokens (CSS variables) defined in one central theme file. No hex values hardcoded in components.
- Use a consistent spacing scale.
- Design mobile first and make every layout responsive.
- Meet WCAG AA color contrast.
- Respect `prefers-reduced-motion` for animations.
