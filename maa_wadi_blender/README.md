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

**Body Parts:**
- Top Panel / Bottom Panel
- Left/Right Side Panel
- Front/Rear/Back Panel
- Center Panel
- Center/Vertical/Horizontal/Inner/Outer/Cross Divider
- Middle/Side/Rear/Front/Cross Support
- Top/Bottom/Front/Rear/Left/Right/Cross/Support Rail
- Upper/Lower/Base/Sub/Face Frame
- Support Bar / Stretch Bar / Cross Member / Support Beam
- Mounting Plate / Panel Insert
- Corner Block / Corner Post
- Reinforcement Bar / Side/Cross/Diagonal Brace
- Base / Plinth / Toe Kick
- Leg (Front Left/Right, Rear Left/Right, Round, Square, Metal, Wood, Adjustable)
- Foot / Foot Pad / Rubber Foot / Adjustable Foot
- Caster Wheel / Wheel Lock

**Door Parts:**
- Door Panel / Door Leaf / Door Frame
- Door Stile (Left/Right) / Door Rail (Top/Bottom/Middle)
- Door Edge (Left/Right) / Door Cap (Top/Bottom)
- Door Handle / Door Knob
- Door Lock / Door Latch / Door Catch / Door Stopper
- Door Closer / Door Buffer / Door Magnet / Door Seal
- Door Mirror / Glass Panel
- Sliding Door (Left/Right)
- Top/Bottom/Guide Track / Guide Rail / Guide Wheel
- Roller / Roller Wheel / Soft Close System / Stopper

**Drawer Parts:**
- Drawer Box
- Drawer Front / Drawer Back / Drawer Side (Left/Right) / Drawer Bottom
- Drawer Handle / Drawer Pull
- Drawer Runner (Left/Right) / Drawer Slide (Left/Right)
- Drawer Track / Drawer Guide / Drawer Stop
- Drawer Spacer / Drawer Divider / Drawer Insert

**Shelf Parts:**
- Shelf / Shelf Top / Shelf Bottom / Shelf Divider
- Shelf Support / Shelf Pin (auto-increments) / Shelf Bracket (auto-increments)
- Shelf Clip / Shelf Holder / Shelf Rod / Shelf Insert
- Glass Shelf / Adjustable Shelf / Fixed Shelf

**Wardrobe Parts:**
- Wardrobe Top/Bottom/Back/Left Side/Right Side
- Wardrobe Center Divider
- Wardrobe Door (Left/Right)
- Wardrobe Handle (Left/Right)
- Wardrobe Mirror Panel
- Wardrobe Hanging Rod / Shoe Rack / Drawer / Basket / Tie Rack

**Accessories:**
- Hanging Rod / Rod Bracket (Left/Right) / Rod Support
- Tie Rack / Belt Rack / Pant Rack / Shoe Rack / Shoe Tray
- Laundry Basket / Storage Basket / Accessory Tray / Jewelry Tray
- Divider Panel / Mirror Frame
- Internal Light / LED Strip / Motion Sensor

**Cabinet Parts:**
- Cabinet Top/Bottom/Back/Left Side/Right Side
- Cabinet Shelf
- Cabinet Door (Left/Right)
- Cabinet Handle / Cabinet Lock / Cabinet Key

**Desk/Table Parts:**
- Desk Top / Table Top / Extension Top / Drop Leaf
- Apron (Front/Rear/Left/Right)
- Keyboard Tray / Monitor Stand
- Cable Tray / Cable Hole / Cable Cover
- CPU Holder / Power Panel / Wire Organizer
- Foot Rest / Privacy Panel / Modesty Panel

**Chair Parts:**
- Chair Seat / Seat Frame / Seat Base / Seat Cushion
- Back Frame / Backrest / Headrest / Lumbar Support
- Armrest (Left/Right) / Arm Pad (Left/Right)
- Chair Base / Gas Cylinder / Tilt Mechanism / Swivel Plate
- Wheel Caster (01-05)

**Bed Parts:**
- Headboard / Footboard
- Side Rail (Left/Right) / Center Rail / Center Leg
- Mattress Support / Bed Slat (auto-increments) / Bed Support Bar
- Storage Drawer / Bed Box / Hydraulic Lift

**Hardware - Fasteners:**
- Wood Screw (auto-increments) / Machine Screw / Self-tapping Screw
- Confirmat Screw / Drywall Screw
- Hex Bolt / Carriage Bolt / Socket Bolt / Anchor Bolt
- Threaded Rod / Bolt / Nut / Lock Nut / Wing Nut
- Washer / Spring Washer
- Nail (auto-increments) / Staple (auto-increments)

**Hardware - Joining:**
- Cam Lock / Cam Bolt / Cross Dowel / Barrel Nut
- Dowel / Wood Dowel / Metal Dowel
- Connector Pin / Joining Plate / Connecting Bolt
- Joint Connector / Corner Connector

**Hardware - Hinges:**
- Concealed Hinge / Soft-close Hinge / Pivot Hinge
- Piano Hinge / Butt Hinge / Corner Hinge
- Glass Door Hinge / Lift Up Hinge

**Hardware - Brackets:**
- L Bracket (auto-increments) / Corner Bracket (auto-increments)
- Angle Bracket (auto-increments) / Flat Bracket

**Hardware - Handles:**
- Handle / Pull Handle / Knob / Finger Pull

**Materials - Trim:**
- Trim / Top Trim / Bottom Trim / Side Trim
- Decorative Strip / Molding / Skirting / Crown Molding
- Edge Band / Veneer / Laminate

**Materials - Adhesives:**
- Wood Glue / Adhesive / Silicone / Sealant

**Reference Parts:**
- Pivot Empty / Door Pivot / Drawer Pivot
- Assembly Point / Snap Point
- Reference Plane / Reference Image
- Collision Mesh / Low Poly / High Poly
- UV Helper / Material Holder

**Custom:**
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
