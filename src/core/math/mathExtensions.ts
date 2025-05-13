// math-extensions.d.ts

/**
 * Extends the built-in Math object with additional utility methods
 */
declare global {
  interface Math {
    /**
     * Clamps a number between min and max
     * @param value The input number
     * @param min Minimum allowed value
     * @param max Maximum allowed value
     */
    clamp(value: number, min: number, max: number): number;

    /**
     * Converts degrees to radians
     * @param degrees Angle in degrees
     */
    degToRad(degrees: number): number;

    /**
     * Converts radians to degrees
     * @param radians Angle in radians
     */
    radToDeg(radians: number): number;
  }
}

/**
 * Clamps a number between min and max
 * @param value The input number
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 */
Math.clamp = (value: number, min: number, max: number): number => {
  if (value < min) return min;

  if (value > max) return max;

  return value;
};

/**
 * Converts degrees to radians
 * @param degrees Angle in degrees
 */
Math.degToRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Converts radians to degrees
 * @param radians Angle in radians
 */
Math.radToDeg = (radians: number): number => {
  return (radians * 180) / Math.PI;
};

export {}; // Important: marks this file as a module
