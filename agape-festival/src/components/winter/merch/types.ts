/**
 * One piece as the merch section shows it while the line is locked: its name and its garment's two
 * shadow silhouettes (base paths; ProductImage adds the width and extension). No shop page.
 */
export interface Product {
  id: string;
  name: string;
  /** Back view: the lead image. */
  back: string;
  front: string;
}

export type Side = "front" | "back";

/** A product drawn in the preview. A new one wipes in over the last; older ones drop once it has landed. */
export interface Plate {
  key: number;
  i: number;
  enter?: boolean;
}
