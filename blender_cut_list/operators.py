import bpy
from mathutils import Vector
from bpy.types import Operator
from bpy.props import StringProperty, BoolProperty
import os
import re
import json
import threading
import urllib.request
import time
from bpy_extras.object_utils import world_to_camera_view


def _iter_collection_objects(col, include_children=True):
    if col is None:
        return
    for obj in col.objects:
        yield obj
    if include_children:
        for child in col.children:
            yield from _iter_collection_objects(child, include_children=True)


def _get_material_name(obj):
    try:
        if obj.active_material is not None:
            return obj.active_material.name
    except Exception:
        pass

    try:
        if obj.material_slots and obj.material_slots[0].material is not None:
            return obj.material_slots[0].material.name
    except Exception:
        pass

    return ""


def _eval_world_bbox_dimensions(obj, depsgraph):
    eval_obj = obj.evaluated_get(depsgraph)
    if eval_obj.type != "MESH":
        return None

    mesh = None
    try:
        mesh = eval_obj.to_mesh()
        if mesh is None or len(mesh.vertices) == 0:
            return None

        mw = eval_obj.matrix_world
        min_v = Vector((1e30, 1e30, 1e30))
        max_v = Vector((-1e30, -1e30, -1e30))

        for v in mesh.vertices:
            wv = mw @ v.co
            min_v.x = min(min_v.x, wv.x)
            min_v.y = min(min_v.y, wv.y)
            min_v.z = min(min_v.z, wv.z)
            max_v.x = max(max_v.x, wv.x)
            max_v.y = max(max_v.y, wv.y)
            max_v.z = max(max_v.z, wv.z)

        dims = max_v - min_v
        dims_abs = Vector((abs(dims.x), abs(dims.y), abs(dims.z)))
        sorted_dims = sorted([dims_abs.x, dims_abs.y, dims_abs.z], reverse=True)
        length = sorted_dims[0]
        width = sorted_dims[1]
        thickness = sorted_dims[2]
        return length, width, thickness
    finally:
        try:
            if mesh is not None:
                eval_obj.to_mesh_clear()
        except Exception:
            pass


def _to_unit(value_m, unit_system):
    if unit_system == "IN":
        return value_m / 0.0254
    return value_m * 1000.0


def _round_value(v, digits):
    try:
        return round(float(v), int(digits))
    except Exception:
        return v


class BCL_OT_generate_cut_list(Operator):
    bl_idname = "bcl.generate_cut_list"
    bl_label = "Generate Cut List"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        st = context.scene.bcl_settings
        st.items.clear()

        col = st.source_collection
        if col is None:
            self.report({"WARNING"}, "Choose a collection")
            return {"CANCELLED"}

        depsgraph = context.evaluated_depsgraph_get()

        parts = {}
        for obj in _iter_collection_objects(col, include_children=st.include_children):
            if obj is None or obj.type != "MESH":
                continue
            if obj.hide_get() or obj.hide_viewport:
                continue

            dims = _eval_world_bbox_dimensions(obj, depsgraph)
            if dims is None:
                continue

            mat = _get_material_name(obj)
            length_m, width_m, thickness_m = dims

            kerf_m = st.kerf / 1000.0 if st.unit_system == "MM" else st.kerf * 0.0254
            length_m += kerf_m
            width_m += kerf_m

            length = _round_value(_to_unit(length_m, st.unit_system), st.rounding)
            width = _round_value(_to_unit(width_m, st.unit_system), st.rounding)
            thickness = _round_value(_to_unit(thickness_m, st.unit_system), st.rounding)

            if st.group_identical:
                key = (mat, length, width, thickness)
                if key not in parts:
                    parts[key] = {
                        "name": obj.name,
                        "qty": 0,
                        "length": length,
                        "width": width,
                        "thickness": thickness,
                        "material": mat,
                    }
                parts[key]["qty"] += 1
            else:
                key = (len(parts),)
                parts[key] = {
                    "name": obj.name,
                    "qty": 1,
                    "length": length,
                    "width": width,
                    "thickness": thickness,
                    "material": mat,
                }

        if st.group_identical:
            out_recs = [rec for _, rec in sorted(parts.items(), key=lambda kv: (kv[0][0], kv[0][3], kv[0][1], kv[0][2]))]
        else:
            out_recs = [rec for _, rec in sorted(parts.items(), key=lambda kv: (kv[1]["material"], kv[1]["thickness"], kv[1]["length"], kv[1]["width"], kv[1]["name"]))]

        for rec in out_recs:
            it = st.items.add()
            it.part_name = rec["name"]
            it.qty = rec["qty"]
            it.length = rec["length"]
            it.width = rec["width"]
            it.thickness = rec["thickness"]
            it.material = rec["material"]

        st.active_index = 0
        return {"FINISHED"}


