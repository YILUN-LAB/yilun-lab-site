"""Centre Hug's light-entry assembly under the laminate, in a copy of the model.

    blender -b in.blend --python center_light_entry.py -- out.blend   # apply and save
    blender -b in.blend --python center_light_entry.py -- --check     # measure only

In the owner's model the U-channel edge cavity sits about 1.5 mm off the
laminate, so the laminate cuts into the channel's right wall and the LEDs
(centred in the channel) miss most of the light guide. For each of the 12
assemblies this moves, in the lamp's own frame and square to its lower edge:
- the edge cavity, vertex by vertex, so the channel centre meets the guide
  centre line along the whole curve;
- the end caps, control board envelope and opening sensor with the channel;
- each LED and heat island onto the guide centre line.
Nothing else changes. Units below are mm in the shell's local frame.
"""
import sys

import bmesh
import bpy
from mathutils import Matrix, Vector

args = sys.argv[sys.argv.index("--") + 1:]
CHECK = "--check" in args
OUT = next((a for a in args if not a.startswith("--")), None)


def basis(obj):
    if obj.parent is not None:
        raise ValueError(f"{obj.name} has a parent; expected none")
    return obj.matrix_basis.copy()


def same_transform(a, b):
    return all(abs(x - y) < 1e-6 for ra, rb in zip(basis(a), basis(b)) for x, y in zip(ra, rb))


def mesh_mm(obj, to_local):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.transform(to_local @ basis(obj))
    return bm


def cut(bm, c, t, a, zmin, zmax, umax):
    """(u, z) where the vertical plane through c, square to t, crosses bm's edges."""
    pts = []
    for e in bm.edges:
        p0, p1 = e.verts[0].co, e.verts[1].co
        d0, d1 = (p0 - c).dot(t), (p1 - c).dot(t)
        if d0 * d1 > 0 or d0 == d1:
            continue
        p = p0 + (p1 - p0) * (d0 / (d0 - d1))
        u = (p - c).dot(a)
        if zmin < p.z < zmax and abs(u) < umax:
            pts.append((u, p.z))
    return pts


def laminate_tangent(bm, c, z=12.0, radius=5.5):
    """Direction of the laminate near c: principal axis of the guide's horizontal
    cut at height z (both faces of the 2.4 mm band) within radius of c."""
    pts = []
    for e in bm.edges:
        p0, p1 = e.verts[0].co, e.verts[1].co
        if (p0.z - z) * (p1.z - z) > 0 or p0.z == p1.z:
            continue
        p = p0 + (p1 - p0) * ((z - p0.z) / (p1.z - p0.z))
        if (p.xy - c.xy).length < radius:
            pts.append(p.xy)
    if len(pts) < 6:
        return None
    m = sum(pts, Vector((0, 0))) / len(pts)
    sxx = sum((q.x - m.x) ** 2 for q in pts)
    syy = sum((q.y - m.y) ** 2 for q in pts)
    sxy = sum((q.x - m.x) * (q.y - m.y) for q in pts)
    import math
    angle = 0.5 * math.atan2(2 * sxy, sxx - syy)
    return Vector((math.cos(angle), math.sin(angle), 0))


def span_centre(us, window):
    """Centre of the group of u values nearest to 0 (ignores a second crossing)."""
    if not us:
        return None
    nearest = min(us, key=abs)
    near = [u for u in us if abs(u - nearest) < window]
    return (min(near) + max(near)) / 2, min(near), max(near)


def scene_list(coll):
    return [s for s in bpy.data.scenes if coll.name in {c.name for c in s.collection.children_recursive}]


def owner(coll, centre_world):
    for scene in scene_list(coll):
        objs = list(scene.objects)
        for shell in [o for o in objs if o.type == "MESH" and o.name.startswith("01 | HUG")]:
            local = basis(shell).inverted() @ centre_world
            lo, hi = Vector(shell.bound_box[0]), Vector(shell.bound_box[6])
            if not all(lo[k] - 0.01 <= local[k] <= hi[k] + 0.01 for k in range(3)):
                continue
            guides = [g for g in objs if g.type == "MESH" and g.name.startswith("02 |")
                      and len(g.data.vertices) == len(shell.data.vertices) and same_transform(g, shell)]
            if guides:
                return shell, guides[0]
    return None


def first(coll, prefix):
    return sorted([o for o in coll.objects if o.type == "MESH" and o.name.startswith(prefix)], key=lambda o: o.name)


def measure(shell, guide, cavity, leds, islands):
    to_local = Matrix.Scale(1000, 4) @ basis(shell).inverted()
    g_bm, s_bm, c_bm = mesh_mm(guide, to_local), mesh_mm(shell, to_local), mesh_mm(cavity, to_local)
    centres = []
    for led in leds:
        pts = [to_local @ basis(led) @ v.co for v in led.data.vertices]
        centres.append(sum(pts, Vector()) / len(pts))
    rows = []
    for i, c in enumerate(centres):
        t = laminate_tangent(g_bm, c)
        if t is None:  # fall back to the LED row direction
            t = centres[min(i + 1, len(centres) - 1)] - centres[max(i - 1, 0)]
            t.z = 0
            t.normalize()
        a = Vector((t.y, -t.x, 0))
        if i and a.dot(rows[-1]["a"]) < 0:  # keep one consistent side along the row
            t, a = -t, -a
        guide_c = span_centre([u for u, _ in cut(g_bm, c, t, a, 9, 14, 12)], 3.2)
        # The guide's lower edge (where the LEDs couple in) and the laminate inside
        # the channel; in the gathered state the laminate leans about 7 degrees.
        guide_low = span_centre([u for u, _ in cut(g_bm, c, t, a, 7.4, 10.5, 12)], 3.2)
        floor = span_centre([u for u, _ in cut(c_bm, c, t, a, 2.3, 2.9, 8)], 5.5)
        lam = span_centre([u for u, _ in cut(s_bm, c, t, a, 3, 9, 12)], 4.0)
        led_us = [(to_local @ basis(leds[i]) @ v.co - c).dot(a) for v in leds[i].data.vertices]
        isl_us = [(to_local @ basis(islands[i]) @ v.co - c).dot(a) for v in islands[i].data.vertices]
        rows.append({"c": c, "t": t, "a": a, "guide": guide_c, "guide_low": guide_low,
                     "floor": floor, "laminate": lam,
                     "led": (min(led_us), max(led_us)), "island": (min(isl_us), max(isl_us))})
    for bm in (g_bm, s_bm, c_bm):
        bm.free()
    return rows, to_local


