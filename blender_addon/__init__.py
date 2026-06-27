bl_info = {
    "name": "Maa Wadi Mv - Wood Cutting Optimizer",
    "author": "Retts Web Dev",
    "version": (1, 1, 0),
    "blender": (2, 80, 0),
    "location": "View3D > Sidebar > Maa Wadi",
    "description": "Export furniture pieces to CSV for wood cutting optimization with cost estimation and real-time sync",
    "category": "Import-Export",
}

import bpy
import os
import json
import threading
import urllib.request
from bpy.types import Panel, Operator, PropertyGroup
from bpy.props import StringProperty, FloatProperty, IntProperty, BoolProperty, CollectionProperty, EnumProperty
import csv

# ============================================================================
# PROPERTIES
# ============================================================================

class MaaWadiPieceProperty(PropertyGroup):
    name: StringProperty(name="Piece Name", default="")
    length: FloatProperty(name="Length (mm)", default=0.0)
    width: FloatProperty(name="Width (mm)", default=0.0)
    thickness: FloatProperty(name="Thickness (mm)", default=18.0)
    teak_top: BoolProperty(name="Teak Top", default=False)
    teak_bottom: BoolProperty(name="Teak Bottom", default=False)
    teak_left: BoolProperty(name="Teak Left", default=False)
    teak_right: BoolProperty(name="Teak Right", default=False)
    obj_name: StringProperty(name="Object Name", default="")

class MaaWadiSettings(PropertyGroup):
    export_path: StringProperty(
        name="Export Path",
        default="//",
        subtype='DIR_PATH',
        description="Path to export CSV files"
    )
    sheet_width: FloatProperty(name="Sheet Width (mm)", default=2440.0)
    sheet_height: FloatProperty(name="Sheet Height (mm)", default=1220.0)
    sheet_cost: FloatProperty(name="Sheet Cost (MVR)", default=750.0)
    cut_cost: FloatProperty(name="Cut Cost (MVR)", default=10.0)
    teak_cost: FloatProperty(name="Teak Cost (MVR/m)", default=10.0)
    pieces: CollectionProperty(type=MaaWadiPieceProperty)
    enable_sync: BoolProperty(name="Enable Real-time Sync", default=False)
    sync_status: StringProperty(name="Sync Status", default="Disconnected")

# ============================================================================
# OPERATORS
# ============================================================================

class MAWAADI_OT_AddPiece(Operator):
    bl_idname = "maa_wadi.add_piece"
    bl_label = "Add Selected Object"
    bl_description = "Add selected object to pieces list"
    
    @classmethod
    def poll(cls, context):
        return context.active_object is not None
    
    def execute(self, context):
        obj = context.active_object
        settings = context.scene.maa_wadi_settings
        
        # Calculate dimensions from bounding box
        bbox = obj.bound_box
        dimensions = obj.dimensions
        
        # Convert to mm (Blender uses meters by default)
        length_mm = dimensions.x * 1000
        width_mm = dimensions.y * 1000
        
        piece = settings.pieces.add()
        piece.name = obj.name
        piece.length = length_mm
        piece.width = width_mm
        piece.thickness = 18.0  # Default thickness
        piece.obj_name = obj.name
        
        self.report({'INFO'}, f"Added {obj.name} ({length_mm:.0f}×{width_mm:.0f}mm)")
        return {'FINISHED'}

class MAWAADI_OT_RemovePiece(Operator):
    bl_idname = "maa_wadi.remove_piece"
    bl_label = "Remove Piece"
    bl_description = "Remove selected piece from list"
    
    index: IntProperty(name="Index")
    
    def execute(self, context):
        settings = context.scene.maa_wadi_settings
        settings.pieces.remove(self.index)
        return {'FINISHED'}

class MAWAADI_OT_ClearPieces(Operator):
    bl_idname = "maa_wadi.clear_pieces"
    bl_label = "Clear All"
    bl_description = "Clear all pieces from list"
    
    def execute(self, context):
        settings = context.scene.maa_wadi_settings
        settings.pieces.clear()
        return {'FINISHED'}

class MAWAADI_OT_ExportCSV(Operator):
    bl_idname = "maa_wadi.export_csv"
    bl_label = "Export CSV"
    bl_description = "Export pieces to CSV file"
    
    filepath: StringProperty(subtype='FILE_PATH')
    
    def invoke(self, context, event):
        settings = context.scene.maa_wadi_settings
        self.filepath = os.path.join(settings.export_path, "furniture_pieces.csv")
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}
    
    def execute(self, context):
        settings = context.scene.maa_wadi_settings
        
        if len(settings.pieces) == 0:
            self.report({'WARNING'}, "No pieces to export")
            return {'CANCELLED'}
        
        try:
            with open(self.filepath, 'w', newline='') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(['Part', 'Qty', 'Length (mm)', 'Width (mm)', 'Thickness (mm)', 'Material'])
                
                for piece in settings.pieces:
                    teak_sides = []
                    if piece.teak_top: teak_sides.append('top')
                    if piece.teak_bottom: teak_sides.append('bottom')
                    if piece.teak_left: teak_sides.append('left')
                    if piece.teak_right: teak_sides.append('right')
                    
                    teak_note = f" Teak: {','.join(teak_sides)}" if teak_sides else ""
                    material = f"Wood{teak_note}"
                    
                    writer.writerow([
                        piece.name,
                        1,
                        f"{piece.length:.0f}",
                        f"{piece.width:.0f}",
                        f"{piece.thickness:.0f}",
                        material
                    ])
            
            self.report({'INFO'}, f"Exported {len(settings.pieces)} pieces to {self.filepath}")
            return {'FINISHED'}
        except Exception as e:
            self.report({'ERROR'}, f"Export failed: {str(e)}")
            return {'CANCELLED'}