class BCL_OT_clear_cut_list(Operator):
    bl_idname = "bcl.clear_cut_list"
    bl_label = "Clear"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        st = context.scene.bcl_settings
        st.items.clear()
        st.active_index = 0
        return {"FINISHED"}


class BCL_OT_export_cut_list(Operator):
    bl_idname = "bcl.export_cut_list"
    bl_label = "Export Cut List"

    filepath: StringProperty(subtype="FILE_PATH")
    format: StringProperty(default="CSV")

    def invoke(self, context, event):
        st = context.scene.bcl_settings
        ext = ".csv" if self.format == "CSV" else ".tsv"
        if not self.filepath:
            self.filepath = bpy.path.abspath("//cut_list" + ext)
        context.window_manager.fileselect_add(self)
        return {"RUNNING_MODAL"}

    def execute(self, context):
        st = context.scene.bcl_settings
        if not st.items:
            self.report({"WARNING"}, "Nothing to export")
            return {"CANCELLED"}

        delim = "," if self.format == "CSV" else "\t"
        unit_label = "mm" if st.unit_system == "MM" else "in"

        try:
            with open(self.filepath, "w", encoding="utf-8", newline="") as f:
                f.write(delim.join(["Part", "Qty", f"Length ({unit_label})", f"Width ({unit_label})", f"Thickness ({unit_label})", "Material"]) + "\n")
                for it in st.items:
                    row = [
                        it.part_name,
                        str(it.qty),
                        str(it.length),
                        str(it.width),
                        str(it.thickness),
                        it.material,
                    ]
                    f.write(delim.join(row) + "\n")
        except Exception as e:
            self.report({"ERROR"}, f"Export failed: {e}")
            return {"CANCELLED"}

        self.report({"INFO"}, f"Exported: {self.filepath}")
        return {"FINISHED"}


class BCL_OT_set_step_selected(Operator):
    bl_idname = "bcl.set_step_selected"
    bl_label = "Set Step For Selected"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        st = context.scene.bcl_settings
        sel = list(context.selected_objects or [])
        if not sel:
            self.report({"WARNING"}, "Select one or more objects")
            return {"CANCELLED"}

        step = int(st.bulk_step)
        changed = 0
        for o in sel:
            if o is None or o.type != "MESH":
                continue
            try:
                o.bcl_manual_step = step
                changed += 1
            except Exception:
                pass

        self.report({"INFO"}, f"Set Step={step} on {changed} objects")
        return {"FINISHED"}


class BCL_OT_auto_steps(Operator):
    bl_idname = "bcl.auto_steps"
    bl_label = "Auto Steps"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        st = context.scene.bcl_settings
        col = st.source_collection
        if col is None:
            self.report({"WARNING"}, "Choose a collection")
            return {"CANCELLED"}

        objs = [o for o in _iter_collection_objects(col, include_children=st.include_children) if o is not None and o.type == "MESH"]
        if not objs:
            self.report({"WARNING"}, "No mesh objects found")
            return {"CANCELLED"}

        objs.sort(key=lambda o: o.name)
        step = int(st.auto_step_start)
        for o in objs:
            try:
                o.bcl_manual_step = step
            except Exception:
                continue
            step += 1

        self.report({"INFO"}, f"Assigned Steps {st.auto_step_start}..{step - 1} to {len(objs)} objects")
        return {"FINISHED"}


class BCL_OT_clear_steps(Operator):
    bl_idname = "bcl.clear_steps"
    bl_label = "Clear Steps"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        st = context.scene.bcl_settings
        col = st.source_collection
        if col is None:
            self.report({"WARNING"}, "Choose a collection")
            return {"CANCELLED"}

        objs = [o for o in _iter_collection_objects(col, include_children=st.include_children) if o is not None and o.type == "MESH"]
        if not objs:
            self.report({"WARNING"}, "No mesh objects found")
            return {"CANCELLED"}

        changed = 0
        for o in objs:
            try:
                if int(getattr(o, "bcl_manual_step", 0)) != 0:
                    o.bcl_manual_step = 0
                    changed += 1
            except Exception:
                pass

        self.report({"INFO"}, f"Cleared steps on {changed} objects")
        return {"FINISHED"}


