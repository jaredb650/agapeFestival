"""Recursively list a public Drive folder via embeddedfolderview (names, ids, mime type icon).
usage: python3 -I drive_tree.py FOLDER_ID [maxdepth]
Prints: <indent><kind> <id> <name>   (kind = DIR or mime type from the icon url)
"""
import html, re, subprocess, sys

def fetch(fid):
    out = subprocess.run(["curl", "-sL", f"https://drive.google.com/embeddedfolderview?id={fid}"],
                         capture_output=True, timeout=60).stdout.decode("utf-8", "replace")
    ents = []
    for chunk in out.split('<div class="flip-entry" id="entry-')[1:]:
        eid = chunk.split('"', 1)[0]
        href = re.search(r'<a href="([^"]+)"', chunk)
        mime = re.search(r'type/([^"]+)"', chunk)
        title = re.search(r'flip-entry-title">([^<]*)<', chunk)
        href = href.group(1) if href else ""
        mime = mime.group(1) if mime else "?"
        kind = "DIR" if "/folders/" in href or "folder" in mime else mime
        ents.append((kind, eid, html.unescape(title.group(1) if title else "?")))
    return ents

def walk(fid, depth, maxd, path):
    for kind, eid, title in fetch(fid):
        if title.startswith("._") or title == ".DS_Store":
            continue
        print(f"{'  ' * depth}{kind} {eid} {title}")
        if kind == "DIR" and depth < maxd:
            walk(eid, depth + 1, maxd, path + "/" + title)

walk(sys.argv[1], 0, int(sys.argv[2]) if len(sys.argv) > 2 else 4, "")
