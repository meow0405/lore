# Lore Landing Page Guidelines

## Core direction

Build a landing page for a VS Code extension called **Lore**.

Lore helps developers know where not to touch in large legacy code files before making changes. The page should explain the product clearly, show the interactive demo, and guide visitors toward installing it.

The page should feel like a premium developer product with a retro-game, cosmic archive, and cyber-sigilism identity.

The design must be readable, clean, and product-focused. Do not make it look like a fantasy poster, NFT page, chaotic cyberpunk collage, or pure dashboard UI.

## Overall visual identity

The page should feel like:

* a mysterious 90s / early-2000s sci-fi game menu
* a cosmic system map
* a corrupted code archive
* a dark VS Code-inspired developer tool
* a cyber-sigilism HUD interface

The design should be nostalgic, technical, slightly eerie, playful in small moments, and polished.

## Color palette

Use a mostly dark palette:

* black
* deep charcoal
* off-white
* silver
* muted electric blue
* violet / purple pixel accents
* small red caution accents

Avoid overly bright neon colors. Accents should feel restrained and intentional.

## Background style

Use a black or deep-charcoal base with subtle texture.

Background details may include:

* pixelated stars
* tiny blue and purple glowing squares
* low-resolution sparkle sprites
* CRT scanlines
* soft grain
* VHS noise
* halftone dots
* subtle dithering
* faint glitch texture
* thin white geometric sigils
* tiny terminal labels
* file-path metadata
* small timestamps
* blue selection boxes
* red caution markers

The background can include a partial pixel-art planet, curved horizon, or cosmic system-map field near the bottom or side of the page. It should feel like an old sci-fi game loading screen or mission-selection screen.

Keep all background elements behind the product content. The page must remain readable.

## Retro game visual direction

The Lore landing page should have a clear retro-game atmosphere.

Use:

* pixelated stars
* CRT monitor texture
* dithering
* small sprite-like sparkles
* low-resolution glow effects
* pixel UI details
* cosmic map lines
* mission-screen labels
* old game HUD framing

The page should feel like an old sci-fi game menu mixed with a modern developer tool.

Use small labels such as:

* TASK INPUT
* REGION FOUND
* LANDMINE DETECTED
* CONFIDENCE
* SOURCE VERIFIED
* SECURE ACCESS
* REGION LOCKED
* ARCHIVE ONLINE

These labels should be decorative and small, not the main copy.

## Cyber-sigilism HUD details

Use cyber-sigilism as restrained HUD decoration.

Allowed elements:

* orbital lines
* circular arcs
* thin geometry
* blue tracking boxes
* coordinate marks
* tiny silhouettes
* terminal fragments
* abstract white sigils
* system-map lines
* small red caution rectangles

Do not overload the page. These details should make the page memorable without distracting from the product.

## Page structure

Use this landing page structure in order:

1. Hero
2. Problem
3. Try it
4. How it works
5. Byte mascot
6. Trust
7. Who it’s for
8. Final CTA
9. Footer

Use generous spacing, clear hierarchy, and large readable typography.

Use responsive layouts with flexbox and grid. Avoid absolute positioning except for small decorative background elements.

## Hero section

The hero must include:

Headline:

“Know where not to touch before you touch it.”

Subhead:

“Open a massive file. Tell Lore what you're trying to do. See exactly which part matters — and which part you'd regret touching.”

Primary CTA:

“Install for VS Code”

Secondary CTA:

“Try it without installing”

The hero visual should be a dark VS Code-style embedded code demo inside a retro game HUD frame.

The demo should show:

* line numbers
* syntax-highlighted code
* dimmed irrelevant code
* one glowing highlighted relevant region
* one small red caution flag on a risky region
* small HUD labels such as LANDMINE DETECTED or CONFIDENCE 82%

The hero should immediately communicate that Lore helps developers find the safe and relevant part of a large file.

## Problem section

Use this narrative copy:

“A junior dev gets a ticket. Opens a file that's been running for years. Ten thousand lines, no comments that explain why, the person who wrote it left two years ago. Copilot and Codex will happily generate code anywhere in that file, with equal confidence everywhere — they don't know the file is too big to hold in your head. Lore does.”

End the section with:

“Other tools help you write the next line. Lore helps you find the right place to write it.”

This section should feel editorial, readable, and calm.

## Try it section

The Try it section is the main product proof.

Include a text input above the code panel with the placeholder:

“What are you trying to do?”

Show syntax-highlighted code inside a dark editor frame. The demo should visually communicate that Lore dims irrelevant code and highlights only the task-relevant region.

Below the demo, include three small caption cards:

* “Dims everything except what matters for your task.”
* “Flags the spot that looks tempting but isn't safe.”
* “Every score traces to a real commit or PR — click to verify.”

The Try it section should be large, central, and interactive.

## How it works section

Use three clean columns with simple icons and one-line explanations.

Column 1:

“Lore reads your repo's history overnight — commits, pull requests, issues. Nothing leaves your infrastructure.”

Column 2:

“Every file gets a risk score, an expert, and a story — why it works the way it does.”

Column 3:

“You ask, Lore points. Type what you're doing, see where it lives and where not to go.”

Avoid jargon. Keep it simple.

## Byte mascot section

Include Byte as a tiny retro pixel-art dog or cat mascot.

Byte should feel like a companion sprite from an old game.

Use:

* pixel-art styling
* simple animation frames
* limited colors
* small idle motion
* calm, alert, and panic states
* tiny pixel paw prints
* small sparkle effects
* warning reaction symbols

Byte should be cute, minimal, and secondary to the product.

Byte section copy:

“Byte lives in your sidebar and feels the risk before you read it. Some things are better felt than read.”

