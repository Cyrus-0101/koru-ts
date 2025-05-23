/** Complementary functions on top of JavaScript's Math lib */
interface Math {
  clamp(value: number, min: number, max: number): number;
  degToRad(degrees: number): number;
  radToDeg(radians: number): number;
}

/** Hacky way of adding our clamp to the Math lib in TS */
(Math as any).clamp = (value: number, min: number, max: number): number => {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
};

(Math as any).degToRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180.0;
};

(Math as any).radToDeg = (degrees: number): number => {
  return (degrees * 180.0) / Math.PI;
};
