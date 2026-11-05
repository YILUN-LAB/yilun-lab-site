"""Export measurements for the Hug light-path drawing (Function section).

Run with Blender (tested with 5.2):

    blender -b <hug .blend> --python scripts/export-hug-function-drawing.py -- \
      src/lib/data/hug-function-drawing.json

Reads the open state in scene 00 of the owner's model and writes, in mm:

- elevation: the front silhouette of the open shell (rendered, then traced),
  the edge cavity, the LEDs with their heat islands, the control board
  envelope and the opening sensor, all in the shell's local frame;
- section: profiles of the shell, light guide, cavity, LED and heat island,
  cut by a vertical plane through the middle LED, square to the lower edge.

The web drawing (HugLightPath.tsx) draws from this file only, so it matches
the model. Export from the version with the light-entry assembly centred under
the laminate (HUG_三态_入光组件居中.blend, 5 November 2026); in the earlier file
the edge cavity sat about 1.5 mm off the laminate.
"""

import json
import math
import os
import sys
import tempfile

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector

OPEN_STATE = "01"
SECTION_LED = 7
SECTION_HALF_WIDTH = 14.0  # mm either side of the guide
SECTION_HEIGHT = 32.0  # mm from the table
PX_PER_MM = 4


def state_collection(scene):
    for collection in scene.collection.children:
        if collection.name.startswith(OPEN_STATE):
            return collection
    raise LookupError("Open state collection not found")


def part(collection, prefix):
    matches = [o for o in collection.objects if o.type == "MESH" and o.name.startswith(prefix)]
    if not matches:
        raise LookupError(f"No mesh starting with {prefix!r}")
    return sorted(matches, key=lambda o: o.name)


def local_mesh(obj, shell, depsgraph):
    """Evaluated mesh as a bmesh, in the shell's local frame, in mm."""
    evaluated = obj.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    bm = bmesh.new()
    bm.from_mesh(mesh)
    evaluated.to_mesh_clear()
    to_shell = shell.matrix_world.inverted() @ obj.matrix_world
    if obj.name.startswith("02 |"):
        # The light guide shares the shell's local frame; its object placement
        # in this scene is not staged with the shell.
        to_shell = Matrix.Identity(4)
    bm.transform(Matrix.Scale(1000, 4) @ to_shell)
    return bm


def box(obj, shell, depsgraph):
    bm = local_mesh(obj, shell, depsgraph)
    xs = [v.co for v in bm.verts]
    lo = Vector((min(p.x for p in xs), min(p.y for p in xs), min(p.z for p in xs)))
    hi = Vector((max(p.x for p in xs), max(p.y for p in xs), max(p.z for p in xs)))
    bm.free()
    return lo, hi


def r(value):
    return round(value, 2)


def trace_silhouette(shell, depsgraph):
    """Front (−Y) orthographic render of the shell, traced to a polygon in mm."""
    scene = bpy.data.scenes.new("silhouette")
    mesh = bpy.data.meshes.new_from_object(shell.evaluated_get(depsgraph))
    obj = bpy.data.objects.new("shell", mesh)
    scene.collection.objects.link(obj)
    size_mm = 300.0
    camera_data = bpy.data.cameras.new("front")
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = size_mm / 1000
    camera = bpy.data.objects.new("front", camera_data)
    camera.location = (0, -2, 0.15)
    camera.rotation_euler = (math.radians(90), 0, 0)
    scene.collection.objects.link(camera)
    scene.camera = camera
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.render.film_transparent = True
    scene.display.shading.light = "FLAT"
    scene.display.shading.color_type = "SINGLE"
    scene.render.resolution_x = scene.render.resolution_y = int(size_mm * PX_PER_MM)
    scene.render.resolution_percentage = 100
    path = os.path.join(tempfile.mkdtemp(), "silhouette.png")
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True, scene=scene.name)

    image = bpy.data.images.load(path)
    w, h = image.size
    alpha = np.array(image.pixels[:], dtype=np.float32).reshape(h, w, 4)[:, :, 3]
    mask = alpha[::-1] > 0.5  # row 0 at the top

    # Moore-neighbour boundary trace of the outer contour.
    ys, xs = np.nonzero(mask)
    start = (ys.min(), xs[ys == ys.min()].min())
    directions = [(-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1), (-1, -1)]
    contour = [start]
    current, back = start, 6
    for _ in range(mask.size):
        for k in range(8):
            d = (back + 1 + k) % 8
            ny, nx = current[0] + directions[d][0], current[1] + directions[d][1]
            if 0 <= ny < h and 0 <= nx < w and mask[ny, nx]:
                back = (d + 4) % 8
                current = (ny, nx)
                break
        if current == start:
            break
        contour.append(current)

    centre_x, top_z = w / 2, size_mm / 2 + 150
    points = [((x - centre_x) / PX_PER_MM, top_z - y / PX_PER_MM) for y, x in contour]
    return simplify(points, 0.2)


