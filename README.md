# Maa Wadi Mv

A lightweight, static web app for optimizing plywood sheet usage and generating an instant quotation for cutting + teak edging.

The app includes:

- `index.html`: landing/marketing page
- `selection.html`: calculator/optimizer UI

## Features

- **Sheet layout optimizer**
  Places rectangular pieces onto standard 2440×1220mm sheets with a configurable blade/waste gap.
- **Instant quotation**
  Calculates totals for:
  
  - number of plywood sheets
  - number of cuts
  - teak edging length
- **Unit switcher**
  Enter measurements in `mm`, `cm`, `m`, or `in` (internally stored in mm).
- **CSV import**
  Import piece data from CSV files with support for filtering wood-only materials.
- **Project save/load**
  Save and load project data for later use.
- **PDF export**
  Export quotations as PDF documents.
- **Print functionality**
  Print quotations directly from the browser.
- **Share functionality**
  Share quotations via native sharing APIs.
- **PWA support**
  Includes `manifest.json` and `sw.js` for offline caching (when served over http(s)).

## How to run

This is a static site (no build step).

### Option A: Open directly

You can open `index.html` in your browser.

Note: service workers (PWA offline caching) typically require serving over `http://` or `https://` (not `file://`).

### Option B: Run a local web server (recommended)

From the project folder, run any static server, for example:

- Python:
  
  - `python -m http.server 8000`

Then open:

- `http://localhost:8000/index.html`
- `http://localhost:8000/selection.html`

## Configuration

Core parameters are at the top of `script.js`:

- `sheetWidth` / `sheetHeight`
  Standard plywood dimensions (defaults: `2440` × `1220` mm).
- `woodWaste`
  Gap between pieces (defaults: `10` mm).
- `sheetCost`, `cutCost`, `teakCost`
  Pricing inputs used to compute the quotation (in Maldivian Rufiyaa - RF).

Unit conversions are handled in `units.js` via `UnitConverter`.

## CSV Import Format

The app supports importing piece data from CSV files. The CSV should include:

- **Qty**: Quantity of pieces
- **Length (mm)**: Length of the piece (supports mm, cm, m, in with unit notation in header)
- **Width (mm)**: Width of the piece (supports mm, cm, m, in with unit notation in header)
- **Material** (optional): Material type (used for wood-only filtering)

Example CSV format:
```csv
Part,Qty,Length (mm),Width (mm),Thickness (mm),Material
Horizontal inside,6,600.0,297.0,18.0,
Door,10,644.0,310.0,18.0,Wood
```

Import options:
- **Replace existing**: Clear current sheets before importing
- **Wood only**: Only import rows where Material is "Wood"

## Project structure

- `index.html`
  Landing/marketing page for FurniCraft Pro with hero section, features, testimonials, and contact information.
- `selection.html`
  Main calculator UI for Woodcraft Pro with piece input, sheet layout visualization, quotation generation, and CSV import.
- `script.js`
  Core functionality including:
  - Sheet packing algorithm (bin packing optimization)
  - Piece placement with rotation support
  - Sheet rendering and visualization
  - Quotation calculation
  - CSV parsing and import
  - PDF export using html2canvas and jsPDF
  - Print and share functionality
- `units.js`
  Unit conversion system (mm, cm, m, in) with UI updates.
- `style.css`
  Styling for the calculator interface with responsive design.
- `landing.css`
  Styling for the landing page with modern design and animations.
- `manifest.json`
  PWA manifest for app installation and offline support.
- `sw.js`
  Service worker for caching assets and offline functionality.
- `netlify.toml`
  Netlify deployment configuration.
- `assets/`
  Images, icons, and logos used throughout the application.
- `cupboard 1.csv`
  Example CSV file demonstrating the import format.

## Deployment

The app is configured for Netlify deployment via `netlify.toml`. To deploy:

1. Push the code to a Git repository
2. Connect the repository to Netlify
3. Netlify will automatically deploy the static site

## Contact

- **Developer**: Retts Web Dev
- **Location**: Lh. Hinnavaru, Maldives
- **Phone**: +960 9795529
- **Email**: retey.ay@hotmail.com
- **GitHub**: https://github.com/Rettey-G

## Technologies Used

- **HTML5/CSS3**: Structure and styling
- **Vanilla JavaScript**: Core functionality (no frameworks)
- **Font Awesome**: Icons
- **html2canvas & jsPDF**: PDF export functionality
- **Service Worker API**: Offline PWA support