class MAWAADI_OT_CalculateCost(Operator):
    bl_idname = "maa_wadi.calculate_cost"
    bl_label = "Calculate Cost"
    bl_description = "Calculate estimated cost"
    
    def execute(self, context):
        settings = context.scene.maa_wadi_settings
        
        if len(settings.pieces) == 0:
            self.report({'WARNING'}, "No pieces to calculate")
            return {'CANCELLED'}
        
        # Simple estimation (actual optimization happens in web app)
        total_area = sum(p.length * p.width for p in settings.pieces)
        sheet_area = settings.sheet_width * settings.sheet_height
        estimated_sheets = max(1, int(total_area / sheet_area * 1.2))  # 20% waste buffer
        
        estimated_cuts = len(settings.pieces) * 2  # Rough estimate
        total_teak_length = 0
        
        for piece in settings.pieces:
            if piece.teak_top: total_teak_length += piece.length
            if piece.teak_bottom: total_teak_length += piece.length
            if piece.teak_left: total_teak_length += piece.width
            if piece.teak_right: total_teak_length += piece.width
        
        total_teak_meters = total_teak_length / 1000
        
        sheet_total = estimated_sheets * settings.sheet_cost
        cuts_total = estimated_cuts * settings.cut_cost
        teak_total = total_teak_meters * settings.teak_cost
        grand_total = sheet_total + cuts_total + teak_total
        
        # Store in scene properties for display
        context.scene.maa_wadi_estimated_sheets = estimated_sheets
        context.scene.maa_wadi_estimated_cost = grand_total
        context.scene.maa_wadi_estimated_cuts = estimated_cuts
        context.scene.maa_wadi_estimated_teak = total_teak_meters
        
        self.report({'INFO'}, f"Estimated: {estimated_sheets} sheets, {grand_total:.0f} MVR")
        return {'FINISHED'}

class MAWAADI_OT_EnableSync(Operator):
    bl_idname = "maa_wadi.enable_sync"
    bl_label = "Enable Sync"
    bl_description = "Enable real-time sync to web app"
    
    def execute(self, context):
        settings = context.scene.maa_wadi_settings
        settings.enable_sync = True
        settings.sync_status = "Connecting..."
        
        # Start sync thread
        thread = threading.Thread(target=sync_to_firebase, args=(context,))
        thread.daemon = True
        thread.start()
        
        return {'FINISHED'}

class MAWAADI_OT_DisableSync(Operator):
    bl_idname = "maa_wadi.disable_sync"
    bl_label = "Disable Sync"
    bl_description = "Disable real-time sync"
    
    def execute(self, context):
        settings = context.scene.maa_wadi_settings
        settings.enable_sync = False
        settings.sync_status = "Disconnected"
        return {'FINISHED'}

class MAWAADI_OT_SyncNow(Operator):
    bl_idname = "maa_wadi.sync_now"
    bl_label = "Sync Now"
    bl_description = "Sync pieces to web app immediately"
    
    def execute(self, context):
        settings = context.scene.maa_wadi_settings
        settings.sync_status = "Syncing..."
        
        # Sync in background thread
        thread = threading.Thread(target=sync_to_firebase, args=(context,))
        thread.daemon = True
        thread.start()
        
        return {'FINISHED'}

def sync_to_firebase(context):
    """Sync pieces to Firebase Realtime Database"""
    import time
    
    settings = context.scene.maa_wadi_settings
    
    # Firebase REST API endpoint
    firebase_url = "https://maa-wadi-mv-default-rtdb.firebaseio.com/blender/pieces.json"
    
    while settings.enable_sync:
        try:
            # Prepare pieces data
            pieces_data = {}
            for i, piece in enumerate(settings.pieces):
                pieces_data[str(i)] = {
                    'name': piece.name,
                    'length': piece.length,
                    'width': piece.width,
                    'thickness': piece.thickness,
                    'teak_top': piece.teak_top,
                    'teak_bottom': piece.teak_bottom,
                    'teak_left': piece.teak_left,
                    'teak_right': piece.teak_right,
                    'timestamp': time.time()
                }
            
            # Send to Firebase
            data = json.dumps(pieces_data).encode('utf-8')
            req = urllib.request.Request(
                firebase_url,
                data=data,
                method='PUT',
                headers={'Content-Type': 'application/json'}
            )
            
            with urllib.request.urlopen(req) as response:
                if response.getcode() == 200:
                    settings.sync_status = f"Connected ({len(settings.pieces)} pieces)"
                else:
                    settings.sync_status = "Sync error"
                    
        except Exception as e:
            settings.sync_status = f"Error: {str(e)[:20]}"
        
        # Wait before next sync (5 seconds)
        for _ in range(50):
            if not settings.enable_sync:
                break
            time.sleep(0.1)

