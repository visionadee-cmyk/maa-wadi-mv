bl_info = {
    "name": "Blender Cut List",
    "author": "",
    "version": (1, 1, 1),
    "blender": (4, 5, 0),
    "location": "View3D > Sidebar > Furniture > Cut List",
    "description": "Generate a woodworking cut list from a chosen collection.",
    "category": "3D View",
}

from . import operators, panels, props

_modules = (props, operators, panels)


def register():
    for m in _modules:
        m.register()


def unregister():
    for m in reversed(_modules):
        m.unregister()
