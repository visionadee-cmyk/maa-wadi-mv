# Maa Wadi Mv Blender Addon

A comprehensive Blender addon for exporting furniture pieces to CSV for wood cutting optimization with cost estimation.

## Features

- **Piece Selection**: Add selected 3D objects to pieces list with auto-calculated dimensions
- **Teak Edge Selection**: Mark which edges need teak edging (top, bottom, left, right)
- **CSV Export**: Export pieces in the exact format required by the Maa Wadi Mv web app
- **Cost Estimation**: Real-time cost estimation based on sheet prices and cutting costs
- **Sheet Settings**: Configure sheet dimensions and costs

## Installation

1. Download the `blender_addon` folder
2. In Blender, go to `Edit > Preferences > Add-ons`
3. Click "Install..." and select the `__init__.py` file
4. Enable the addon by checking the box next to "Maa Wadi Mv"

## Usage

### Adding Pieces

1. Create or select furniture pieces in Blender
2. Select an object in the 3D viewport
3. In the "Maa Wadi" sidebar panel, click "Add Selected Object"
4. The piece will be added with its dimensions automatically calculated

### Configuring Teak Edges

1. In the pieces list, find the piece you want to configure
2. Check the boxes for edges that need teak edging:
   - Top
   - Bottom
   - Left
   - Right

### Cost Estimation

1. Configure sheet settings (width, height, costs)
2. Click "Calculate Cost" to see estimated costs
3. The addon shows:
   - Estimated number of sheets
   - Estimated number of cuts
   - Total teak length needed
   - Total cost in MVR

### Exporting to CSV

1. Set the export path in the settings
2. Click "Export CSV"
3. Choose a file location
4. Import the CSV into the Maa Wadi Mv web app for optimization

## Sheet Settings

- **Sheet Width**: Standard sheet width in mm (default: 2440mm)
- **Sheet Height**: Standard sheet height in mm (default: 1220mm)
- **Sheet Cost**: Cost per sheet in MVR
- **Cut Cost**: Cost per cut in MVR
- **Teak Cost**: Cost per meter of teak edging in MVR

## CSV Format

The addon exports CSV files in the following format:

```
Part,Qty,Length (mm),Width (mm),Thickness (mm),Material
Piece Name,1,1200,600,18,Wood Teak: top,bottom
```

## Tips

- Ensure your 3D models are in the correct scale (1 unit = 1 meter)
- The addon calculates dimensions from the object's bounding box
- Use the cost estimation as a rough guide - the web app provides exact optimization
- You can edit piece dimensions manually after adding them

## Compatibility

- Blender 2.80+
- Works with the Maa Wadi Mv web app

## Support

For issues or questions, contact: retey.ay@hotmail.com
