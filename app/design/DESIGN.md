---
name: Cyber-Scan Aesthetic
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#fff5de'
  on-tertiary: '#3b2f00'
  tertiary-container: '#fed639'
  on-tertiary-container: '#715d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#ffe179'
  tertiary-fixed-dim: '#eac324'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#554500'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-lg:
    fontFamily: Lexend
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '500'
    lineHeight: '1.4'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 20px
  container-max: 1280px
---

## Brand & Style
The design system is engineered for a high-performance gaming demographic, prioritizing speed, precision, and futuristic immersion. The aesthetic is "Cyber-Technical," characterized by deep obsidian surfaces punctuated by radioactive neon accents. 

The visual language balances the raw energy of gaming with the sleek sophistication of biometric technology. It heavily utilizes **Glassmorphism** to create a sense of depth in a low-light environment, simulating a high-tech Head-Up Display (HUD). Interactive elements are not merely static; they feel "energized" through the use of pulsing outer glows, scanning line animations, and sharp, geometric containers.

## Colors
The palette is rooted in a "Void Black" base to maximize the contrast of neon elements.

- **Primary (Neon Cyan):** Used for critical paths, active states, and technical borders. It represents the "scanning" and "active" nature of the product.
- **Secondary (Vivid Violet):** Reserved exclusively for premium features, tiers, and exclusive rewards to create a clear visual distinction from standard utility.
- **Surface Tiers:** Backgrounds utilize `#0A0A0C`. Overlay surfaces use a slightly lighter `#121214` with 60% opacity and a 20px backdrop blur to achieve the glassmorphism effect.
- **Glows:** Every primary interactive element should have a `0px 0px 12px` drop-shadow using the primary cyan at 40% opacity to simulate a neon emission.

## Typography
The design system employs a dual-font strategy. **Lexend** is used for headings and display text to provide a geometric, modern, and highly legible "tech" feel. **Inter** is used for body copy and data-heavy labels to maintain professional-grade clarity and technical precision.

Headings should often be paired with the `label-caps` style for sub-headers to reinforce the HUD-inspired layout. For primary actions, text can be set in medium or semi-bold weights to ensure they stand out against the glowing borders.

## Layout & Spacing
The layout follows a 12-column fluid grid system with generous outer margins (48px on desktop) to allow the "dark void" to frame the content. 

Spacing follows a strict 4px base unit, ensuring mathematical harmony across all components. Content blocks are separated by `xl` units to maintain a clean, high-end feel, while internal component padding stays within `sm` to `md` ranges to keep the UI feeling tight and modular. Containers should utilize "Safe Areas"—internal padding that ensures text never touches the glowing borders of the glass containers.

## Elevation & Depth
In this design system, depth is not conveyed through traditional shadows, but through **transparency and light emission**.

1.  **Floor (Z-0):** The `#0A0A0C` background.
2.  **Glass Layers (Z-10):** Semi-transparent fills (60-80% opacity) with a `backdrop-filter: blur(20px)`. These layers have a 1px inner border of white at 10% opacity.
3.  **Active Focus (Z-20):** High-intensity layers featuring a 1px border of Neon Cyan (`#00F0FF`) with an outer glow.
4.  **Premium Focus (Z-30):** Surfaces featuring the Violet accent with a pulse animation on the border-color to draw immediate attention.

## Shapes
The design system utilizes "Soft" roundedness (0.25rem / 4px) to maintain a sharp, technical edge while avoiding the aggressive harshness of 0px corners. This slight radius suggests precision engineering. 

Buttons and input fields should strictly adhere to the 4px radius. For larger card components or modals, a `rounded-lg` (8px) may be used to soften the overall silhouette of the interface. Geometric decorative elements—such as clipped corners or 45-degree chamfers—are encouraged for buttons to reinforce the gaming HUD aesthetic.

## Components

### Buttons
- **Primary:** Background of Cyan (`#00F0FF`) with black text. On hover, apply a `box-shadow` glow and scale the element by 1.02x.
- **Ghost/Outline:** 1px Cyan border, transparent background. Hover state fills the background with Cyan at 10% opacity.
- **Premium:** Gradient background from `#8B5CF6` to `#BC13FE` with a continuous "shimmer" animation.

### Inputs & Form Elements
- **Text Fields:** Deep black background with a 1px border (`#FFFFFF` at 20%). On focus, the border transitions to Neon Cyan with a subtle 4px outer glow.
- **Checkboxes:** Square with a 2px radius. When checked, they emit a Cyan glow.

### Cards & Modals
- **Glass Cards:** Must use `backdrop-filter: blur(12px)` and a background color of `#FFFFFF` at 5% opacity.
- **Interactive Cards:** On hover, the border-color should transition from dark gray to Neon Cyan.

### Active UI Effects
- **Scanning Line:** A horizontal 1px line of Cyan with a 20% opacity gradient that scrolls vertically across active "scanning" containers.
- **Pulsing State:** Critical buttons or active scan indicators should use a `CSS keyframe` animation that pulses the `box-shadow` spread from 4px to 12px.