Do not make Byte look like a modern illustration. It should look like a retro game companion sprite.

## Trust section

Show two proof cards.

First card:

“Click it. Read the same words. That's not a summary — that's the source.”

This card should include a visible clickable citation chip such as PR #402, commit, issue, or review.

Second card:

“Lore tells you when it doesn't know enough. That's not a weakness — it's the most useful thing a tool can say.”

This card should show a low-confidence example.

The Trust section should feel honest, transparent, and credible.

## Who it’s for section

Use three small cards:

* “Onboarding a new hire”
* “Inheriting someone else's code”
* “Touching the file everyone's afraid of”

Each card should include one short sentence and a small code/editor visual detail.

## Final CTA section

Repeat the primary CTA:

“Install for VS Code”

Add the trust line:

“Runs on your infrastructure. Your code never leaves.”

## Footer

Footer links:

GitHub · Docs · Built at HackPrix S3 · Feedback

Keep the footer simple.

## Feature-inspired visual elements

### LineWaves

Add a faint full-page animated background inspired by the OGL `LineWaves` component.

It should look like:

* slow white warped line fields
* low brightness
* diagonal flow
* subtle transparency
* mouse-reactive distortion

The effect should feel like quiet cosmic code-energy behind the page. It must not distract from the content.

### ScrambledText

Use GSAP `ScrambledText`-style interaction sparingly.

Selected labels, captions, or lore fragments can briefly scramble into `. :` characters on hover or cursor proximity, then resolve back into readable text.

Never apply this effect to long essential body copy.

### ReflectiveCard

Include one `ReflectiveCard`-inspired secure access visual.

It should look like a metallic glass identity card or archive access pass.

Include:

* blurred webcam-like texture
* frosted glass distortion
* silver sheen
* noise overlay
* reflective border
* fingerprint icon
* lock icon
* activity icon
* ID number
* “SECURE ACCESS” badge

Use this near the hero or trust section. It should not overpower the main demo.

## Typography

Use a mix of serif, pixel, monospace, and sans-serif typography.

### Serif font

Use a sharp editorial serif font for large hero headlines and major section titles.

The serif should feel:

* mysterious
* premium
* slightly gothic
* literary
* archive-like
* dramatic but readable

Use serif typography for:

* hero headline
* major section headings
* important one-line claims
* final CTA headline

### Pixel font

Use pixel-style typography only as a small accent.

Use pixel font for:

* Byte mascot labels
* tiny system tags
* caution markers
* retro UI badges
* small lore fragments
* small HUD labels
* Stable / Watch / Landmine micro-labels if readable

Pixel text should feel retro and playful, but must remain legible.

Do not use pixel fonts for paragraphs, long captions, or important explanations.

### Monospace font

Use monospace typography for developer and system elements.

Use monospace for:

* code editor demo
* file paths
* line numbers
* terminal labels
* commit / PR / issue citation chips
* confidence scores
* metadata
* small system messages

### Sans-serif font

Use a clean modern sans-serif for:

* body copy
* navigation
* buttons
* paragraph text
* normal UI labels

Body text must be highly readable and not overly stylized.

### Typography balance

The typography system should feel like:

* serif = lore, story, mystery
* monospace = code, proof, system truth
* pixel = Byte, retro charm, tiny interactive details
* sans-serif = product clarity and readability

Do not overuse stylized fonts. The page should still feel like a premium developer product, not a poster or game menu.

## Buttons

Buttons should be simple and developer-tool focused.

Primary button:

* filled
* high contrast
* clear action label
* used for “Install for VS Code”

Secondary button:

* outlined or ghost style
* less visually dominant
* used for “Try it without installing”

Avoid overly flashy button styles.

## Cards

Cards should use:

* dark charcoal surfaces
* thin borders
* subtle glow
* clean spacing
* readable content
* slight glass or CRT texture only when appropriate

Avoid cluttered cards.

## Code editor frame

The code editor frame should be VS Code-inspired and retro HUD-inspired.

Include:

* dark background
* line numbers
* syntax highlighting
* dimmed irrelevant code
* highlighted relevant region
* red caution marker
* small confidence label
* citation chip
* subtle scanline or CRT overlay

The editor demo is the most important product visual.

## Citation chips

Citation chips should feel clickable and trustworthy.

Examples:

* PR #402
* commit
* issue
* review
* source verified

Use small pill-shaped UI elements.

## Risk labels

Use these risk labels:

* Stable
* Watch
* Landmine

Use restrained color accents.

Avoid overly bright neon indicators.

## Motion rules

Motion should be subtle and purposeful.

Allowed:

* faint background line movement
* small hover glows
* ScrambledText micro-interactions
* Byte mascot idle animation
* calm → alert → panic Byte animation
* code region highlight transition
* dimming transition in code demo

Avoid:

* large chaotic animations
* excessive glitching
* constant flashing
* distracting background motion
* unreadable scrambled body text

## Accessibility and readability

The landing page must remain readable.

Ensure:

* strong contrast between text and background
* large enough body text
* clear CTA buttons
* readable code demo
* no essential information hidden inside decorative elements
* motion does not interfere with reading

## Do not do

Do not create:

* a dashboard as the main page
* a fantasy poster
* a game-only landing page with no product clarity
* a chaotic cyberpunk collage
* an NFT-style page
* a childish mascot page
* an overly neon interface
* unreadable pixel-font paragraphs
* excessive glitch effects
* background visuals that overpower the code demo

## Final mood

The final page should feel:

premium, dark, technical, mysterious, retro-game inspired, cosmic, cyber-sigilism influenced, developer-focused, interactive, readable, trustworthy, and memorable.