class BCL_OT_normalize_steps(Operator):
    bl_idname = "bcl.normalize_steps"
    bl_label = "Normalize Steps (1..N)"
    bl_options = {"REGISTER", "UNDO"}

    def execute(self, context):
        st = context.scene.bcl_settings
        col = st.source_collection
        if col is None:
            self.report({"WARNING"}, "Choose a collection")
            return {"CANCELLED"}

        objs = [o for o in _iter_collection_objects(col, include_children=st.include_children) if o is not None and o.type == "MESH"]
        if not objs:
            self.report({"WARNING"}, "No mesh objects found")
            return {"CANCELLED"}

        steps = []
        for o in objs:
            try:
                s = int(getattr(o, "bcl_manual_step", 0))
            except Exception:
                s = 0
            if s > 0:
                steps.append(s)

        unique = sorted(set(steps))
        if not unique:
            self.report({"WARNING"}, "No objects have Step > 0")
            return {"CANCELLED"}

        remap = {old: i + 1 for i, old in enumerate(unique)}
        changed = 0
        for o in objs:
            try:
                s = int(getattr(o, "bcl_manual_step", 0))
            except Exception:
                s = 0
            if s > 0 and s in remap and s != remap[s]:
                try:
                    o.bcl_manual_step = remap[s]
                    changed += 1
                except Exception:
                    pass

        self.report({"INFO"}, f"Normalized {len(unique)} step values to 1..{len(unique)} (changed {changed} objects)")
        return {"FINISHED"}


class BCL_OT_export_manual_layout_html(Operator):
    bl_idname = "bcl.export_manual_layout_html"
    bl_label = "Export Manual Layout (HTML)"

    directory: StringProperty(subtype="DIR_PATH")

    def invoke(self, context, event):
        if not self.directory:
            self.directory = bpy.path.abspath("//assembly_steps/")
        context.window_manager.fileselect_add(self)
        return {"RUNNING_MODAL"}

    def execute(self, context):
        st = context.scene.bcl_settings
        out_dir = bpy.path.abspath(self.directory)
        if not os.path.isdir(out_dir):
            self.report({"ERROR"}, "Folder does not exist")
            return {"CANCELLED"}

        files = []
        try:
            for fn in os.listdir(out_dir):
                if fn.lower().endswith(".png") and fn.lower().startswith("step_"):
                    files.append(fn)
        except Exception as e:
            self.report({"ERROR"}, f"Cannot read folder: {e}")
            return {"CANCELLED"}

        if not files:
            self.report({"WARNING"}, "No Step_###.png images found in the folder")
            return {"CANCELLED"}

        def _step_num(name: str) -> int:
            m = re.search(r"step_(\d+)", name.lower())
            return int(m.group(1)) if m else 10**9

        files.sort(key=_step_num)

        cols = int(getattr(st, "layout_columns", 3))
        tile = int(getattr(st, "layout_tile_px", 380))

        html_path = os.path.join(out_dir, "index.html")
        try:
            with open(html_path, "w", encoding="utf-8") as f:
                f.write("<!doctype html>\n")
                f.write("<html><head><meta charset='utf-8'>\n")
                f.write("<meta name='viewport' content='width=device-width, initial-scale=1'>\n")
                f.write("<title>Assembly Manual</title>\n")
                f.write("<style>\n")
                f.write("body{font-family:Arial,Helvetica,sans-serif;margin:20px;background:#fff;color:#000;}\n")
                f.write(".grid{display:grid;grid-template-columns:repeat(%d, %dpx);gap:18px;align-items:start;}\n" % (cols, tile))
                f.write(".tile{border:2px solid #000;padding:10px;position:relative;background:#fff;}\n")
                f.write(".step{position:absolute;top:8px;left:8px;font-weight:700;border:2px solid #000;padding:2px 8px;background:#fff;}\n")
                f.write("img{width:100%;height:auto;display:block;}\n")
                f.write("@media print{body{margin:0;} .tile{break-inside:avoid;} }\n")
                f.write("</style></head><body>\n")
                f.write("<h1 style='margin:0 0 16px 0;'>Assembly Manual</h1>\n")
                f.write("<div class='grid'>\n")
                for i, fn in enumerate(files, start=1):
                    step = i
                    f.write("<div class='tile'>")
                    f.write("<div class='step'>%d</div>" % step)
                    f.write("<img src='%s' alt='Step %d'>" % (fn.replace("'", ""), step))
                    f.write("</div>\n")
                f.write("</div>\n")
                f.write("<p style='margin-top:16px;font-size:12px;'>Tip: Use your browser Print -> Save as PDF.</p>\n")
                f.write("</body></html>\n")
        except Exception as e:
            self.report({"ERROR"}, f"Export failed: {e}")
            return {"CANCELLED"}

        self.report({"INFO"}, f"Wrote: {html_path}")
        return {"FINISHED"}


