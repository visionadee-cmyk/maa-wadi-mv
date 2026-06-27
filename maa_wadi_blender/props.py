import bpy
from bpy.types import PropertyGroup
from bpy.props import (
    BoolProperty,
    CollectionProperty,
    EnumProperty,
    FloatProperty,
    FloatVectorProperty,
    IntProperty,
    PointerProperty,
    StringProperty,
)


class BCL_CutListItem(PropertyGroup):
    part_name: StringProperty(name="Part")
    qty: IntProperty(name="Qty", default=1, min=1)
    length: FloatProperty(name="Length")
    width: FloatProperty(name="Width")
    thickness: FloatProperty(name="Thickness")
    material: StringProperty(name="Material")
    pos_x: FloatProperty(name="Position X", default=0.0)
    pos_y: FloatProperty(name="Position Y", default=0.0)
    pos_z: FloatProperty(name="Position Z", default=0.0)


class BCL_Settings(PropertyGroup):
    source_collection: PointerProperty(name="Collection", type=bpy.types.Collection)

    unit_system: EnumProperty(
        name="Units",
        items=(("MM", "mm", "Millimeters"), ("IN", "in", "Inches")),
        default="MM",
    )
    rounding: IntProperty(name="Rounding", default=1, min=0, max=6)

    kerf: FloatProperty(name="Kerf", default=0.0, min=0.0, max=1000.0)
    include_children: BoolProperty(name="Include Children", default=True)

    group_identical: BoolProperty(name="Group Identical Parts", default=True)

    bulk_step: IntProperty(name="Bulk Step", default=1, min=1)
    auto_step_start: IntProperty(name="Auto Step Start", default=1, min=1)

    layout_columns: IntProperty(name="Layout Columns", default=3, min=1, max=6)
    layout_tile_px: IntProperty(name="Tile Size (px)", default=380, min=200, max=1200)

    render_callouts: BoolProperty(name="Render Callouts", default=True)
    callout_font_size: FloatProperty(name="Callout Size", default=0.08, min=0.005, max=2.0)

    outline_only: BoolProperty(name="Outline Only", default=True)
    render_arrows: BoolProperty(name="Render Arrows", default=True)
    arrow_thickness: FloatProperty(name="Arrow Thickness", default=0.01, min=0.001, max=0.2)

    items: CollectionProperty(type=BCL_CutListItem)
    active_index: IntProperty(default=0)
    
    # Firebase sync properties
    enable_sync: BoolProperty(name="Enable Real-time Sync", default=False)
    sync_status: StringProperty(name="Sync Status", default="Disconnected")
    model_base64: StringProperty(name="Model Base64", default="")
    
    # Part renamer properties
    part_name_type: EnumProperty(
        name="Part Type",
        items=(
            # Cabinet/Wardrobe parts
            ("DOOR_LEFT", "Door Left", "Left door panel"),
            ("DOOR_RIGHT", "Door Right", "Right door panel"),
            ("DRAWER_TOP", "Drawer Top", "Top drawer"),
            ("DRAWER_MIDDLE", "Drawer Middle", "Middle drawer"),
            ("DRAWER_BOTTOM", "Drawer Bottom", "Bottom drawer"),
            ("SHELF", "Shelf", "Adjustable shelf"),
            ("SIDE_PANEL_LEFT", "Side Panel Left", "Left side panel"),
            ("SIDE_PANEL_RIGHT", "Side Panel Right", "Right side panel"),
            ("TOP_PANEL", "Top Panel", "Top horizontal panel"),
            ("BOTTOM_PANEL", "Bottom Panel", "Bottom horizontal panel"),
            ("BACK_PANEL", "Back Panel", "Back panel"),
            ("DIVIDER", "Divider", "Vertical divider"),
            # Table parts
            ("TABLE_TOP", "Table Top", "Table surface"),
            ("TABLE_LEG", "Table Leg", "Table support leg"),
            ("TABLE_APRON", "Table Apron", "Table frame support"),
            ("TABLE_DRAWER", "Table Drawer", "Table storage drawer"),
            # Chair parts
            ("CHAIR_SEAT", "Chair Seat", "Chair seating surface"),
            ("CHAIR_BACK", "Chair Back", "Chair backrest"),
            ("CHAIR_LEG", "Chair Leg", "Chair support leg"),
            ("CHAIR_ARM", "Chair Arm", "Chair armrest"),
            # TV Rack parts
            ("TV_SHELF_TOP", "TV Shelf Top", "Top shelf for TV"),
            ("TV_SHELF_MIDDLE", "TV Shelf Middle", "Middle shelf"),
            ("TV_SHELF_BOTTOM", "TV Shelf Bottom", "Bottom shelf"),
            ("TV_BACK_PANEL", "TV Back Panel", "Back panel"),
            ("TV_SIDE_PANEL", "TV Side Panel", "Side panel"),
            # Bed parts
            ("BED_HEADBOARD", "Bed Headboard", "Headboard panel"),
            ("BED_FOOTBOARD", "Bed Footboard", "Footboard panel"),
            ("BED_SIDE_RAIL", "Bed Side Rail", "Side rail"),
            ("BED_SLAT", "Bed Slat", "Bed support slat"),
            ("BED_PLATFORM", "Bed Platform", "Bed platform base"),
            # Side Table parts
            ("SIDE_TABLE_TOP", "Side Table Top", "Side table surface"),
            ("SIDE_TABLE_SHELF", "Side Table Shelf", "Side table shelf"),
            ("SIDE_TABLE_LEG", "Side Table Leg", "Side table leg"),
            # General parts
            ("PANEL", "Panel", "Generic panel"),
            ("FRAME", "Frame", "Frame component"),
            ("BRACE", "Brace", "Support brace"),
            ("CUSTOM", "Custom", "Custom part name"),
        ),
        default="DOOR_LEFT",
    )
    custom_part_name: StringProperty(name="Custom Name", default="")


classes = (BCL_CutListItem, BCL_Settings)


def register():
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.Scene.bcl_settings = PointerProperty(type=BCL_Settings)

    bpy.types.Object.bcl_manual_step = IntProperty(name="Step", default=0, min=0)
    bpy.types.Object.bcl_manual_note = StringProperty(name="Note", default="")

    bpy.types.Object.bcl_explode_dir = FloatVectorProperty(name="Explode Dir", size=3, default=(0.0, 0.0, 1.0), subtype="DIRECTION")
    bpy.types.Object.bcl_explode_dist = FloatProperty(name="Explode Dist", default=0.0, min=0.0)


def unregister():
    try:
        del bpy.types.Scene.bcl_settings
    except Exception:
        pass

    try:
        del bpy.types.Object.bcl_manual_step
        del bpy.types.Object.bcl_manual_note
        del bpy.types.Object.bcl_explode_dir
        del bpy.types.Object.bcl_explode_dist
    except Exception:
        pass

    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