def along(rows, p):
    """Shift and across direction at p, interpolated along the LED row (xy only)."""
    best = None
    for i in range(len(rows) - 1):
        p0, p1 = rows[i]["c"].xy, rows[i + 1]["c"].xy
        seg = p1 - p0
        k = (p.xy - p0).dot(seg) / seg.length_squared
        if i == 0:
            k = max(k, -10.0)
        elif i == len(rows) - 2:
            k = min(k, 10.0)
        else:
            k = min(max(k, 0.0), 1.0)
        kc = min(max(k, 0.0), 1.0)
        d = (p.xy - (p0 + seg * kc)).length
        if best is None or d < best[0]:
            best = (d, i, kc)
    _, i, k = best
    r0, r1 = rows[i], rows[i + 1]
    shift = r0["shift"] * (1 - k) + r1["shift"] * k
    a = (r0["a"] * (1 - k) + r1["a"] * k).normalized()
    return shift, a


assemblies = sorted([c for c in bpy.data.collections if c.name.startswith("03 | 完全内藏")], key=lambda c: c.name)
worst = {"channel_vs_laminate": 0.0}
for coll in assemblies:
    cavity, caps = first(coll, "04 |")[0], first(coll, "04B |")
    board, sensor = first(coll, "05 |")[0], first(coll, "06 |")[0]
    leds = [o for o in first(coll, "入光") if "LED" in o.name]
    islands = [o for o in first(coll, "入光") if "导热岛" in o.name]
    centre_world = sum((basis(o).translation for o in leds), Vector()) / len(leds)
    found = owner(coll, centre_world)
    if not found:
        print(f"SKIP {coll.name}: no matching shell and guide")
        continue
    shell, guide = found
    rows, to_local = measure(shell, guide, cavity, leds, islands)
    if any(r["guide_low"] is None or r["floor"] is None or r["laminate"] is None for r in rows):
        print(f"SKIP {coll.name}: incomplete cut")
        continue
    # Channel centre to the centre of the laminate where it sits in the channel.
    diffs = [r["laminate"][0] - r["floor"][0] for r in rows]
    led_ok = all(r["guide_low"][1] - 0.01 <= r["led"][0] and r["led"][1] <= r["guide_low"][2] + 0.01 for r in rows)
    island_ok = all(r["floor"][1] - 0.01 <= r["island"][0] and r["island"][1] <= r["floor"][2] + 0.01 for r in rows)
    lam_ok = all(r["laminate"] and r["floor"][1] - 0.01 <= r["laminate"][1] and r["laminate"][2] <= r["floor"][2] + 0.01 for r in rows)
    label = "CHECK" if CHECK else "BEFORE"
    print(f"{label} {coll.name[-4:]} shell=…{shell.name[-4:]} channel-to-laminate mm {min(diffs):.2f}..{max(diffs):.2f} "
          f"LED under guide={led_ok} island in channel={island_ok} laminate clear of walls={lam_ok}")
    worst["channel_vs_laminate"] = max(worst["channel_vs_laminate"], max(abs(d) for d in diffs))
    if CHECK:
        continue
    if not all(0.5 < abs(d) < 2.5 for d in diffs):
        print(f"SKIP {coll.name}: channel offsets outside the expected range, not moving")
        continue

    for r, d in zip(rows, diffs):
        r["shift"] = d
    local_to_world = basis(shell).to_3x3() @ Matrix.Scale(0.001, 3)

    # Edge cavity: each vertex moves square to the edge by the local channel shift.
    to_cav = to_local @ basis(cavity)
    from_cav = to_cav.inverted()
    for v in cavity.data.vertices:
        p = to_cav @ v.co
        shift, a = along(rows, p)
        v.co = from_cav @ (p + a * shift)
    cavity.data.update()

    # Parts that ride in the channel move with it.
    for obj in caps + [board, sensor]:
        p = to_local @ basis(obj).translation
        shift, a = along(rows, p)
        obj.location += local_to_world @ (a * shift)

    # LEDs and heat islands onto the guide centre line.
    for led, island, r in zip(leds, islands, rows):
        delta = local_to_world @ (r["a"] * r["guide_low"][0])
        led.location += delta
        island.location += delta

print("WORST channel-to-laminate mm", round(worst["channel_vs_laminate"], 2))
if OUT and not CHECK:
    bpy.ops.wm.save_as_mainfile(filepath=OUT, copy=True, compress=True)
    print(f"SAVED {OUT}")
