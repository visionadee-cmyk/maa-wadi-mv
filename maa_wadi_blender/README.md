# Blender Cut List

## Install

1. Download `blender_cut_list.zip`.
2. In Blender: `Edit > Preferences > Add-ons`.
3. Click `Install...` and choose `blender_cut_list.zip`.
4. Enable the add-on: `Blender Cut List`.

## Where to find it

- `View3D > Sidebar (N) > Furniture tab > Cut List`

## Generate a cut list

1. Put all your parts inside a Blender collection.
2. In the Cut List panel, set `Collection` to that collection.
3. Set:
   - `Units` (mm / in)
   - `Rounding` (number of decimal digits)
   - `Kerf` (extra allowance added to Length and Width)
   - `Include Children` (include sub-collections)
   - `Group Identical Parts` (merge same size/material into one row)
4. Click `Generate Cut List`.

## Export

- `Export CSV`: good for Excel / Google Sheets.
- `Export Word (TSV)`: tab-separated (pastes nicely into Word as a table).

## Assembly manual (TSV)

This add-on can export a simple assembly/installation manual file ordered by per-object steps.

### Set step & note per object

1. Select an object in the viewport.
2. In the Cut List panel under `Assembly Manual`:
   - Set `Step` (0 means "no step")
   - Set `Note` (optional)

### Export

- Click `Export Manual (TSV)`.

### Sorting behavior

- Objects are exported in ascending `Step` order.
- Objects with `Step = 0` are exported last.

## Step images (PNG)

This add-on can also render illustrated step images as line drawings.

### Explode controls

1. Select an object.
2. Under `Assembly Manual`:
   - Set `Step` (must be > 0 to appear)
   - Set `Explode Dir` (direction to move the part for that step)
   - Set `Explode Dist` (distance to move the part)

Only objects with `Step == current step` are exploded for that rendered image.

### Export

- Click `Export Step Renders (PNG)` and choose a folder.
- The add-on writes files like `Step_001.png`, `Step_002.png`, ...

## Part Renamer

This feature helps you quickly rename objects with standard furniture part names to avoid spelling mistakes and ensure consistent naming for hardware detection.

### Usage

1. Select one or more objects in the viewport.
2. In the Cut List panel under `Part Renamer`:
   - Select a part type from the dropdown (Door, Drawer, Shelf, Table parts, Chair parts, etc.)
   - For custom names, select "Custom" and enter your own name
3. Click `Rename Selected Part`.

### Available Part Types

**Cabinet/Wardrobe:**
- Door Left/Right
- Drawers (Top/Middle/Bottom)
- Shelf (auto-increments: Shelf_1, Shelf_2, etc.)
- Side Panels (Left/Right)
- Top/Bottom/Back Panels
- Divider

**Table:**
- Table Top
- Table Leg (auto-increments)
- Table Apron
- Table Drawer

**Chair:**
- Chair Seat
- Chair Back
- Chair Leg (auto-increments)
- Chair Arm

**TV Rack:**
- TV Shelves (Top/Middle/Bottom)
- TV Back/Side Panels

**Bed:**
- Bed Headboard
- Bed Footboard
- Bed Side Rail
- Bed Slat (auto-increments)
- Bed Platform

**Side Table:**
- Side Table Top
- Side Table Shelf
- Side Table Leg (auto-increments)

**General:**
- Panel
- Frame
- Brace
- Custom (enter your own name)

## Cut Layout Visualization

This feature creates a 3D visualization of how pieces are arranged on sheets.

### Usage

1. Generate a cut list first.
2. In the Cut List panel under `Cut Layout Visualization`:
   - Click `Visualize Cut Layout`.
3. The add-on creates a new 3D visualization showing pieces placed on sheets with cut lines.

## Real-time Sync to Maa Wadi

This feature syncs your cut list and 3D model to the Maa Wadi web application in real-time.

### Setup

1. Enable sync by clicking `Enable Real-time Sync`.
2. The add-on will connect to Firebase and sync automatically when changes are made.

### Manual Sync

- Click `Sync Now` to manually sync the cut list to the web app.
- Click `Sync Camera` to sync camera position and lighting to the web app.

### Export 3D Model

- Click `Export 3D Model` to export your collection as a GLB file for the web app 3D viewer.
- The model is encoded and sent to Firebase for the web app to display.

### Status

- The panel shows the current sync status (Connected/Disconnected/Error).
- When connected, changes to the cut list are automatically synced to the web app.
