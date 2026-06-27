import bpy
from bpy.types import Panel, UIList


class BCL_UL_cut_list(UIList):
    def draw_item(self, context, layout, data, item, icon, active_data, active_propname, index):
        row = layout.row(align=True)
        row.label(text=item.part_name)
        row.label(text=str(item.qty))
        row.label(text=str(item.length))
        row.label(text=str(item.width))
        row.label(text=str(item.thickness))
        row.label(text=item.material)


class BCL_PT_cut_list(Panel):
    bl_label = "Cut List"
    bl_idname = "BCL_PT_cut_list"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Furniture"

    def draw(self, context):
        layout = self.layout
        st = context.scene.bcl_settings

        box = layout.box()
        box.prop(st, "source_collection")
        row = box.row(align=True)
        row.prop(st, "unit_system", expand=True)
        row = box.row(align=True)
        row.prop(st, "rounding")
        row.prop(st, "kerf")
        box.prop(st, "include_children")
        box.prop(st, "group_identical")

        row = layout.row(align=True)
        row.operator("bcl.generate_cut_list", icon="FILE_REFRESH")
        row.operator("bcl.clear_cut_list", icon="TRASH")

        layout.separator()

        header = layout.row(align=True)
        header.label(text="Part")
        header.label(text="Qty")
        header.label(text="L")
        header.label(text="W")
        header.label(text="T")
        header.label(text="Material")

        layout.template_list("BCL_UL_cut_list", "", st, "items", st, "active_index", rows=8)

        row = layout.row(align=True)
        op = row.operator("bcl.export_cut_list", text="Export CSV", icon="EXPORT")
        op.format = "CSV"
        op = row.operator("bcl.export_cut_list", text="Export Word (TSV)", icon="EXPORT")
        op.format = "TSV"

        layout.separator()

        # Firebase Sync Section
        box = layout.box()
        box.label(text="Real-time Sync to Maa Wadi")
        
        row = box.row(align=True)
        if st.enable_sync:
            row.operator("bcl.disable_sync")
        else:
            row.operator("bcl.enable_sync")
        row.operator("bcl.sync_now")
        row.operator("bcl.export_3d_model")
        
        box.label(text=f"Status: {st.sync_status}")

        layout.separator()

        box = layout.box()
        box.label(text="Assembly Manual")
        obj = context.object
        if obj is None:
            box.label(text="Select an object to set Step/Note")
        else:
            box.prop(obj, "bcl_manual_step")
            box.prop(obj, "bcl_manual_note")
            box.prop(obj, "bcl_explode_dir")
            box.prop(obj, "bcl_explode_dist")

        row = box.row(align=True)
        row.prop(st, "bulk_step")
        row.operator("bcl.set_step_selected", text="Set For Selected")

        row = box.row(align=True)
        row.prop(st, "auto_step_start")
        row.operator("bcl.auto_steps", text="Auto Steps")

        row = box.row(align=True)
        row.operator("bcl.clear_steps", text="Clear Steps")
        row.operator("bcl.normalize_steps", text="Normalize")

        row = box.row(align=True)
        row.prop(st, "layout_columns")
        row.prop(st, "layout_tile_px")

        row = box.row(align=True)
        row.prop(st, "render_callouts")
        row.prop(st, "callout_font_size")

        row = box.row(align=True)
        row.prop(st, "outline_only")
        row.prop(st, "render_arrows")
        if st.render_arrows:
            box.prop(st, "arrow_thickness")

        box.operator("bcl.export_manual", text="Export Manual (TSV)", icon="EXPORT")
        box.operator("bcl.export_step_renders", text="Export Step Renders (PNG)", icon="RENDER_STILL")
        box.operator("bcl.export_manual_layout_html", text="Export Manual Layout (HTML)", icon="URL")


classes = (BCL_UL_cut_list, BCL_PT_cut_list)


def register():
    for cls in classes:
        bpy.utils.register_class(cls)


def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
