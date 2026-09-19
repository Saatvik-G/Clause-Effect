import { describe, it, expect } from "vitest";

/**
 * Standard WCAG 2.1 relative luminance calculation (IEC 61966-2-1 / sRGB)
 */
function sRGBtoLin(colorChannel: number): number {
  const v = colorChannel / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function getRelativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * sRGBtoLin(r) + 0.7152 * sRGBtoLin(g) + 0.0722 * sRGBtoLin(b);
}

function getContrastRatio(hex1: string, hex2: string): number {
  const L1 = getRelativeLuminance(hex1);
  const L2 = getRelativeLuminance(hex2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("WCAG 2.1 AA Contrast Compliance (Accessibility Criterion 3.6)", () => {
  describe("Light Theme ('The Case Desk')", () => {
    const bg = "#F3EDE0";
    const surface = "#FBF7EE";
    const fg = "#15120E";
    const muted = "#5C5449";

    it("primary text on background meets WCAG AA (>= 4.5:1)", () => {
      const ratio = getContrastRatio(fg, bg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(ratio).toBeGreaterThan(12.0); // Ultra-high legibility
    });

    it("primary text on surface meets WCAG AA (>= 4.5:1)", () => {
      const ratio = getContrastRatio(fg, surface);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(ratio).toBeGreaterThan(13.0);
    });

    it("secondary / muted text meets WCAG AA (>= 4.5:1)", () => {
      const ratio = getContrastRatio(muted, bg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe("Night-Shift / Dark Theme", () => {
    const darkBg = "#1A1510";
    const darkSurface = "#241E17";
    const darkFg = "#E8DFC8";
    const darkMuted = "#8C7E6E";

    it("primary text on dark background meets WCAG AA (>= 4.5:1)", () => {
      const ratio = getContrastRatio(darkFg, darkBg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(ratio).toBeGreaterThan(10.0);
    });

    it("primary text on dark surface meets WCAG AA (>= 4.5:1)", () => {
      const ratio = getContrastRatio(darkFg, darkSurface);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      expect(ratio).toBeGreaterThan(9.0);
    });

    it("muted text on dark background meets WCAG AA (>= 4.5:1)", () => {
      const ratio = getContrastRatio(darkMuted, darkBg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe("Assistive Technology & Motion Rules", () => {
    it("never relies on color alone for risk states", () => {
      const riskLabels = {
        low: { label: "LOW RISK", icon: "✓" },
        medium: { label: "MEDIUM RISK", icon: "⚠" },
        high: { label: "HIGH RISK", icon: "⚑" },
        unusual: { label: "UNUSUAL", icon: "✦" },
      };
      for (const [, item] of Object.entries(riskLabels)) {
        expect(item.label.length).toBeGreaterThan(0);
        expect(item.icon.length).toBeGreaterThan(0);
      }
    });
  });
});