class BCL_OT_export_step_renders(Operator):
    bl_idname = "bcl.export_step_renders"
    bl_label = "Export Step Renders (PNG)"

    directory: StringProperty(subtype="DIR_PATH")

    def invoke(self, context, event):
        if not self.directory:
            self.directory = bpy.path.abspath("//assembly_steps/")
        context.window_manager.fileselect_add(self)
        return {"RUNNING_MODAL"}

    def execute(self, context):
        st = context.scene.bcl_settings
        col = st.source_collection
        if col is None:
            self.report({"WARNING"}, "Choose a collection")
            return {"CANCELLED"}

        out_dir = bpy.path.abspath(self.directory)
        try:
            os.makedirs(out_dir, exist_ok=True)
        except Exception as e:
            self.report({"ERROR"}, f"Cannot create folder: {e}")
            return {"CANCELLED"}

        objs = [o for o in _iter_collection_objects(col, include_children=st.include_children) if o is not None and o.type == "MESH"]
        if not objs:
            self.report({"WARNING"}, "No mesh objects found")
            return {"CANCELLED"}

        steps = sorted({int(getattr(o, "bcl_manual_step", 0)) for o in objs if int(getattr(o, "bcl_manual_step", 0)) > 0})
        if not steps:
            self.report({"WARNING"}, "No objects have Step > 0")
            return {"CANCELLED"}

        scene = context.scene
        view_layer = context.view_layer

        prev_scene_camera = scene.camera
        temp_cam_obj = None

        overlay_collection = None
        overlay_objects = []

        prev_world = scene.world
        temp_world = None

        prev_render_filepath = scene.render.filepath
        prev_image_settings = {
            "file_format": scene.render.image_settings.file_format,
            "color_mode": scene.render.image_settings.color_mode,
            "color_depth": scene.render.image_settings.color_depth,
        }
        prev_engine = scene.render.engine
        prev_film_transparent = getattr(scene.render, "film_transparent", False)

        prev_wb_settings = {
            "light": None,
            "color_type": None,
            "single_color": None,
            "show_xray": None,
        }

        prev_use_freestyle = getattr(view_layer, "use_freestyle", False)
        prev_line_sets_count = None
        created_line_set = None
        created_line_style = None
        prev_hide = {}
        prev_loc = {}

        try:
            if scene.camera is None:
                cam_data = bpy.data.cameras.new(name="BCL_TempCamera")
                cam_obj = bpy.data.objects.new(name="BCL_TempCamera", object_data=cam_data)
                scene.collection.objects.link(cam_obj)
                temp_cam_obj = cam_obj

                try:
                    cam_data.type = "ORTHO"
                except Exception:
                    pass

                min_v = Vector((1e30, 1e30, 1e30))
                max_v = Vector((-1e30, -1e30, -1e30))
                for o in objs:
                    try:
                        for c in o.bound_box:
                            w = o.matrix_world @ Vector(c)
                            min_v.x = min(min_v.x, w.x)
                            min_v.y = min(min_v.y, w.y)
                            min_v.z = min(min_v.z, w.z)
                            max_v.x = max(max_v.x, w.x)
                            max_v.y = max(max_v.y, w.y)
                            max_v.z = max(max_v.z, w.z)
                    except Exception:
                        pass

                center = (min_v + max_v) * 0.5
                size = max_v - min_v
                radius = max(size.x, size.y, size.z) * 0.5
                if radius <= 1e-6:
                    radius = 1.0

                cam_obj.location = center + Vector((radius * 1.6, -radius * 1.6, radius * 1.2))
                cam_obj.rotation_euler = (1.1, 0.0, 0.8)

                try:
                    cam_data.ortho_scale = radius * 2.6
                except Exception:
                    pass

                scene.camera = cam_obj

            engines = set()
            try:
                engines = {e.identifier for e in scene.render.bl_rna.properties["engine"].enum_items}
            except Exception:
                engines = set()

            if "BLENDER_WORKBENCH" in engines:
                scene.render.engine = "BLENDER_WORKBENCH"
            elif "BLENDER_EEVEE_NEXT" in engines:
                scene.render.engine = "BLENDER_EEVEE_NEXT"
            elif "BLENDER_EEVEE" in engines:
                scene.render.engine = "BLENDER_EEVEE"
            elif "CYCLES" in engines:
                scene.render.engine = "CYCLES"

            if hasattr(scene.render, "film_transparent"):
                scene.render.film_transparent = False

            if scene.world is None:
                temp_world = bpy.data.worlds.new(name="BCL_TempWorld")
                scene.world = temp_world

            try:
                scene.world.color = (1.0, 1.0, 1.0)
            except Exception:
                pass

            view_layer.use_freestyle = True

            if scene.render.engine == "BLENDER_WORKBENCH":
                try:
                    sh = scene.display.shading
                    prev_wb_settings["light"] = getattr(sh, "light", None)
                    prev_wb_settings["color_type"] = getattr(sh, "color_type", None)
                    prev_wb_settings["single_color"] = tuple(getattr(sh, "single_color", (0.8, 0.8, 0.8)))
                    prev_wb_settings["show_xray"] = getattr(sh, "show_xray", None)

                    sh.light = "FLAT"
                    sh.color_type = "SINGLE"
                    if getattr(st, "outline_only", True):
                        sh.single_color = (1.0, 1.0, 1.0)
                    else:
                        sh.single_color = (0.85, 0.85, 0.85)
                    sh.show_xray = False
                except Exception:
                    pass

            try:
                fs = view_layer.freestyle_settings
                prev_line_sets_count = len(fs.linesets)
                if len(fs.linesets) == 0:
                    created_line_set = fs.linesets.new(name="BCL_LineSet")
                    created_line_set.select_silhouette = True
                    created_line_style = bpy.data.linestyles.new(name="BCL_LineStyle")
                    created_line_style.color = (0.0, 0.0, 0.0)
                    created_line_style.thickness = 2.0
                    created_line_set.linestyle = created_line_style
            except Exception:
                prev_line_sets_count = None

            scene.render.image_settings.file_format = "PNG"
            scene.render.image_settings.color_mode = "RGBA"
            scene.render.image_settings.color_depth = "8"

            for o in objs:
                prev_hide[o.name] = (o.hide_render, o.hide_viewport)
                prev_loc[o.name] = o.location.copy()

            for step in steps:
                for o in overlay_objects:
                    try:
                        bpy.data.objects.remove(o, do_unlink=True)
                    except Exception:
                        pass
                overlay_objects.clear()

                for o in objs:
                    o.hide_render = True
                    o.hide_viewport = True
                    o.location = prev_loc[o.name].copy()

                exploded_parts = []

                for o in objs:
                    s = 0
                    try:
                        s = int(getattr(o, "bcl_manual_step", 0))
                    except Exception:
                        s = 0

                    if s <= 0 or s > step:
                        continue

                    o.hide_render = False
                    o.hide_viewport = False

                    if s == step:
                        try:
                            d = Vector(getattr(o, "bcl_explode_dir", (0.0, 0.0, 1.0)))
                            dist = float(getattr(o, "bcl_explode_dist", 0.0))
                            if d.length > 1e-8 and dist > 0.0:
                                exploded_parts.append((o, prev_loc[o.name].copy(), prev_loc[o.name] + d.normalized() * dist))
                                o.location = prev_loc[o.name] + d.normalized() * dist
                        except Exception:
                            pass

                if getattr(st, "render_arrows", True) and exploded_parts:
                    cam = scene.camera
                    if cam is not None:
                        if overlay_collection is None:
                            overlay_collection = bpy.data.collections.new("BCL_Overlay")
                            scene.collection.children.link(overlay_collection)

                        frame = None
                        try:
                            frame = cam.data.view_frame(scene=scene)
                        except Exception:
                            frame = None

                        depth = -max(float(getattr(cam.data, "clip_start", 0.1)) * 6.0, 0.6)
                        if frame is not None and len(frame) >= 4:
                            f0 = Vector((frame[0].x, frame[0].y, depth))
                            f1 = Vector((frame[1].x, frame[1].y, depth))
                            f2 = Vector((frame[2].x, frame[2].y, depth))
                            f3 = Vector((frame[3].x, frame[3].y, depth))
                        else:
                            f0 = Vector((-1.0, -1.0, depth))
                            f1 = Vector((1.0, -1.0, depth))
                            f2 = Vector((1.0, 1.0, depth))
                            f3 = Vector((-1.0, 1.0, depth))

                        def _to_cam_local(world_pt: Vector) -> Vector:
                            try:
                                co = world_to_camera_view(scene, cam, world_pt)
                                u = max(0.02, min(0.98, float(co.x)))
                                v = max(0.02, min(0.98, float(co.y)))
                            except Exception:
                                u, v = 0.5, 0.5
                            return (f0 * (1.0 - u) * (1.0 - v)) + (f1 * u * (1.0 - v)) + (f2 * u * v) + (f3 * (1.0 - u) * v)

                        thickness = float(getattr(st, "arrow_thickness", 0.01))
                        for i, (part, start_w, end_w) in enumerate(exploded_parts, start=1):
                            try:
                                start = _to_cam_local(start_w)
                                end = _to_cam_local(end_w)

                                crv = bpy.data.curves.new(name=f"BCL_ArrowCurve_{step}_{i}", type="CURVE")
                                crv.dimensions = "3D"
                                crv.bevel_depth = thickness
                                crv.bevel_resolution = 0
                                spl = crv.splines.new("POLY")
                                spl.points.add(1)
                                spl.points[0].co = (start.x, start.y, start.z, 1.0)
                                spl.points[1].co = (end.x, end.y, end.z, 1.0)

                                crv_obj = bpy.data.objects.new(name=f"BCL_Arrow_{step}_{i}", object_data=crv)
                                overlay_collection.objects.link(crv_obj)
                                crv_obj.parent = cam
                                crv_obj.matrix_parent_inverse = cam.matrix_world.inverted()
                                crv_obj.show_in_front = True

                                dir2 = Vector((end.x - start.x, end.y - start.y, 0.0))
                                if dir2.length > 1e-8:
                                    dir2.normalize()
                                perp = Vector((-dir2.y, dir2.x, 0.0))
                                head_len = thickness * 8.0
                                head_w = thickness * 6.0
                                tip = end
                                base = end - dir2 * head_len
                                v1 = base + perp * (head_w * 0.5)
                                v2 = base - perp * (head_w * 0.5)

                                me = bpy.data.meshes.new(name=f"BCL_ArrowHeadMesh_{step}_{i}")
                                me.from_pydata([tip, v1, v2], [], [(0, 1, 2)])
                                me.update()

                                head_obj = bpy.data.objects.new(name=f"BCL_ArrowHead_{step}_{i}", object_data=me)
                                overlay_collection.objects.link(head_obj)
                                head_obj.parent = cam
                                head_obj.matrix_parent_inverse = cam.matrix_world.inverted()
                                head_obj.show_in_front = True

                                overlay_objects.extend([crv_obj, head_obj])
                            except Exception:
                                pass

                if getattr(st, "render_callouts", True):
                    cam = scene.camera
                    if cam is not None:
                        if overlay_collection is None:
                            overlay_collection = bpy.data.collections.new("BCL_Overlay")
                            scene.collection.children.link(overlay_collection)

                        frame = None
                        try:
                            frame = cam.data.view_frame(scene=scene)
                        except Exception:
                            frame = None

                        depth = -max(float(getattr(cam.data, "clip_start", 0.1)) * 5.0, 0.5)
                        if frame is not None and len(frame) >= 4:
                            f0 = Vector((frame[0].x, frame[0].y, depth))
                            f1 = Vector((frame[1].x, frame[1].y, depth))
                            f2 = Vector((frame[2].x, frame[2].y, depth))
                            f3 = Vector((frame[3].x, frame[3].y, depth))
                        else:
                            f0 = Vector((-1.0, -1.0, depth))
                            f1 = Vector((1.0, -1.0, depth))
                            f2 = Vector((1.0, 1.0, depth))
                            f3 = Vector((-1.0, 1.0, depth))

                        visible = [o for o in objs if (not o.hide_render) and (not o.hide_viewport)]
                        visible.sort(key=lambda o: o.name)

                        for idx, part in enumerate(visible, start=1):
                            try:
                                center = Vector((0.0, 0.0, 0.0))
                                for c in part.bound_box:
                                    center += part.matrix_world @ Vector(c)
                                center /= 8.0
                            except Exception:
                                center = part.matrix_world.translation

                            try:
                                co = world_to_camera_view(scene, cam, center)
                                u = max(0.02, min(0.98, float(co.x)))
                                v = max(0.02, min(0.98, float(co.y)))
                            except Exception:
                                u, v = 0.5, 0.5

                            p_local = (f0 * (1.0 - u) * (1.0 - v)) + (f1 * u * (1.0 - v)) + (f2 * u * v) + (f3 * (1.0 - u) * v)

                            txt_data = bpy.data.curves.new(name=f"BCL_Callout_{idx}", type="FONT")
                            txt_data.body = str(idx)
                            txt_data.size = float(getattr(st, "callout_font_size", 0.08))

                            txt_obj = bpy.data.objects.new(name=f"BCL_Callout_{idx}", object_data=txt_data)
                            overlay_collection.objects.link(txt_obj)
                            txt_obj.parent = cam
                            txt_obj.matrix_parent_inverse = cam.matrix_world.inverted()
                            txt_obj.location = p_local
                            txt_obj.rotation_euler = (0.0, 0.0, 0.0)
                            txt_obj.show_in_front = True

                            try:
                                if scene.render.engine == "BLENDER_WORKBENCH":
                                    txt_obj.display_type = "WIRE"
                            except Exception:
                                pass

                            overlay_objects.append(txt_obj)

                scene.render.filepath = os.path.join(out_dir, f"Step_{step:03d}.png")
                bpy.ops.render.render(write_still=True)

        finally:
            for o in overlay_objects:
                try:
                    bpy.data.objects.remove(o, do_unlink=True)
                except Exception:
                    pass
            overlay_objects.clear()

            if overlay_collection is not None:
                try:
                    scene.collection.children.unlink(overlay_collection)
                except Exception:
                    pass
                try:
                    bpy.data.collections.remove(overlay_collection)
                except Exception:
                    pass

            scene.camera = prev_scene_camera
            if temp_cam_obj is not None:
                try:
                    bpy.data.objects.remove(temp_cam_obj, do_unlink=True)
                except Exception:
                    pass

            if temp_world is not None:
                try:
                    scene.world = prev_world
                except Exception:
                    pass
                try:
                    bpy.data.worlds.remove(temp_world)
                except Exception:
                    pass
            else:
                scene.world = prev_world

            if created_line_set is not None:
                try:
                    view_layer.freestyle_settings.linesets.remove(created_line_set)
                except Exception:
                    pass
            if created_line_style is not None:
                try:
                    bpy.data.linestyles.remove(created_line_style)
                except Exception:
                    pass

            for o in objs:
                if o.name in prev_hide:
                    o.hide_render, o.hide_viewport = prev_hide[o.name]
                if o.name in prev_loc:
                    o.location = prev_loc[o.name]

            scene.render.filepath = prev_render_filepath
            scene.render.engine = prev_engine
            if hasattr(scene.render, "film_transparent"):
                scene.render.film_transparent = prev_film_transparent

            try:
                if prev_wb_settings["light"] is not None:
                    scene.display.shading.light = prev_wb_settings["light"]
                if prev_wb_settings["color_type"] is not None:
                    scene.display.shading.color_type = prev_wb_settings["color_type"]
                if prev_wb_settings["single_color"] is not None:
                    scene.display.shading.single_color = prev_wb_settings["single_color"]
                if prev_wb_settings["show_xray"] is not None:
                    scene.display.shading.show_xray = prev_wb_settings["show_xray"]
            except Exception:
                pass

            view_layer.use_freestyle = prev_use_freestyle
            scene.render.image_settings.file_format = prev_image_settings["file_format"]
            scene.render.image_settings.color_mode = prev_image_settings["color_mode"]
            scene.render.image_settings.color_depth = prev_image_settings["color_depth"]

        self.report({"INFO"}, f"Exported {len(steps)} step images to: {out_dir}")
        return {"FINISHED"}