# ============================================================================
# PANEL
# ============================================================================

class MAWAADI_PT_MainPanel(Panel):
    bl_label = "Maa Wadi Mv"
    bl_idname = "MAWAADI_PT_main_panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = 'Maa Wadi'
    
    def draw(self, context):
        layout = self.layout
        settings = context.scene.maa_wadi_settings
        
        # Settings section
        box = layout.box()
        box.label(text="Sheet Settings", icon='PROPERTIES')
        box.prop(settings, "sheet_width")
        box.prop(settings, "sheet_height")
        box.prop(settings, "sheet_cost")
        box.prop(settings, "cut_cost")
        box.prop(settings, "teak_cost")
        
        # Export path
        box.prop(settings, "export_path")
        
        # Add pieces section
        box = layout.box()
        box.label(text="Add Pieces", icon='PLUS')
        box.operator("maa_wadi.add_piece")
        
        # Pieces list
        box = layout.box()
        box.label(text=f"Pieces ({len(settings.pieces)})", icon='GROUP')
        
        if len(settings.pieces) > 0:
            row = box.row()
            row.operator("maa_wadi.clear_pieces")
            
            for i, piece in enumerate(settings.pieces):
                piece_box = box.box()
                row = piece_box.row()
                row.label(text=f"{i+1}. {piece.name}")
                row.operator("maa_wadi.remove_piece", text="", icon='X').index = i
                
                piece_box.prop(piece, "length")
                piece_box.prop(piece, "width")
                piece_box.prop(piece, "thickness")
                
                teak_box = piece_box.box()
                teak_box.label(text="Teak Edges:")
                row = teak_box.row()
                row.prop(piece, "teak_top", text="Top")
                row.prop(piece, "teak_bottom", text="Bottom")
                row = teak_box.row()
                row.prop(piece, "teak_left", text="Left")
                row.prop(piece, "teak_right", text="Right")
        else:
            box.label(text="No pieces added yet")
        
        # Cost estimation
        box = layout.box()
        box.label(text="Cost Estimation", icon='MONEY')
        box.operator("maa_wadi.calculate_cost")
        
        if hasattr(context.scene, 'maa_wadi_estimated_sheets'):
            box.label(text=f"Estimated Sheets: {context.scene.maa_wadi_estimated_sheets}")
            box.label(text=f"Estimated Cuts: {context.scene.maa_wadi_estimated_cuts}")
            box.label(text=f"Teak Length: {context.scene.maa_wadi_estimated_teak:.2f}m")
            box.label(text=f"Total Cost: {context.scene.maa_wadi_estimated_cost:.0f} MVR")
        
        # Export
        box = layout.box()
        box.label(text="Export", icon='EXPORT')
        box.operator("maa_wadi.export_csv")
        
        # Real-time Sync
        box = layout.box()
        box.label(text="Real-time Sync", icon='SYNC')
        
        settings = context.scene.maa_wadi_settings
        row = box.row()
        if settings.enable_sync:
            row.operator("maa_wadi.disable_sync")
        else:
            row.operator("maa_wadi.enable_sync")
        
        row.operator("maa_wadi.sync_now")
        
        box.label(text=f"Status: {settings.sync_status}")

# ============================================================================
# REGISTRATION
# ============================================================================

classes = (
    MaaWadiPieceProperty,
    MaaWadiSettings,
    MAWAADI_OT_AddPiece,
    MAWAADI_OT_RemovePiece,
    MAWAADI_OT_ClearPieces,
    MAWAADI_OT_ExportCSV,
    MAWAADI_OT_CalculateCost,
    MAWAADI_OT_EnableSync,
    MAWAADI_OT_DisableSync,
    MAWAADI_OT_SyncNow,
    MAWAADI_PT_MainPanel,
)

def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.maa_wadi_settings = bpy.props.PointerProperty(type=MaaWadiSettings)
    
    # Add cost estimation properties to scene
    bpy.types.Scene.maa_wadi_estimated_sheets = bpy.props.IntProperty(default=0)
    bpy.types.Scene.maa_wadi_estimated_cost = bpy.props.FloatProperty(default=0.0)
    bpy.types.Scene.maa_wadi_estimated_cuts = bpy.props.IntProperty(default=0)
    bpy.types.Scene.maa_wadi_estimated_teak = bpy.props.FloatProperty(default=0.0)

def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
    del bpy.types.Scene.maa_wadi_settings
    del bpy.types.Scene.maa_wadi_estimated_sheets
    del bpy.types.Scene.maa_wadi_estimated_cost
    del bpy.types.Scene.maa_wadi_estimated_cuts
    del bpy.types.Scene.maa_wadi_estimated_teak

if __name__ == "__main__":
    register()
