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
            # Body parts
            ("TOP_PANEL", "Top Panel", "Top panel"),
            ("BOTTOM_PANEL", "Bottom Panel", "Bottom panel"),
            ("LEFT_SIDE_PANEL", "Left Side Panel", "Left side panel"),
            ("RIGHT_SIDE_PANEL", "Right Side Panel", "Right side panel"),
            ("FRONT_PANEL", "Front Panel", "Front panel"),
            ("REAR_PANEL", "Rear Panel", "Rear panel"),
            ("BACK_PANEL", "Back Panel", "Back panel"),
            ("CENTER_PANEL", "Center Panel", "Center panel"),
            ("CENTER_DIVIDER", "Center Divider", "Center divider"),
            ("VERTICAL_DIVIDER", "Vertical Divider", "Vertical divider"),
            ("HORIZONTAL_DIVIDER", "Horizontal Divider", "Horizontal divider"),
            ("INNER_DIVIDER", "Inner Divider", "Inner divider"),
            ("OUTER_DIVIDER", "Outer Divider", "Outer divider"),
            ("CROSS_DIVIDER", "Cross Divider", "Cross divider"),
            ("MIDDLE_SUPPORT", "Middle Support", "Middle support"),
            ("SIDE_SUPPORT", "Side Support", "Side support"),
            ("REAR_SUPPORT", "Rear Support", "Rear support"),
            ("FRONT_SUPPORT", "Front Support", "Front support"),
            ("CROSS_SUPPORT", "Cross Support", "Cross support"),
            ("TOP_RAIL", "Top Rail", "Top rail"),
            ("BOTTOM_RAIL", "Bottom Rail", "Bottom rail"),
            ("FRONT_RAIL", "Front Rail", "Front rail"),
            ("REAR_RAIL", "Rear Rail", "Rear rail"),
            ("LEFT_RAIL", "Left Rail", "Left rail"),
            ("RIGHT_RAIL", "Right Rail", "Right rail"),
            ("CROSS_RAIL", "Cross Rail", "Cross rail"),
            ("SUPPORT_RAIL", "Support Rail", "Support rail"),
            ("UPPER_FRAME", "Upper Frame", "Upper frame"),
            ("LOWER_FRAME", "Lower Frame", "Lower frame"),
            ("BASE_FRAME", "Base Frame", "Base frame"),
            ("SUB_FRAME", "Sub Frame", "Sub frame"),
            ("FACE_FRAME", "Face Frame", "Face frame"),
            ("FRAME", "Frame", "Frame"),
            ("SUPPORT_BAR", "Support Bar", "Support bar"),
            ("STRETCH_BAR", "Stretch Bar", "Stretch bar"),
            ("CROSS_MEMBER", "Cross Member", "Cross member"),
            ("SUPPORT_BEAM", "Support Beam", "Support beam"),
            ("MOUNTING_PLATE", "Mounting Plate", "Mounting plate"),
            ("PANEL_INSERT", "Panel Insert", "Panel insert"),
            ("CORNER_BLOCK", "Corner Block", "Corner block"),
            ("CORNER_POST", "Corner Post", "Corner post"),
            ("REINFORCEMENT_BAR", "Reinforcement Bar", "Reinforcement bar"),
            ("SIDE_BRACE", "Side Brace", "Side brace"),
            ("CROSS_BRACE", "Cross Brace", "Cross brace"),
            ("DIAGONAL_BRACE", "Diagonal Brace", "Diagonal brace"),
            ("BASE", "Plinth", "Base / Plinth"),
            ("TOE_KICK", "Toe Kick", "Toe kick"),
            ("LEG", "Leg", "Leg"),
            ("LEG_FRONT_LEFT", "Leg Front Left", "Front left leg"),
            ("LEG_FRONT_RIGHT", "Leg Front Right", "Front right leg"),
            ("LEG_REAR_LEFT", "Leg Rear Left", "Rear left leg"),
            ("LEG_REAR_RIGHT", "Leg Rear Right", "Rear right leg"),
            ("ROUND_LEG", "Round Leg", "Round leg"),
            ("SQUARE_LEG", "Square Leg", "Square leg"),
            ("METAL_LEG", "Metal Leg", "Metal leg"),
            ("WOOD_LEG", "Wood Leg", "Wood leg"),
            ("ADJUSTABLE_LEG", "Adjustable Leg", "Adjustable leg"),
            ("FOOT", "Foot", "Foot"),
            ("FOOT_PAD", "Foot Pad", "Foot pad"),
            ("RUBBER_FOOT", "Rubber Foot", "Rubber foot"),
            ("ADJUSTABLE_FOOT", "Adjustable Foot", "Adjustable foot"),
            ("CASTER_WHEEL", "Caster Wheel", "Caster wheel"),
            ("WHEEL_LOCK", "Wheel Lock", "Wheel lock"),
            # Door parts
            ("DOOR_PANEL", "Door Panel", "Door panel"),
            ("DOOR_LEAF", "Door Leaf", "Door leaf"),
            ("DOOR_FRAME", "Door Frame", "Door frame"),
            ("DOOR_STILE_LEFT", "Door Stile Left", "Door stile left"),
            ("DOOR_STILE_RIGHT", "Door Stile Right", "Door stile right"),
            ("DOOR_RAIL_TOP", "Door Rail Top", "Door rail top"),
            ("DOOR_RAIL_BOTTOM", "Door Rail Bottom", "Door rail bottom"),
            ("DOOR_RAIL_MIDDLE", "Door Rail Middle", "Door rail middle"),
            ("DOOR_EDGE_LEFT", "Door Edge Left", "Door edge left"),
            ("DOOR_EDGE_RIGHT", "Door Edge Right", "Door edge right"),
            ("DOOR_CAP_TOP", "Door Cap Top", "Door cap top"),
            ("DOOR_CAP_BOTTOM", "Door Cap Bottom", "Door cap bottom"),
            ("DOOR_HANDLE", "Door Handle", "Door handle"),
            ("DOOR_KNOB", "Door Knob", "Door knob"),
            ("DOOR_LOCK", "Door Lock", "Door lock"),
            ("DOOR_LATCH", "Door Latch", "Door latch"),
            ("DOOR_CATCH", "Door Catch", "Door catch"),
            ("DOOR_STOPPER", "Door Stopper", "Door stopper"),
            ("DOOR_CLOSER", "Door Closer", "Door closer"),
            ("DOOR_BUFFER", "Door Buffer", "Door buffer"),
            ("DOOR_MAGNET", "Door Magnet", "Door magnet"),
            ("DOOR_SEAL", "Door Seal", "Door seal"),
            ("DOOR_MIRROR", "Door Mirror", "Door mirror"),
            ("GLASS_PANEL", "Glass Panel", "Glass panel"),
            ("SLIDING_DOOR_LEFT", "Sliding Door Left", "Sliding door left"),
            ("SLIDING_DOOR_RIGHT", "Sliding Door Right", "Sliding door right"),
            ("TOP_TRACK", "Top Track", "Top track"),
            ("BOTTOM_TRACK", "Bottom Track", "Bottom track"),
            ("GUIDE_TRACK", "Guide Track", "Guide track"),
            ("GUIDE_RAIL", "Guide Rail", "Guide rail"),
            ("GUIDE_WHEEL", "Guide Wheel", "Guide wheel"),
            ("ROLLER", "Roller", "Roller"),
            ("ROLLER_WHEEL", "Roller Wheel", "Roller wheel"),
            ("SOFT_CLOSE_SYSTEM", "Soft Close System", "Soft close system"),
            ("STOPPER", "Stopper", "Stopper"),
            # Drawer parts
            ("DRAWER_BOX", "Drawer Box", "Drawer box"),
            ("DRAWER_FRONT", "Drawer Front", "Drawer front"),
            ("DRAWER_BACK", "Drawer Back", "Drawer back"),
            ("DRAWER_SIDE_LEFT", "Drawer Side Left", "Drawer side left"),
            ("DRAWER_SIDE_RIGHT", "Drawer Side Right", "Drawer side right"),
            ("DRAWER_BOTTOM", "Drawer Bottom", "Drawer bottom"),
            ("DRAWER_HANDLE", "Drawer Handle", "Drawer handle"),
            ("DRAWER_PULL", "Drawer Pull", "Drawer pull"),
            ("DRAWER_RUNNER_LEFT", "Drawer Runner Left", "Drawer runner left"),
            ("DRAWER_RUNNER_RIGHT", "Drawer Runner Right", "Drawer runner right"),
            ("DRAWER_SLIDE_LEFT", "Drawer Slide Left", "Drawer slide left"),
            ("DRAWER_SLIDE_RIGHT", "Drawer Slide Right", "Drawer slide right"),
            ("DRAWER_TRACK", "Drawer Track", "Drawer track"),
            ("DRAWER_GUIDE", "Drawer Guide", "Drawer guide"),
            ("DRAWER_STOP", "Drawer Stop", "Drawer stop"),
            ("DRAWER_SPACER", "Drawer Spacer", "Drawer spacer"),
            ("DRAWER_DIVIDER", "Drawer Divider", "Drawer divider"),
            ("DRAWER_INSERT", "Drawer Insert", "Drawer insert"),
            # Shelf parts
            ("SHELF", "Shelf", "Shelf"),
            ("SHELF_TOP", "Shelf Top", "Shelf top"),
            ("SHELF_BOTTOM", "Shelf Bottom", "Shelf bottom"),
            ("SHELF_DIVIDER", "Shelf Divider", "Shelf divider"),
            ("SHELF_SUPPORT", "Shelf Support", "Shelf support"),
            ("SHELF_PIN", "Shelf Pin", "Shelf pin"),
            ("SHELF_BRACKET", "Shelf Bracket", "Shelf bracket"),
            ("SHELF_CLIP", "Shelf Clip", "Shelf clip"),
            ("SHELF_HOLDER", "Shelf Holder", "Shelf holder"),
            ("SHELF_ROD", "Shelf Rod", "Shelf rod"),
            ("SHELF_INSERT", "Shelf Insert", "Shelf insert"),
            ("GLASS_SHELF", "Glass Shelf", "Glass shelf"),
            ("ADJUSTABLE_SHELF", "Adjustable Shelf", "Adjustable shelf"),
            ("FIXED_SHELF", "Fixed Shelf", "Fixed shelf"),
            # Wardrobe parts
            ("WARDROBE_TOP", "Wardrobe Top", "Wardrobe top"),
            ("WARDROBE_BOTTOM", "Wardrobe Bottom", "Wardrobe bottom"),
            ("WARDROBE_LEFT_SIDE", "Wardrobe Left Side", "Wardrobe left side"),
            ("WARDROBE_RIGHT_SIDE", "Wardrobe Right Side", "Wardrobe right side"),
            ("WARDROBE_BACK", "Wardrobe Back", "Wardrobe back"),
            ("WARDROBE_CENTER_DIVIDER", "Wardrobe Center Divider", "Wardrobe center divider"),
            ("WARDROBE_DOOR_LEFT", "Wardrobe Door Left", "Wardrobe door left"),
            ("WARDROBE_DOOR_RIGHT", "Wardrobe Door Right", "Wardrobe door right"),
            ("WARDROBE_HANDLE_LEFT", "Wardrobe Handle Left", "Wardrobe handle left"),
            ("WARDROBE_HANDLE_RIGHT", "Wardrobe Handle Right", "Wardrobe handle right"),
            ("WARDROBE_MIRROR_PANEL", "Wardrobe Mirror Panel", "Wardrobe mirror panel"),
            ("WARDROBE_HANGING_ROD", "Wardrobe Hanging Rod", "Wardrobe hanging rod"),
            ("WARDROBE_SHOE_RACK", "Wardrobe Shoe Rack", "Wardrobe shoe rack"),
            ("WARDROBE_DRAWER", "Wardrobe Drawer", "Wardrobe drawer"),
            ("WARDROBE_BASKET", "Wardrobe Basket", "Wardrobe basket"),
            ("WARDROBE_TIE_RACK", "Wardrobe Tie Rack", "Wardrobe tie rack"),
            # Accessories
            ("HANGING_ROD", "Hanging Rod", "Hanging rod"),
            ("ROD_BRACKET_LEFT", "Rod Bracket Left", "Rod bracket left"),
            ("ROD_BRACKET_RIGHT", "Rod Bracket Right", "Rod bracket right"),
            ("ROD_SUPPORT", "Rod Support", "Rod support"),
            ("TIE_RACK", "Tie Rack", "Tie rack"),
            ("BELT_RACK", "Belt Rack", "Belt rack"),
            ("PANT_RACK", "Pant Rack", "Pant rack"),
            ("SHOE_RACK", "Shoe Rack", "Shoe rack"),
            ("SHOE_TRAY", "Shoe Tray", "Shoe tray"),
            ("LAUNDRY_BASKET", "Laundry Basket", "Laundry basket"),
            ("STORAGE_BASKET", "Storage Basket", "Storage basket"),
            ("ACCESSORY_TRAY", "Accessory Tray", "Accessory tray"),
            ("JEWELRY_TRAY", "Jewelry Tray", "Jewelry tray"),
            ("DIVIDER_PANEL", "Divider Panel", "Divider panel"),
            ("MIRROR_FRAME", "Mirror Frame", "Mirror frame"),
            ("INTERNAL_LIGHT", "Internal Light", "Internal light"),
            ("LED_STRIP", "LED Strip", "LED strip"),
            ("MOTION_SENSOR", "Motion Sensor", "Motion sensor"),
            # Cabinet parts
            ("CABINET_TOP", "Cabinet Top", "Cabinet top"),
            ("CABINET_BOTTOM", "Cabinet Bottom", "Cabinet bottom"),
            ("CABINET_LEFT_SIDE", "Cabinet Left Side", "Cabinet left side"),
            ("CABINET_RIGHT_SIDE", "Cabinet Right Side", "Cabinet right side"),
            ("CABINET_BACK", "Cabinet Back", "Cabinet back"),
            ("CABINET_SHELF", "Cabinet Shelf", "Cabinet shelf"),
            ("CABINET_DOOR_LEFT", "Cabinet Door Left", "Cabinet door left"),
            ("CABINET_DOOR_RIGHT", "Cabinet Door Right", "Cabinet door right"),
            ("CABINET_HANDLE", "Cabinet Handle", "Cabinet handle"),
            ("CABINET_LOCK", "Cabinet Lock", "Cabinet lock"),
            ("CABINET_KEY", "Cabinet Key", "Cabinet key"),
            # Desk/Table parts
            ("DESK_TOP", "Desk Top", "Desk top"),
            ("TABLE_TOP", "Table Top", "Table top"),
            ("EXTENSION_TOP", "Extension Top", "Extension top"),
            ("DROP_LEAF", "Drop Leaf", "Drop leaf"),
            ("APRON_FRONT", "Apron Front", "Apron front"),
            ("APRON_REAR", "Apron Rear", "Apron rear"),
            ("APRON_LEFT", "Apron Left", "Apron left"),
            ("APRON_RIGHT", "Apron Right", "Apron right"),
            ("KEYBOARD_TRAY", "Keyboard Tray", "Keyboard tray"),
            ("MONITOR_STAND", "Monitor Stand", "Monitor stand"),
            ("CABLE_TRAY", "Cable Tray", "Cable tray"),
            ("CABLE_HOLE", "Cable Hole", "Cable hole"),
            ("CABLE_COVER", "Cable Cover", "Cable cover"),
            ("CPU_HOLDER", "CPU Holder", "CPU holder"),
            ("POWER_PANEL", "Power Panel", "Power panel"),
            ("WIRE_ORGANIZER", "Wire Organizer", "Wire organizer"),
            ("FOOT_REST", "Foot Rest", "Foot rest"),
            ("PRIVACY_PANEL", "Privacy Panel", "Privacy panel"),
            ("MODESTY_PANEL", "Modesty Panel", "Modesty panel"),
            # Chair parts
            ("CHAIR_SEAT", "Chair Seat", "Chair seat"),
            ("SEAT_FRAME", "Seat Frame", "Seat frame"),
            ("SEAT_BASE", "Seat Base", "Seat base"),
            ("SEAT_CUSHION", "Seat Cushion", "Seat cushion"),
            ("BACK_FRAME", "Back Frame", "Back frame"),
            ("BACKREST", "Backrest", "Backrest"),
            ("HEADREST", "Headrest", "Headrest"),
            ("LUMBAR_SUPPORT", "Lumbar Support", "Lumbar support"),
            ("ARMREST_LEFT", "Armrest Left", "Armrest left"),
            ("ARMREST_RIGHT", "Armrest Right", "Armrest right"),
            ("ARM_PAD_LEFT", "Arm Pad Left", "Arm pad left"),
            ("ARM_PAD_RIGHT", "Arm Pad Right", "Arm pad right"),
            ("CHAIR_BASE", "Chair Base", "Chair base"),
            ("GAS_CYLINDER", "Gas Cylinder", "Gas cylinder"),
            ("TILT_MECHANISM", "Tilt Mechanism", "Tilt mechanism"),
            ("SWIVEL_PLATE", "Swivel Plate", "Swivel plate"),
            ("WHEEL_CASTER_01", "Wheel Caster 01", "Wheel caster 01"),
            ("WHEEL_CASTER_02", "Wheel Caster 02", "Wheel caster 02"),
            ("WHEEL_CASTER_03", "Wheel Caster 03", "Wheel caster 03"),
            ("WHEEL_CASTER_04", "Wheel Caster 04", "Wheel caster 04"),
            ("WHEEL_CASTER_05", "Wheel Caster 05", "Wheel caster 05"),
            # Bed parts
            ("HEADBOARD", "Headboard", "Headboard"),
            ("FOOTBOARD", "Footboard", "Footboard"),
            ("SIDE_RAIL_LEFT", "Side Rail Left", "Side rail left"),
            ("SIDE_RAIL_RIGHT", "Side Rail Right", "Side rail right"),
            ("CENTER_RAIL", "Center Rail", "Center rail"),
            ("CENTER_LEG", "Center Leg", "Center leg"),
            ("MATTRESS_SUPPORT", "Mattress Support", "Mattress support"),
            ("BED_SLAT", "Bed Slat", "Bed slat"),
            ("BED_SUPPORT_BAR", "Bed Support Bar", "Bed support bar"),
            ("STORAGE_DRAWER", "Storage Drawer", "Storage drawer"),
            ("BED_BOX", "Bed Box", "Bed box"),
            ("HYDRAULIC_LIFT", "Hydraulic Lift", "Hydraulic lift"),
            # Hardware - Fasteners
            ("WOOD_SCREW", "Wood Screw", "Wood screw"),
            ("MACHINE_SCREW", "Machine Screw", "Machine screw"),
            ("SELF_TAPPING_SCREW", "Self-tapping Screw", "Self-tapping screw"),
            ("CONFIRMAT_SCREW", "Confirmat Screw", "Confirmat screw"),
            ("DRYWALL_SCREW", "Drywall Screw", "Drywall screw"),
            ("HEX_BOLT", "Hex Bolt", "Hex bolt"),
            ("CARRIAGE_BOLT", "Carriage Bolt", "Carriage bolt"),
            ("SOCKET_BOLT", "Socket Bolt", "Socket bolt"),
            ("ANCHOR_BOLT", "Anchor Bolt", "Anchor bolt"),
            ("THREADED_ROD", "Threaded Rod", "Threaded rod"),
            ("BOLT", "Bolt", "Bolt"),
            ("NUT", "Nut", "Nut"),
            ("LOCK_NUT", "Lock Nut", "Lock nut"),
            ("WING_NUT", "Wing Nut", "Wing nut"),
            ("WASHER", "Washer", "Washer"),
            ("SPRING_WASHER", "Spring Washer", "Spring washer"),
            ("NAIL", "Nail", "Nail"),
            ("STAPLE", "Staple", "Staple"),
            # Hardware - Joining
            ("CAM_LOCK", "Cam Lock", "Cam lock"),
            ("CAM_BOLT", "Cam Bolt", "Cam bolt"),
            ("CROSS_DOWEL", "Cross Dowel", "Cross dowel"),
            ("BARREL_NUT", "Barrel Nut", "Barrel nut"),
            ("DOWEL", "Dowel", "Dowel"),
            ("WOOD_DOWEL", "Wood Dowel", "Wood dowel"),
            ("METAL_DOWEL", "Metal Dowel", "Metal dowel"),
            ("CONNECTOR_PIN", "Connector Pin", "Connector pin"),
            ("JOINING_PLATE", "Joining Plate", "Joining plate"),
            ("CONNECTING_BOLT", "Connecting Bolt", "Connecting bolt"),
            ("JOINT_CONNECTOR", "Joint Connector", "Joint connector"),
            ("CORNER_CONNECTOR", "Corner Connector", "Corner connector"),
            # Hardware - Hinges
            ("CONCEALED_HINGE", "Concealed Hinge", "Concealed hinge"),
            ("SOFT_CLOSE_HINGE", "Soft-close Hinge", "Soft-close hinge"),
            ("PIVOT_HINGE", "Pivot Hinge", "Pivot hinge"),
            ("PIANO_HINGE", "Piano Hinge", "Piano hinge"),
            ("BUTT_HINGE", "Butt Hinge", "Butt hinge"),
            ("CORNER_HINGE", "Corner Hinge", "Corner hinge"),
            ("GLASS_DOOR_HINGE", "Glass Door Hinge", "Glass door hinge"),
            ("LIFT_UP_HINGE", "Lift Up Hinge", "Lift up hinge"),
            # Hardware - Brackets
            ("L_BRACKET", "L Bracket", "L bracket"),
            ("CORNER_BRACKET", "Corner Bracket", "Corner bracket"),
            ("ANGLE_BRACKET", "Angle Bracket", "Angle bracket"),
            ("FLAT_BRACKET", "Flat Bracket", "Flat bracket"),
            # Hardware - Handles
            ("HANDLE", "Handle", "Handle"),
            ("PULL_HANDLE", "Pull Handle", "Pull handle"),
            ("KNOB", "Knob", "Knob"),
            ("FINGER_PULL", "Finger Pull", "Finger pull"),
            # Materials - Trim
            ("TRIM", "Trim", "Trim"),
            ("TOP_TRIM", "Top Trim", "Top trim"),
            ("BOTTOM_TRIM", "Bottom Trim", "Bottom trim"),
            ("SIDE_TRIM", "Side Trim", "Side trim"),
            ("DECORATIVE_STRIP", "Decorative Strip", "Decorative strip"),
            ("MOLDING", "Molding", "Molding"),
            ("SKIRTING", "Skirting", "Skirting"),
            ("CROWN_MOLDING", "Crown Molding", "Crown molding"),
            ("EDGE_BAND", "Edge Band", "Edge band"),
            ("VENEER", "Veneer", "Veneer"),
            ("LAMINATE", "Laminate", "Laminate"),
            # Materials - Adhesives
            ("WOOD_GLUE", "Wood Glue", "Wood glue"),
            ("ADHESIVE", "Adhesive", "Adhesive"),
            ("SILICONE", "Silicone", "Silicone"),
            ("SEALANT", "Sealant", "Sealant"),
            # Reference parts
            ("PIVOT_EMPTY", "Pivot Empty", "Pivot empty"),
            ("DOOR_PIVOT", "Door Pivot", "Door pivot"),
            ("DRAWER_PIVOT", "Drawer Pivot", "Drawer pivot"),
            ("ASSEMBLY_POINT", "Assembly Point", "Assembly point"),
            ("SNAP_POINT", "Snap Point", "Snap point"),
            ("REFERENCE_PLANE", "Reference Plane", "Reference plane"),
            ("REFERENCE_IMAGE", "Reference Image", "Reference image"),
            ("COLLISION_MESH", "Collision Mesh", "Collision mesh"),
            ("LOW_POLY", "Low Poly", "Low poly"),
            ("HIGH_POLY", "High Poly", "High poly"),
            ("UV_HELPER", "UV Helper", "UV helper"),
            ("MATERIAL_HOLDER", "Material Holder", "Material holder"),
            # Custom
            ("CUSTOM", "Custom", "Custom part name"),
        ),
        default="TOP_PANEL",
    )
    custom_part_name: StringProperty(name="Custom Name", default="")
    
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