class BCL_OT_export_manual(Operator):
    bl_idname = "bcl.export_manual"
    bl_label = "Export Manual (TSV)"

    filepath: StringProperty(subtype="FILE_PATH")

    def invoke(self, context, event):
        if not self.filepath:
            self.filepath = bpy.path.abspath("//assembly_manual.tsv")
        context.window_manager.fileselect_add(self)
        return {"RUNNING_MODAL"}

    def execute(self, context):
        st = context.scene.bcl_settings
        col = st.source_collection
        if col is None:
            self.report({"WARNING"}, "Choose a collection")
            return {"CANCELLED"}

        depsgraph = context.evaluated_depsgraph_get()
        unit_label = "mm" if st.unit_system == "MM" else "in"

        rows = []
        for obj in _iter_collection_objects(col, include_children=st.include_children):
            if obj is None or obj.type != "MESH":
                continue
            if obj.hide_get() or obj.hide_viewport:
                continue

            dims = _eval_world_bbox_dimensions(obj, depsgraph)
            if dims is None:
                continue

            mat = _get_material_name(obj)
            length_m, width_m, thickness_m = dims

            kerf_m = st.kerf / 1000.0 if st.unit_system == "MM" else st.kerf * 0.0254
            length_m += kerf_m
            width_m += kerf_m

            length = _round_value(_to_unit(length_m, st.unit_system), st.rounding)
            width = _round_value(_to_unit(width_m, st.unit_system), st.rounding)
            thickness = _round_value(_to_unit(thickness_m, st.unit_system), st.rounding)

            step = 0
            note = ""
            try:
                step = int(getattr(obj, "bcl_manual_step", 0))
                note = str(getattr(obj, "bcl_manual_note", ""))
            except Exception:
                step = 0
                note = ""

            step_sort = step if step > 0 else 10**9
            rows.append((step_sort, step, obj.name, length, width, thickness, mat, note))

        if not rows:
            self.report({"WARNING"}, "No mesh objects found")
            return {"CANCELLED"}

        rows.sort(key=lambda r: (r[0], r[2]))

        try:
            with open(self.filepath, "w", encoding="utf-8", newline="") as f:
                f.write("\t".join(["Step", "Part", f"Length ({unit_label})", f"Width ({unit_label})", f"Thickness ({unit_label})", "Material", "Note"]) + "\n")
                for _, step, name, length, width, thickness, mat, note in rows:
                    f.write("\t".join([str(step), name, str(length), str(width), str(thickness), mat, note]) + "\n")
        except Exception as e:
            self.report({"ERROR"}, f"Export failed: {e}")
            return {"CANCELLED"}

        self.report({"INFO"}, f"Exported: {self.filepath}")
        return {"FINISHED"}