def simplify(points, tolerance):
    """Ramer-Douglas-Peucker on a closed polyline."""

    def rdp(pts):
        if len(pts) < 3:
            return pts
        (x0, y0), (x1, y1) = pts[0], pts[-1]
        dx, dy = x1 - x0, y1 - y0
        length = math.hypot(dx, dy) or 1e-9
        distances = [abs(dy * (x - x0) - dx * (y - y0)) / length for x, y in pts[1:-1]]
        index = max(range(len(distances)), key=distances.__getitem__)
        if distances[index] <= tolerance:
            return [pts[0], pts[-1]]
        left = rdp(pts[: index + 2])
        right = rdp(pts[index + 1 :])
        return left[:-1] + right

    half = len(points) // 2
    return rdp(points[: half + 1])[:-1] + rdp(points[half:] + [points[0]])[:-1]


def chain(segments):
    """Joins cut edges that share end points into polylines."""
    key = lambda p: (round(p[0], 3), round(p[1], 3))
    remaining = [list(s) for s in segments]
    lines = []
    while remaining:
        line = remaining.pop()
        grown = True
        while grown:
            grown = False
            for i, (a, b) in enumerate(remaining):
                if key(a) == key(line[-1]):
                    line.append(b)
                elif key(b) == key(line[-1]):
                    line.append(a)
                elif key(a) == key(line[0]):
                    line.insert(0, b)
                elif key(b) == key(line[0]):
                    line.insert(0, a)
                else:
                    continue
                remaining.pop(i)
                grown = True
                break
        lines.append([[r(x), r(y)] for x, y in line])
    return lines


def section(obj, shell, depsgraph, origin, tangent, across):
    bm = local_mesh(obj, shell, depsgraph)
    result = bmesh.ops.bisect_plane(
        bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=origin, plane_no=tangent
    )
    segments = []
    for element in result["geom_cut"]:
        if not isinstance(element, bmesh.types.BMEdge):
            continue
        a, b = (v.co - origin for v in element.verts)
        ua, ub = a.dot(across), b.dot(across)
        if a.z > SECTION_HEIGHT and b.z > SECTION_HEIGHT:
            continue
        if abs(ua) > SECTION_HALF_WIDTH and abs(ub) > SECTION_HALF_WIDTH:
            continue
        segments.append(((ua, a.z + origin.z), (ub, b.z + origin.z)))
    bm.free()
    return chain(segments)


def edge_frame(centres, index):
    """Tangent along the LED row and the horizontal direction square to it."""
    before = centres[max(index - 1, 0)]
    after = centres[min(index + 1, len(centres) - 1)]
    tangent = after - before
    tangent.z = 0
    tangent.normalize()
    return tangent, Vector((tangent.y, -tangent.x, 0))


def main():
    out_path = sys.argv[sys.argv.index("--") + 1]
    scene = bpy.data.scenes[0]
    depsgraph = bpy.context.evaluated_depsgraph_get()
    collection = state_collection(scene)
    shell = part(collection, "01 | HUG")[0]
    guide = part(collection, "02 |")[0]
    cavity = part(collection, "04 |")[0]
    leds = part(collection, "入光")
    leds = [o for o in leds if "LED" in o.name]
    islands = [o for o in part(collection, "入光") if "导热岛" in o.name]
    board = part(collection, "05 |")[0]
    sensor = part(collection, "06 |")[0]

    def rect(obj):
        lo, hi = box(obj, shell, depsgraph)
        return {"x": r(lo.x), "z": r(lo.z), "w": r(hi.x - lo.x), "h": r(hi.z - lo.z)}

    led_boxes = [box(o, shell, depsgraph) for o in leds]
    centres = [((lo + hi) / 2) for lo, hi in led_boxes]
    shell_lo, shell_hi = box(shell, depsgraph=depsgraph, shell=shell)
    guide_lo, _ = box(guide, shell, depsgraph)

    origin = centres[SECTION_LED - 1].copy()
    tangent, across = edge_frame(centres, SECTION_LED - 1)

    data = {
        "source": "Open state, scene 00 of the owner's three-state model. Units: mm.",
        "elevation": {
            "width": r(shell_hi.x - shell_lo.x),
            "height": r(shell_hi.z - shell_lo.z),
            "outline": [[r(x), r(z)] for x, z in trace_silhouette(shell, depsgraph)],
            "cavity": rect(cavity),
            "leds": [rect(o) for o in leds],
            "islands": [rect(o) for o in islands],
            "board": rect(board),
            "sensor": rect(sensor),
            "guideStart": r(guide_lo.z),
            "sectionX": r(origin.x),
        },
        "section": {
            "led": SECTION_LED,
            "shell": section(shell, shell, depsgraph, origin, tangent, across),
            "guide": section(guide, shell, depsgraph, origin, tangent, across),
            "cavity": section(cavity, shell, depsgraph, origin, tangent, across),
            "led_profile": section(leds[SECTION_LED - 1], shell, depsgraph, origin, tangent, across),
            "island": section(islands[SECTION_LED - 1], shell, depsgraph, origin, tangent, across),
        },
    }
    with open(out_path, "w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, separators=(",", ":"))
    e = data["elevation"]
    print(f"EXPORTED {out_path}: outline {len(e['outline'])} points, {len(e['leds'])} LEDs")
    for name, lines in data["section"].items():
        if isinstance(lines, list):
            print(f"SECTION {name}: {len(lines)} lines, {sum(len(l) for l in lines)} points")


main()
