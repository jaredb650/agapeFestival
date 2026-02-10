# ÄGAPĒ FESTIVAL 2026 -- Project Context

## The Event

- **Name**: ÄGAPĒ FESTIVAL 2026
- **Date**: September 5 + 6, 2026 (Saturday + Sunday, two-day festival)
- **Venue**: Industry City, Brooklyn, NYC
- **Format**: Indoor + Outdoor stages each day
- **Ticket Link**: https://posh.vip/e/gap-festival-1

## The Brand

ÄGAPĒ (styled with diacriticals) is a NYC-based hard techno events brand.

**Brand Voice** (from agapemusic.us):
> "From raw, intimate warehouse sessions to full-scale, high-energy raves, ÄGAPĒ delivers elevated production, bold sound design, and a genuine, inclusive atmosphere."

- **Location**: New York Based
- **Contact**: bookings@agapemusic.us
- **Existing Website**: https://agapemusic.us/

### Social Media

- Instagram (festival): https://www.instagram.com/agape.festival/
- Instagram (brand): https://www.instagram.com/agape__music/

### Brand Identity

- The word ÄGAPĒ (agape) means "unconditional love" in Greek -- a juxtaposition with the dark, hard techno aesthetic
- The logo features an infinity/figure-8 wireframe symbol above custom pixel-style "ÄGAPĒ FESTIVAL" typography
- Black and white primary palette, with deep red accents from the event atmosphere
- The flyer uses a raw, scratchy, hand-drawn ink/charcoal aesthetic (2D) and chrome/metallic industrial renders (3D)

## Collaborating Brands

- **Agape** -- Host brand
- **44** -- Collaborating brand (logo TBD/pending)
- **240 km/h** -- Collaborating brand
- **Face 2 Face (F2F)** -- Collaborating brand
- **HotMeal** -- Collaborating brand
- **Industry City** -- Venue

## Lineup (from flyer)

### Day 1 -- Saturday, September 5

**Outdoor Stage (Agape)**:
- Ollie Lishman
- FUMI
- Mischluft
- Bad Boombox

**Indoor Stage (Face 2 Face)**:
- Cloudy
- Serafina (F2F)
- Adrian Mills
- Hector Oaks (F2F)
- Odymel
- Emilija (F2F)
- Fenrick
- Supergloss (F2F)

### Day 2 -- Sunday, September 6

**Outdoor Stage (44)**:
- Aiden B2B
- Kobosil
- David Löhlein
- Future.666

**Indoor Stage (44)**:
- Clara Cuve
- Kobosil
- Somewhen
- Ueberrest B2B2B

## Design Aesthetic

- **Dark, evil, industrial** -- black as the base
- **Color palette**: Black + white primary (from logo/brand), deep red accents (from event photography)
- **Textures**: Chrome/metallic surfaces, brushed metal (from 3D flyer renders), raw scratchy ink/charcoal (from 2D flyer)
- **Typography**: VanillaCreamOx is the flyer font (available, not required). Each design version should choose typography that best fits its aesthetic direction.
- **Key motif**: The infinity/figure-8 wireframe symbol from the Agape logo
- **3D/WebGL immersive experience** desired for hero sections

## Reference Sites

### Teletech (https://www.teletech.events/)
- Corner bracket/registration mark UI elements
- Numbered navigation system (01 Index, 02 Events...)
- Glitch logo animation
- Marquee text scrolling
- Strong brand voice front and center
- Product/apparel cards with hover states

### Hive Festival (https://www.hive-festival.de/en)
- Bold lineup grids organized by stage
- Large typography dominating the page
- Hype copy ("LET'S GET READY FOR MADNESS")
- Travel, Camping, FAQ, Merch sections as cards
- Many overlapping artists with Agape

### Intercell (https://www.intercell.events/)
- Clean minimal black/white
- Event cards with strong photography
- YouTube/podcast integration
- Also worked with many of the same artists

### Agape Music (https://agapemusic.us/)
- Brand name styled as "ÄGAPĒ"
- David Lohlein featured video
- Marquee "ägape - NY" scrolling ticker
- Newsletter signup
- Black background, white text, clean and direct
- Upcoming events list

## Site Structure (Single-page scroll)

1. **Hero** -- 3D/WebGL immersive experience, festival logo, date, location
2. **About** -- Brand story (using existing agapemusic.us copy)
3. **Video** -- David Lohlein video clip or 3D animated flyer
4. **Tickets CTA** -- Links out to Posh
5. **Artists** -- "Choose your fighter" grid organized by Day/Stage, expandable cards with placeholder bios and placeholder icons (awaiting EPKs). YT/SC embed TBD.
6. **Merch** -- "Coming Soon" placeholder, doesn't link anywhere yet
7. **Brand Partners** -- Logo bar/grid of collaborating brands
8. **Footer** -- Socials, contact, newsletter signup

## Technical Stack

- **Next.js 14+** (React, App Router) + **Three.js / React Three Fiber** for 3D
- **Vercel** deployment
- Custom domain (TBD)
- No audio on the website
- Desktop and mobile equally important
- Timeline: Flexible, quality over speed

## Assets Inventory

### Logos
- `Logos/Agape/` -- agape_favicon.png, agape_icon.png, agape_logo_white.png, agape_logo_white_sm.png, agape_txtLogo.png, agape_webclip.png
- `Logos/AgapeFestival/` -- AGAPE_FESTIVAL.PNG (black bg), AGAPE_FESTIVALWHITE.PNG (white bg)
- `Logos/240/` -- Multiple formats (jpg, eps, pdf, png, ai) + black/white vector versions
- `Logos/FACE 2 FACE/` -- Black and white vector PNGs + .ai source
- `Logos/HotMeal/` -- hotmealshowcaselogo.jpeg
- `Logos/Industry City/` -- IC Logo BLOCK BLACK.png, IC Logo LINE BLACK.png
- `Logos/44/` -- PENDING (not yet received)

### Flyer
- `Flyer/2D_flyer_main.png` -- 2D flyer with full lineup, raw ink aesthetic
- `Flyer/3DFlyer_animated/` -- AGAPE-FEST-FULL-LINEUP-WITHAUDIO-HIGHQUAL.mov
- `Flyer/3D_flyer_Stills/` -- 4 JPEG stills of 3D chrome flyer render

### Font
- `Fonts/VanillaCreamOx-Regular.otf` -- Custom display font from the flyer (optional use)

### Photos (8 event photos)
- 1D3A9267.jpg, 1D3A9488.jpeg, 1D3A9620-2.jpeg, 3BF199AD.jpg
- AGAPE_D7.jpeg, AGAPE_F5.jpeg, DSC05585.jpeg, DSC05632.jpeg
- Aesthetic: Dark, deep red lighting, industrial venues, alternative fashion, CDJs

### Videos
- david_lohlein_4x5.mp4 / david_lohlein_4x5.webm -- David Löhlein clip (portrait 4:5 ratio)

## Artist Placeholder Strategy

All artist cards use:
- The artist name from the lineup
- A generic placeholder icon (geometric shape or silhouette, NOT a stock photo)
- 2-3 sentences of placeholder bio text clearly marked as "[Placeholder -- awaiting EPK]"
- YouTube/SoundCloud embed slot marked as "Coming Soon"
