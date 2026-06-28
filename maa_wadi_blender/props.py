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


# All part type items for search filtering (sorted alphabetically)
ALL_PART_TYPES = [
    ("ACCESSORY_TRAY", "Accessory Tray", "Accessory tray"),
    ("ADJUSTABLE_FOOT", "Adjustable Foot", "Adjustable foot"),
    ("ADJUSTABLE_LEG", "Adjustable Leg", "Adjustable leg"),
    ("ADJUSTABLE_SHELF", "Adjustable Shelf", "Adjustable shelf"),
    ("ADHESIVE", "Adhesive", "Adhesive"),
    ("ANCHOR_BOLT", "Anchor Bolt", "Anchor bolt"),
    ("ANGLE_BRACKET", "Angle Bracket", "Angle bracket"),
    ("APRON_FRONT", "Apron Front", "Apron front"),
    ("APRON_LEFT", "Apron Left", "Apron left"),
    ("APRON_REAR", "Apron Rear", "Apron rear"),
    ("APRON_RIGHT", "Apron Right", "Apron right"),
    ("ARM_PAD_LEFT", "Arm Pad Left", "Arm pad left"),
    ("ARM_PAD_RIGHT", "Arm Pad Right", "Arm pad right"),
    ("ARMREST_LEFT", "Armrest Left", "Armrest left"),
    ("ARMREST_RIGHT", "Armrest Right", "Armrest right"),
    ("ASSEMBLY_POINT", "Assembly Point", "Assembly point"),
    ("BACK_FRAME", "Back Frame", "Back frame"),
    ("BACK_PANEL", "Back Panel", "Back panel"),
    ("BACKREST", "Backrest", "Backrest"),
    ("BARREL_NUT", "Barrel Nut", "Barrel nut"),
    ("BASE", "Plinth", "Base / Plinth"),
    ("BASE_FRAME", "Base Frame", "Base frame"),
    ("BED_BOX", "Bed Box", "Bed box"),
    ("BED_SLAT", "Bed Slat", "Bed slat"),
    ("BED_SUPPORT_BAR", "Bed Support Bar", "Bed support bar"),
    ("BELT_RACK", "Belt Rack", "Belt rack"),
    ("BOTTOM_PANEL", "Bottom Panel", "Bottom panel"),
    ("BOTTOM_RAIL", "Bottom Rail", "Bottom rail"),
    ("BOTTOM_TRACK", "Bottom Track", "Bottom track"),
    ("BOTTOM_TRIM", "Bottom Trim", "Bottom trim"),
    ("BOLT", "Bolt", "Bolt"),
    ("BUTT_HINGE", "Butt Hinge", "Butt hinge"),
    ("CABINET_BACK", "Cabinet Back", "Cabinet back"),
    ("CABINET_BOTTOM", "Cabinet Bottom", "Cabinet bottom"),
    ("CABINET_DOOR_LEFT", "Cabinet Door Left", "Cabinet door left"),
    ("CABINET_DOOR_RIGHT", "Cabinet Door Right", "Cabinet door right"),
    ("CABINET_HINGED_DOOR_LEFT", "Cabinet Hinged Door Left", "Cabinet hinged door left"),
    ("CABINET_HINGED_DOOR_RIGHT", "Cabinet Hinged Door Right", "Cabinet hinged door right"),
    ("CABINET_HANDLE", "Cabinet Handle", "Cabinet handle"),
    ("CABINET_KEY", "Cabinet Key", "Cabinet key"),
    ("CABINET_LEFT_SIDE", "Cabinet Left Side", "Cabinet left side"),
    ("CABINET_LOCK", "Cabinet Lock", "Cabinet lock"),
    ("CABINET_RIGHT_SIDE", "Cabinet Right Side", "Cabinet right side"),
    ("CABINET_SHELF", "Cabinet Shelf", "Cabinet shelf"),
    ("CABINET_TOP", "Cabinet Top", "Cabinet top"),
    ("CAM_BOLT", "Cam Bolt", "Cam bolt"),
    ("CAM_LOCK", "Cam Lock", "Cam lock"),
    ("CARRIER_BOLT", "Carriage Bolt", "Carriage bolt"),
    ("CASTER_WHEEL", "Caster Wheel", "Caster wheel"),
    ("CENTER_DIVIDER", "Center Divider", "Center divider"),
    ("CENTER_LEG", "Center Leg", "Center leg"),
    ("CENTER_PANEL", "Center Panel", "Center panel"),
    ("CENTER_RAIL", "Center Rail", "Center rail"),
    ("CHAIR_BASE", "Chair Base", "Chair base"),
    ("CHAIR_SEAT", "Chair Seat", "Chair seat"),
    ("COLLISION_MESH", "Collision Mesh", "Collision mesh"),
    ("CONFIRMAT_SCREW", "Confirmat Screw", "Confirmat screw"),
    ("CONNECTING_BOLT", "Connecting Bolt", "Connecting bolt"),
    ("CONNECTOR_PIN", "Connector Pin", "Connector pin"),
    ("CONCEALED_HINGE", "Concealed Hinge", "Concealed hinge"),
    ("CORNER_BLOCK", "Corner Block", "Corner block"),
    ("CORNER_BRACKET", "Corner Bracket", "Corner bracket"),
    ("CORNER_CONNECTOR", "Corner Connector", "Corner connector"),
    ("CORNER_HINGE", "Corner Hinge", "Corner hinge"),
    ("CORNER_POST", "Corner Post", "Corner post"),
    ("CROSS_BRACE", "Cross Brace", "Cross brace"),
    ("CROSS_DIVIDER", "Cross Divider", "Cross divider"),
    ("CROSS_DOWEL", "Cross Dowel", "Cross dowel"),
    ("CROSS_MEMBER", "Cross Member", "Cross member"),
    ("CROSS_RAIL", "Cross Rail", "Cross rail"),
    ("CROSS_SUPPORT", "Cross Support", "Cross support"),
    ("CUSTOM", "Custom", "Custom part name"),
    ("CPU_HOLDER", "CPU Holder", "CPU holder"),
    ("CROWN_MOLDING", "Crown Molding", "Crown molding"),
    ("DECORATIVE_STRIP", "Decorative Strip", "Decorative strip"),
    ("DESK_TOP", "Desk Top", "Desk top"),
    ("DIAGONAL_BRACE", "Diagonal Brace", "Diagonal brace"),
    ("DIVIDER_PANEL", "Divider Panel", "Divider panel"),
    ("DOOR_BUFFER", "Door Buffer", "Door buffer"),
    ("DOOR_CATCH", "Door Catch", "Door catch"),
    ("DOOR_CAP_BOTTOM", "Door Cap Bottom", "Door cap bottom"),
    ("DOOR_CAP_TOP", "Door Cap Top", "Door cap top"),
    ("DOOR_CLOSER", "Door Closer", "Door closer"),
    ("DOOR_EDGE_LEFT", "Door Edge Left", "Door edge left"),
    ("DOOR_EDGE_RIGHT", "Door Edge Right", "Door edge right"),
    ("DOOR_FRAME", "Door Frame", "Door frame"),
    ("DOOR_HANDLE", "Door Handle", "Door handle"),
    ("DOOR_KNOB", "Door Knob", "Door knob"),
    ("DOOR_LATCH", "Door Latch", "Door latch"),
    ("DOOR_LEAF", "Door Leaf", "Door leaf"),
    ("DOOR_LOCK", "Door Lock", "Door lock"),
    ("DOOR_MAGNET", "Door Magnet", "Door magnet"),
    ("DOOR_MIRROR", "Door Mirror", "Door mirror"),
    ("DOOR_PANEL", "Door Panel", "Door panel"),
    ("DOOR_PIVOT", "Door Pivot", "Door pivot"),
    ("DOOR_RAIL_BOTTOM", "Door Rail Bottom", "Door rail bottom"),
    ("DOOR_RAIL_MIDDLE", "Door Rail Middle", "Door rail middle"),
    ("DOOR_RAIL_TOP", "Door Rail Top", "Door rail top"),
    ("DOOR_SEAL", "Door Seal", "Door seal"),
    ("DOOR_STILE_LEFT", "Door Stile Left", "Door stile left"),
    ("DOOR_STILE_RIGHT", "Door Stile Right", "Door stile right"),
    ("DOOR_STOPPER", "Door Stopper", "Door stopper"),
    ("DOWEL", "Dowel", "Dowel"),
    ("DRAWER_BACK", "Drawer Back", "Drawer back"),
    ("DRAWER_BOTTOM", "Drawer Bottom", "Drawer bottom"),
    ("DRAWER_BOX", "Drawer Box", "Drawer box"),
    ("DRAWER_DIVIDER", "Drawer Divider", "Drawer divider"),
    ("DRAWER_FRONT", "Drawer Front", "Drawer front"),
    ("DRAWER_GUIDE", "Drawer Guide", "Drawer guide"),
    ("DRAWER_HANDLE", "Drawer Handle", "Drawer handle"),
    ("DRAWER_INSERT", "Drawer Insert", "Drawer insert"),
    ("DRAWER_PIVOT", "Drawer Pivot", "Drawer pivot"),
    ("DRAWER_PULL", "Drawer Pull", "Drawer pull"),
    ("DRAWER_RUNNER_LEFT", "Drawer Runner Left", "Drawer runner left"),
    ("DRAWER_RUNNER_RIGHT", "Drawer Runner Right", "Drawer runner right"),
    ("DRAWER_SIDE_LEFT", "Drawer Side Left", "Drawer side left"),
    ("DRAWER_SIDE_RIGHT", "Drawer Side Right", "Drawer side right"),
    ("DRAWER_SLIDE_LEFT", "Drawer Slide Left", "Drawer slide left"),
    ("DRAWER_SLIDE_RIGHT", "Drawer Slide Right", "Drawer slide right"),
    ("DRAWER_SPACER", "Drawer Spacer", "Drawer spacer"),
    ("DRAWER_STOP", "Drawer Stop", "Drawer stop"),
    ("DRAWER_TRACK", "Drawer Track", "Drawer track"),
    ("DROP_LEAF", "Drop Leaf", "Drop leaf"),
    ("DRYWALL_SCREW", "Drywall Screw", "Drywall screw"),
    ("EDGE_BAND", "Edge Band", "Edge band"),
    ("EXTENSION_TOP", "Extension Top", "Extension top"),
    ("FACE_FRAME", "Face Frame", "Face frame"),
    ("FINGER_PULL", "Finger Pull", "Finger pull"),
    ("FIXED_SHELF", "Fixed Shelf", "Fixed shelf"),
    ("FLAT_BRACKET", "Flat Bracket", "Flat bracket"),
    ("FOOT", "Foot", "Foot"),
    ("FOOTBOARD", "Footboard", "Footboard"),
    ("FOOT_PAD", "Foot Pad", "Foot pad"),
    ("FOOT_REST", "Foot Rest", "Foot rest"),
    ("FRAME", "Frame", "Frame"),
    ("FRONT_PANEL", "Front Panel", "Front panel"),
    ("FRONT_RAIL", "Front Rail", "Front rail"),
    ("FRONT_SUPPORT", "Front Support", "Front support"),
    ("GAS_CYLINDER", "Gas Cylinder", "Gas cylinder"),
    ("GLASS_DOOR_HINGE", "Glass Door Hinge", "Glass door hinge"),
    ("GLASS_PANEL", "Glass Panel", "Glass panel"),
    ("GLASS_SHELF", "Glass Shelf", "Glass shelf"),
    ("GUIDE_RAIL", "Guide Rail", "Guide rail"),
    ("GUIDE_TRACK", "Guide Track", "Guide track"),
    ("GUIDE_WHEEL", "Guide Wheel", "Guide wheel"),
    ("HANDLE", "Handle", "Handle"),
    ("HANGING_ROD", "Hanging Rod", "Hanging rod"),
    ("HEADBOARD", "Headboard", "Headboard"),
    ("HEADREST", "Headrest", "Headrest"),
    ("HEX_BOLT", "Hex Bolt", "Hex bolt"),
    ("HIGH_POLY", "High Poly", "High poly"),
    ("HINGE", "Lift Up Hinge", "Lift up hinge"),
    ("HORIZONTAL_DIVIDER", "Horizontal Divider", "Horizontal divider"),
    ("HYDRAULIC_LIFT", "Hydraulic Lift", "Hydraulic lift"),
    ("INNER_DIVIDER", "Inner Divider", "Inner divider"),
    ("INTERNAL_LIGHT", "Internal Light", "Internal light"),
    ("JOINING_PLATE", "Joining Plate", "Joining plate"),
    ("JOINT_CONNECTOR", "Joint Connector", "Joint connector"),
    ("JEWELRY_TRAY", "Jewelry Tray", "Jewelry tray"),
    ("KEYBOARD_TRAY", "Keyboard Tray", "Keyboard tray"),
    ("KNOB", "Knob", "Knob"),
    ("LAMINATE", "Laminate", "Laminate"),
    ("L_BRACKET", "L Bracket", "L bracket"),
    ("LAUNDRY_BASKET", "Laundry Basket", "Laundry basket"),
    ("LED_STRIP", "LED Strip", "LED strip"),
    ("LEFT_RAIL", "Left Rail", "Left rail"),
    ("LEFT_SIDE_PANEL", "Left Side Panel", "Left side panel"),
    ("LEG", "Leg", "Leg"),
    ("LEG_FRONT_LEFT", "Leg Front Left", "Front left leg"),
    ("LEG_FRONT_RIGHT", "Leg Front Right", "Front right leg"),
    ("LEG_REAR_LEFT", "Leg Rear Left", "Rear left leg"),
    ("LEG_REAR_RIGHT", "Leg Rear Right", "Rear right leg"),
    ("LIFT_UP_HINGE", "Lift Up Hinge", "Lift up hinge"),
    ("LOCK_NUT", "Lock Nut", "Lock nut"),
    ("LOWER_FRAME", "Lower Frame", "Lower frame"),
    ("LOW_POLY", "Low Poly", "Low poly"),
    ("LUMBAR_SUPPORT", "Lumbar Support", "Lumbar support"),
    ("MACHINE_SCREW", "Machine Screw", "Machine screw"),
    ("MATERIAL_HOLDER", "Material Holder", "Material holder"),
    ("MATTRESS_SUPPORT", "Mattress Support", "Mattress support"),
    ("METAL_DOWEL", "Metal Dowel", "Metal dowel"),
    ("METAL_LEG", "Metal Leg", "Metal leg"),
    ("MIDDLE_SUPPORT", "Middle Support", "Middle support"),
    ("MIRROR_FRAME", "Mirror Frame", "Mirror frame"),
    ("MODESTY_PANEL", "Modesty Panel", "Modesty panel"),
    ("MOLDING", "Molding", "Molding"),
    ("MONITOR_STAND", "Monitor Stand", "Monitor stand"),
    ("MOTION_SENSOR", "Motion Sensor", "Motion sensor"),
    ("MOUNTING_PLATE", "Mounting Plate", "Mounting plate"),
    ("NAIL", "Nail", "Nail"),
    ("NUT", "Nut", "Nut"),
    ("OUTER_DIVIDER", "Outer Divider", "Outer divider"),
    ("PANEL_INSERT", "Panel Insert", "Panel insert"),
    ("PANT_RACK", "Pant Rack", "Pant rack"),
    ("PIANO_HINGE", "Piano Hinge", "Piano hinge"),
    ("PIVOT_EMPTY", "Pivot Empty", "Pivot empty"),
    ("PIVOT_HINGE", "Pivot Hinge", "Pivot hinge"),
    ("POWER_PANEL", "Power Panel", "Power panel"),
    ("PRIVACY_PANEL", "Privacy Panel", "Privacy panel"),
    ("PULL_HANDLE", "Pull Handle", "Pull handle"),
    ("REAR_PANEL", "Rear Panel", "Rear panel"),
    ("REAR_RAIL", "Rear Rail", "Rear rail"),
    ("REAR_SUPPORT", "Rear Support", "Rear support"),
    ("REFERENCE_IMAGE", "Reference Image", "Reference image"),
    ("REFERENCE_PLANE", "Reference Plane", "Reference plane"),
    ("REINFORCEMENT_BAR", "Reinforcement Bar", "Reinforcement bar"),
    ("RIGHT_RAIL", "Right Rail", "Right rail"),
    ("RIGHT_SIDE_PANEL", "Right Side Panel", "Right side panel"),
    ("ROD_BRACKET_LEFT", "Rod Bracket Left", "Rod bracket left"),
    ("ROD_BRACKET_RIGHT", "Rod Bracket Right", "Rod bracket right"),
    ("ROD_SUPPORT", "Rod Support", "Rod support"),
    ("ROLLER", "Roller", "Roller"),
    ("ROLLER_WHEEL", "Roller Wheel", "Roller wheel"),
    ("ROUND_LEG", "Round Leg", "Round leg"),
    ("RUBBER_FOOT", "Rubber Foot", "Rubber foot"),
    ("SEALANT", "Sealant", "Sealant"),
    ("SEAT_BASE", "Seat Base", "Seat base"),
    ("SEAT_CUSHION", "Seat Cushion", "Seat cushion"),
    ("SEAT_FRAME", "Seat Frame", "Seat frame"),
    ("SELF_TAPPING_SCREW", "Self-tapping Screw", "Self-tapping screw"),
    ("SHELF", "Shelf", "Shelf"),
    ("SHELF_BOTTOM", "Shelf Bottom", "Shelf bottom"),
    ("SHELF_BRACKET", "Shelf Bracket", "Shelf bracket"),
    ("SHELF_CLIP", "Shelf Clip", "Shelf clip"),
    ("SHELF_DIVIDER", "Shelf Divider", "Shelf divider"),
    ("SHELF_HOLDER", "Shelf Holder", "Shelf holder"),
    ("SHELF_INSERT", "Shelf Insert", "Shelf insert"),
    ("SHELF_PIN", "Shelf Pin", "Shelf pin"),
    ("SHELF_ROD", "Shelf Rod", "Shelf rod"),
    ("SHELF_SUPPORT", "Shelf Support", "Shelf support"),
    ("SHELF_TOP", "Shelf Top", "Shelf top"),
    ("SIDE_BRACE", "Side Brace", "Side brace"),
    ("SIDE_RAIL_LEFT", "Side Rail Left", "Side rail left"),
    ("SIDE_RAIL_RIGHT", "Side Rail Right", "Side rail right"),
    ("SIDE_SUPPORT", "Side Support", "Side support"),
    ("SIDE_TRIM", "Side Trim", "Side trim"),
    ("SILICONE", "Silicone", "Silicone"),
    ("SKIRTING", "Skirting", "Skirting"),
    ("SLIDING_DOOR_LEFT", "Sliding Door Left", "Sliding door left"),
    ("SLIDING_DOOR_RIGHT", "Sliding Door Right", "Sliding door right"),
    ("SNAP_POINT", "Snap Point", "Snap point"),
    ("SOFT_CLOSE_HINGE", "Soft-close Hinge", "Soft-close hinge"),
    ("SOFT_CLOSE_SYSTEM", "Soft Close System", "Soft close system"),
    ("SQUARE_LEG", "Square Leg", "Square leg"),
    ("STAPLE", "Staple", "Staple"),
    ("STORAGE_BASKET", "Storage Basket", "Storage basket"),
    ("STORAGE_DRAWER", "Storage Drawer", "Storage drawer"),
    ("STOPPER", "Stopper", "Stopper"),
    ("STRETCH_BAR", "Stretch Bar", "Stretch bar"),
    ("SUB_FRAME", "Sub Frame", "Sub frame"),
    ("SUPPORT_BAR", "Support Bar", "Support bar"),
    ("SUPPORT_BEAM", "Support Beam", "Support beam"),
    ("SUPPORT_RAIL", "Support Rail", "Support rail"),
    ("SWIVEL_PLATE", "Swivel Plate", "Swivel plate"),
    ("TABLE_TOP", "Table Top", "Table top"),
    ("THREADED_ROD", "Threaded Rod", "Threaded rod"),
    ("TIE_RACK", "Tie Rack", "Tie rack"),
    ("TILT_MECHANISM", "Tilt Mechanism", "Tilt mechanism"),
    ("TOE_KICK", "Toe Kick", "Toe kick"),
    ("TOP_PANEL", "Top Panel", "Top panel"),
    ("TOP_RAIL", "Top Rail", "Top rail"),
    ("TOP_TRACK", "Top Track", "Top track"),
    ("TOP_TRIM", "Top Trim", "Top trim"),
    ("TRIM", "Trim", "Trim"),
    ("UV_HELPER", "UV Helper", "UV helper"),
    ("VERTICAL_DIVIDER", "Vertical Divider", "Vertical divider"),
    ("VENEER", "Veneer", "Veneer"),
    ("WARDROBE_BACK", "Wardrobe Back", "Wardrobe back"),
    ("WARDROBE_BASKET", "Wardrobe Basket", "Wardrobe basket"),
    ("WARDROBE_BOTTOM", "Wardrobe Bottom", "Wardrobe bottom"),
    ("WARDROBE_CENTER_DIVIDER", "Wardrobe Center Divider", "Wardrobe center divider"),
    ("WARDROBE_DOOR_LEFT", "Wardrobe Door Left", "Wardrobe door left"),
    ("WARDROBE_DOOR_RIGHT", "Wardrobe Door Right", "Wardrobe door right"),
    ("WARDROBE_DRAWER", "Wardrobe Drawer", "Wardrobe drawer"),
    ("WARDROBE_HINGED_DOOR_LEFT", "Wardrobe Hinged Door Left", "Wardrobe hinged door left"),
    ("WARDROBE_HINGED_DOOR_RIGHT", "Wardrobe Hinged Door Right", "Wardrobe hinged door right"),
    ("WARDROBE_HANDLE_LEFT", "Wardrobe Handle Left", "Wardrobe handle left"),
    ("WARDROBE_HANDLE_RIGHT", "Wardrobe Handle Right", "Wardrobe handle right"),
    ("WARDROBE_HANGING_ROD", "Wardrobe Hanging Rod", "Wardrobe hanging rod"),
    ("WARDROBE_LEFT_SIDE", "Wardrobe Left Side", "Wardrobe left side"),
    ("WARDROBE_MIRROR_PANEL", "Wardrobe Mirror Panel", "Wardrobe mirror panel"),
    ("WARDROBE_RIGHT_SIDE", "Wardrobe Right Side", "Wardrobe right side"),
    ("WARDROBE_SHOE_RACK", "Wardrobe Shoe Rack", "Wardrobe shoe rack"),
    ("WARDROBE_TIE_RACK", "Wardrobe Tie Rack", "Wardrobe tie rack"),
    ("WARDROBE_TOP", "Wardrobe Top", "Wardrobe top"),
    ("WASHER", "Washer", "Washer"),
    ("WHEEL_CASTER_01", "Wheel Caster 01", "Wheel caster 01"),
    ("WHEEL_CASTER_02", "Wheel Caster 02", "Wheel caster 02"),
    ("WHEEL_CASTER_03", "Wheel Caster 03", "Wheel caster 03"),
    ("WHEEL_CASTER_04", "Wheel Caster 04", "Wheel caster 04"),
    ("WHEEL_CASTER_05", "Wheel Caster 05", "Wheel caster 05"),
    ("WHEEL_LOCK", "Wheel Lock", "Wheel lock"),
    ("WIRE_ORGANIZER", "Wire Organizer", "Wire organizer"),
    ("WOOD_DOWEL", "Wood Dowel", "Wood dowel"),
    ("WOOD_GLUE", "Wood Glue", "Wood glue"),
    ("WOOD_LEG", "Wood Leg", "Wood leg"),
    ("WOOD_SCREW", "Wood Screw", "Wood screw"),
]


def get_filtered_part_types(self, context):
    """Get filtered part types based on search"""
    # Handle case during registration when bcl_settings doesn't exist yet
    if not hasattr(context.scene, 'bcl_settings'):
        return ALL_PART_TYPES
    
    st = context.scene.bcl_settings
    search_term = getattr(st, 'part_search', '').lower()
    
    if not search_term:
        return ALL_PART_TYPES
    
    filtered = [item for item in ALL_PART_TYPES 
                if search_term in item[1].lower() or search_term in item[2].lower()]
    
    return filtered if filtered else ALL_PART_TYPES


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
        items=ALL_PART_TYPES,
        default="TOP_PANEL",
    )
    custom_part_name: StringProperty(name="Custom Name", default="")
    
    part_search: StringProperty(
        name="Search",
        description="Search part types",
        default=""
    )
    
    hardware_list: StringProperty(
        name="Hardware List",
        description="JSON string containing detected hardware items",
        default="[]"
    )


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
