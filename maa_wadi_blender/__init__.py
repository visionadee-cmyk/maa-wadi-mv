bl_info = {
    "name": "Maa Wadi Blender",
    "author": "Retts Web Dev",
    "version": (1, 0, 0),
    "blender": (4, 0, 0),
    "location": "View3D > Sidebar > Furniture > Cut List",
    "description": "Generate woodworking cut list with real-time sync to Maa Wadi web app",
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