# ============================================================================
# FIREBASE SYNC OPERATORS
# ============================================================================

class BCL_OT_enable_sync(Operator):
    bl_idname = "bcl.enable_sync"
    bl_label = "Enable Sync"
    bl_description = "Enable real-time sync to Maa Wadi web app"
    
    def execute(self, context):
        st = context.scene.bcl_settings
        st.enable_sync = True
        st.sync_status = "Connecting..."
        
        # Start sync thread
        thread = threading.Thread(target=sync_to_firebase, args=(context,))
        thread.daemon = True
        thread.start()
        
        return {"FINISHED"}


class BCL_OT_disable_sync(Operator):
    bl_idname = "bcl.disable_sync"
    bl_label = "Disable Sync"
    bl_description = "Disable real-time sync"
    
    def execute(self, context):
        st = context.scene.bcl_settings
        st.enable_sync = False
        st.sync_status = "Disconnected"
        return {"FINISHED"}


class BCL_OT_sync_now(Operator):
    bl_idname = "bcl.sync_now"
    bl_label = "Sync Now"
    bl_description = "Sync cut list to web app immediately"
    
    def execute(self, context):
        st = context.scene.bcl_settings
        st.sync_status = "Syncing..."
        
        # Sync in background thread
        thread = threading.Thread(target=sync_to_firebase, args=(context,))
        thread.daemon = True
        thread.start()
        
        return {"FINISHED"}


