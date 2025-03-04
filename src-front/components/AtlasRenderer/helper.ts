/**
 * Converts a hexadecimal color value to shader-compatible normalized color array
 * @param hex - The hexadecimal color string (with or without leading '#')
 * @param includeAlpha - Whether to include alpha component in the output
 * @returns Array of normalized RGB(A) values in range [0,1]
 */
export function hexToShaderColor(
  hex: string,
  includeAlpha: boolean = false,
): number[] {
  // Remove the # if it exists
  hex = hex.replace(/^#/, '');

  // Parse the hex value to RGB components
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Normalize to 0-1 range
  const color = [r / 255, g / 255, b / 255];

  // Include alpha if requested and available
  if (includeAlpha) {
    const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1.0;
    color.push(a);
  }

  return color;
}
