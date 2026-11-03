# Render the September site's wireframe torus knot (three.js TorusKnotGeometry(2.5, 0.5, 150, 20) +
# a 1.04x 80x12 shell) as a still: white lines, alpha = line coverage. usage: knot.py out.png size rx ry rz camz
import math, sys
import numpy as np
from PIL import Image, ImageDraw

out, size, rx, ry, rz, camz = sys.argv[1], int(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5]), float(sys.argv[6])
SS = 3
W = H = size * SS

def knot(radius, tube, tub, rad, p=2, q=3, scale=1.0):
    def calc(u):
        cu, su = math.cos(u), math.sin(u)
        quOverP = q / p * u
        cs = math.cos(quOverP)
        return np.array([radius * (2 + cs) * 0.5 * cu, radius * (2 + cs) * su * 0.5, radius * math.sin(quOverP) * 0.5])
    verts = []
    for i in range(tub + 1):
        u = i / tub * p * math.pi * 2
        P1, P2 = calc(u), calc(u + 0.01)
        T = P2 - P1; N = P2 + P1; B = np.cross(T, N); N = np.cross(B, T)
        B /= np.linalg.norm(B); N /= np.linalg.norm(N)
        row = []
        for j in range(rad + 1):
            v = j / rad * math.pi * 2
            cx, cy = -tube * math.cos(v), tube * math.sin(v)
            row.append((P1 + cx * N + cy * B) * scale)
        verts.append(row)
    edges = set()
    for j in range(1, tub + 1):
        for i in range(1, rad + 1):
            a = (j - 1, i - 1); b = (j, i - 1); c = (j, i); d = (j - 1, i)
            for e in [(a, b), (b, d), (d, a), (b, c), (c, d)]:
                edges.add(tuple(sorted(e)))
    return verts, edges

def rot(v):
    x, y, z = v
    # x, then y, then z
    cy_, sy_ = math.cos(rx), math.sin(rx)
    y, z = y * cy_ - z * sy_, y * sy_ + z * cy_
    cyy, syy = math.cos(ry), math.sin(ry)
    x, z = x * cyy + z * syy, -x * syy + z * cyy
    cz, sz = math.cos(rz), math.sin(rz)
    x, y = x * cz - y * sz, x * sz + y * cz
    return x, y, z

fov = math.radians(55)
f = (H / 2) / math.tan(fov / 2)
def proj(v):
    x, y, z = rot(v)
    d = camz - z
    return (W / 2 + x * f / d, H / 2 - y * f / d, d)

img = np.zeros((H, W), np.float32)
for (radius, tube, tub, rad, scale, alpha) in [(2.5, 0.5, 150, 20, 1.0, 1.0), (2.5, 0.5, 80, 12, 1.04, 0.45)]:
    verts, edges = knot(radius, tube, tub, rad, scale=scale)
    P = [[proj(v) for v in row] for row in verts]
    layer = Image.new("L", (W, H), 0)
    dr = ImageDraw.Draw(layer)
    for (a, b) in edges:
        pa, pb = P[a[0]][a[1]], P[b[0]][b[1]]
        # fog: fade with distance like THREE.Fog(6, 22)
        d = (pa[2] + pb[2]) / 2
        fog = max(0.0, min(1.0, (22 - d) / (22 - 6)))
        dr.line([pa[:2], pb[:2]], fill=int(255 * fog), width=2)
    img += np.asarray(layer, np.float32) / 255.0 * alpha
img = np.clip(img, 0, 1)
a = Image.fromarray((img * 255).astype(np.uint8), "L").resize((size, size), Image.LANCZOS)
rgba = Image.merge("RGBA", [Image.new("L", a.size, 255)] * 3 + [a])
rgba.save(out)
print(out, rgba.size)