def sync_to_firebase(context):
    """Sync cut list items to Firebase Realtime Database"""
    st = context.scene.bcl_settings
    
    # Firebase REST API endpoint
    firebase_url = "https://maa-wadi-mv-default-rtdb.firebaseio.com/blender/pieces.json"
    
    while st.enable_sync:
        try:
            # Prepare pieces data from cut list items
            pieces_data = {}
            for i, item in enumerate(st.items):
                # Parse material to extract teak info if present
                material = item.material or ""
                teak_top = "teak" in material.lower() and "top" in material.lower()
                teak_bottom = "teak" in material.lower() and "bottom" in material.lower()
                teak_left = "teak" in material.lower() and "left" in material.lower()
                teak_right = "teak" in material.lower() and "right" in material.lower()
                
                pieces_data[str(i)] = {
                    'name': item.part_name,
                    'length': item.length,
                    'width': item.width,
                    'thickness': item.thickness,
                    'teak_top': teak_top,
                    'teak_bottom': teak_bottom,
                    'teak_left': teak_left,
                    'teak_right': teak_right,
                    'qty': item.qty,
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
                    st.sync_status = f"Connected ({len(st.items)} items)"
                else:
                    st.sync_status = "Sync error"
                    
        except Exception as e:
            st.sync_status = f"Error: {str(e)[:20]}"
        
        # Wait before next sync (5 seconds)
        for _ in range(50):
            if not st.enable_sync:
                break
            time.sleep(0.1)


classes = (
    BCL_OT_generate_cut_list,
    BCL_OT_clear_cut_list,
    BCL_OT_export_cut_list,
    BCL_OT_export_manual,
    BCL_OT_export_step_renders,
    BCL_OT_set_step_selected,
    BCL_OT_auto_steps,
    BCL_OT_clear_steps,
    BCL_OT_normalize_steps,
    BCL_OT_export_manual_layout_html,
    BCL_OT_enable_sync,
    BCL_OT_disable_sync,
    BCL_OT_sync_now,
)


def register():
    for cls in classes:
        bpy.utils.register_class(cls)


def unregister():
    for cls in reversed(classes):
        bpy.utils.unregister_class(cls)
