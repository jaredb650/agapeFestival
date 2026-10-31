/** One product as the merch section shows it: the name in sentence case, its shop page, its two photographs. */
export interface Product {
  name: string;
  href: string;
  /** Back print: the lead image. */
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
