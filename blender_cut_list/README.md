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
