# Stage the theme add-on: festival kit components -> red-hybrid-theme/components/cyber (wcy- prefix,
# @theme imports, cyber.css import, CyberScope instead of RedHybridKit). Writes into <out>/components/cyber.
import os, re, sys

src, out = sys.argv[1], sys.argv[2]
dst = os.path.join(out, "components", "cyber")
os.makedirs(dst, exist_ok=True)

SKIP = {"RedHybridKit.tsx", "Frame.tsx", "HudLabel.tsx", "cx.ts", "index.ts", "red-hybrid.css", "README.md"}
CSS_IMPORT = 'import "@theme/styles/cyber.css";'

for name in sorted(os.listdir(src)):
    if name in SKIP or not name.endswith((".ts", ".tsx")):
        continue
    s = open(os.path.join(src, name)).read()
    s = s.replace('import { cx } from "./cx";', 'import { cx } from "@theme/components/ui";')
    s = s.replace("rhk-", "wcy-")
    s = s.replace("<RedHybridKit>", "<CyberScope>")
    if name.endswith(".tsx"):
        lines = s.split("\n")
        # after the last import line
        last = max(i for i, l in enumerate(lines) if l.startswith("import "))
        # multi-line imports end with '} from "...";'
        lines.insert(last + 1, CSS_IMPORT)
        s = "\n".join(lines)
    open(os.path.join(dst, name), "w").write(s)
    print("wrote", name)

open(os.path.join(dst, "CyberScope.tsx"), "w").write('''import type { CSSProperties, ReactNode } from "react";
import { cx } from "@theme/components/ui";
import "@theme/styles/cyber.css";

export interface CyberScopeProps {
  children?: ReactNode;
  /** red (default) = the theme's tokens (legacy ice/volt names already map to red); blue = the original c9688b5 palette. */
  palette?: "red" | "blue";
  as?: "div" | "section" | "main" | "aside" | "span";
  className?: string;
  style?: CSSProperties;
  id?: string;
}

/**
 * Optional wrapper for the cyber add-on. The pieces work anywhere inside the page's `.winter`
 * root (that is where the tokens live); wrap them in this to switch a region back to the
 * original blue build palette (`.wcy-blue`), or just to load cyber.css from one place.
 */
export function CyberScope({ children, palette = "red", as = "div", className, style, id }: CyberScopeProps) {
  const Tag = as as "div";
  return (
    <Tag id={id} className={cx(palette === "blue" && "wcy-blue", className) || undefined} style={style}>
      {children}
    </Tag>
  );
}
''')

idx = open(os.path.join(src, "index.ts")).read()
idx = idx.replace('// red-hybrid palette. Opt-in: render pieces inside <RedHybridKit>. See README.md.\nexport { RedHybridKit, type RedHybridKitProps } from "./RedHybridKit";',
                  '// theme: the legacy --w-ice / --w-volt names render red here. See README.md.\nexport { CyberScope, type CyberScopeProps } from "./CyberScope";')
idx = idx.replace('// ÄGAPĒ "red hybrid" alternate kit: the blue HUD build\'s cyber frames and chrome\n// (winter-redesign @ c9688b5, before e88ce36 simplified it), re-tokened for the\n',
                  '// Cyber add-on for the red-hybrid theme: the blue HUD build\'s cyber frames and chrome\n// (agapeFestival winter-redesign @ c9688b5, before e88ce36 simplified it into this\n')
idx = re.sub(r'export \{ Frame, type FrameProps \} from "./Frame";\n', '', idx)
idx = re.sub(r'export \{ HudLabel, type HudLabelProps \} from "./HudLabel";\n', '', idx)
idx = re.sub(r'export \{ cx \} from "./cx";\n', '', idx)
idx += '// Frame, HudLabel and cx: use the theme\'s own (@theme/components/ui); they are unchanged since c9688b5 apart from colour.\n'
assert "RedHybridKit" not in idx, idx
open(os.path.join(dst, "index.ts"), "w").write(idx)
print("wrote index.ts + CyberScope.tsx")
