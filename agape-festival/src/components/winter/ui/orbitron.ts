/**
 * Orbitron (the display face) has no macron letters (Ē etc.): the browser would borrow the glyph from
 * another font and it reads as a glitch. Drop the marks for display only; data, body text and structured
 * data keep "ÄGAPĒ". Its subset does draw Ä, so "ÄGAPE" stays as is.
 */
export const orbitronSafe = (s: string) => s.replace(/ÄGAPĒ/g, "AGAPE").normalize("NFD").replace(/[̄]/g, "").normalize("NFC");
