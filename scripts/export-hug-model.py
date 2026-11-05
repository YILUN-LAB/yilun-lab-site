"""Export the Hug study model for the web viewer.

Run with Blender (tested with 5.2):

    blender -b <owner's three-state hug .blend> \
      --python scripts/export-hug-model.py -- /tmp/hug-states.glb

Reads scene 00 (the submission scene), where each state collection holds
the outer shell ("01 | HUG ...") and the edge light cavity ("04 | ..."). The
three states share one topology, so the open state becomes the base mesh and
half-open / gathered become shape keys (glTF morph targets).

Object rotations in that scene are camera staging (open -8°, half-open -38°,
gathered 0°), so every state is taken in its local frame. That also turns the
half-open state back to face the front, as the owner asked.

Normals, UVs and materials are left out: the viewer draws its own lines and
computes normals at runtime. Compress the result afterwards with
`npx @gltf-transform/cli meshopt` (see docs/hug.md).
"""

import sys

import bpy

STATE_PREFIXES = ("01", "02", "03")  # open, half-open, gathered
PARTS = {"shell": "01 | HUG", "cavity": "04 | 隐藏边缘入光腔"}
KEY_NAMES = ("half-open", "gathered")


def find_part(scene, state_prefix, name_prefix):
    for collection in scene.collection.children:
        if not collection.name.startswith(state_prefix):
            continue
        for obj in collection.objects:
            if obj.type == "MESH" and obj.name.startswith(name_prefix):
                return obj
    raise LookupError(f"No '{name_prefix}' mesh in state {state_prefix}")


def evaluated_coords(obj, depsgraph):
    """Vertex positions with modifiers applied, in the object's local frame."""
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    coords = [v.co.copy() for v in mesh.vertices]
    evaluated.to_mesh_clear()
    return coords


def main():
    out_path = sys.argv[sys.argv.index("--") + 1]
    source = bpy.data.scenes[0]
    depsgraph = bpy.context.evaluated_depsgraph_get()

    export_scene = bpy.data.scenes.new("hug-web-export")
    exported = []
    for part, prefix in PARTS.items():
        objects = [find_part(source, state, prefix) for state in STATE_PREFIXES]
        base_eval = objects[0].evaluated_get(depsgraph)
        mesh = bpy.data.meshes.new_from_object(base_eval)
        mesh.name = part
        obj = bpy.data.objects.new(part, mesh)
        export_scene.collection.objects.link(obj)

        obj.shape_key_add(name="open")
        for key_name, state_obj in zip(KEY_NAMES, objects[1:]):
            coords = evaluated_coords(state_obj, depsgraph)
            if len(coords) != len(mesh.vertices):
                raise ValueError(
                    f"{part}: {state_obj.name} has {len(coords)} vertices, "
                    f"expected {len(mesh.vertices)}"
                )
            key = obj.shape_key_add(name=key_name)
            for point, co in zip(key.data, coords):
                point.co = co
        exported.append(obj)
        print(f"PART {part}: {len(mesh.vertices)} vertices, {len(mesh.polygons)} faces")

    # Leave only the export scene so the exporter writes nothing else. The
    # .blend file itself is never saved.
    for scene in list(bpy.data.scenes):
        if scene != export_scene:
            bpy.data.scenes.remove(scene)

    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format="GLB",
        use_active_scene=True,
        export_apply=False,
        export_yup=True,
        export_normals=False,
        export_texcoords=False,
        export_materials="NONE",
        export_morph=True,
        export_morph_normal=False,
        export_animations=False,
    )
    print(f"EXPORTED {out_path}")


main()
