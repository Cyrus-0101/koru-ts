/**
 * Color - RGBA color representation for WebGL rendering
 *
 * Features:
 * - 8-bit per channel color storage (0-255)
 * - Float conversion for WebGL (0.0-1.0)
 * - Common color presets (red, green, blue, white, black)
 * - Multiple array format outputs
 *
 * Usage:
 * ```typescript
 * // Create custom color
 * const purple = new Color(128, 0, 128, 255);
 *
 * // Use preset color (red, green blue, white, black)
 * const white = Color.white();
 *
 * // Get WebGL-compatible format
 * const glColor = purple.toFloat32Array();
 * ```
 */
export class Color {
  private _r: number;
  private _g: number;
  private _b: number;
  private _a: number;

  public constructor(
    r: number = 255,
    g: number = 255,
    b: number = 255,
    a: number = 255
  ) {
    this._r = r;
    this._g = g;
    this._b = b;
    this._a = a;
  }

  /** Gets red component (0-255) */
  private get r(): number {
    return this._r;
  }

  /** Gets red component as float (0.0-1.0) for WebGL */
  private get rFloat(): number {
    return this._r / 255.0;
  }

  /** Sets red component (0-255) */
  private set r(value: number) {
    this._r = value;
  }
  /** Gets green component (0-255) */
  private get g(): number {
    return this._g;
  }

  /** Gets green component as float (0.0-1.0) for WebGL */
  private get gFloat(): number {
    return this._g / 255.0;
  }

  /** Sets green component (0-255) */
  private set g(value: number) {
    this._g = value;
  }

  /** Gets blue component (0-255) */
  private get b(): number {
    return this._b;
  }

  /** Gets blue component as float (0.0-1.0) for WebGL */
  private get bFloat(): number {
    return this._b / 255.0;
  }

  /** Sets blue component (0-255) */
  private set b(value: number) {
    this._b = value;
  }

  /** Gets alpha component (0-255) */
  private get a(): number {
    return this._a;
  }

  /** Gets alpha component as float (0.0-1.0) for WebGL */
  private get aFloat(): number {
    return this._a / 255.0;
  }

  /** Sets alpha component (0-255) */
  private set a(value: number) {
    this._a = value;
  }

  /**
   * Gets the color components as an array
   * @returns Array of [r, g, b, a] values (0-255)
   */
  public toArray(): number[] {
    return [this._r, this._g, this._b, this._a];
  }

  /**
   * Gets the color components as normalized floats
   * @returns Array of [r, g, b, a] values (0.0-1.0)
   */
  public toFloatArray(): number[] {
    return [this._r / 255.0, this._g / 255.0, this._b / 255.0, this._a / 255.0];
  }

  /**
   * Gets color as WebGL-compatible Float32Array
   * @returns Float32Array of [r, g, b, a] values (0.0-1.0)
   */
  public toFloat32Array(): Float32Array {
    return new Float32Array(this.toFloatArray());
  }

  /**
   * Creates a white color (255, 255, 255, 255)
   * @returns New Color instance representing white
   */
  public static white(): Color {
    return new Color(255, 255, 255, 255);
  }

  /**
   * Creates a black color (0, 0, 0, 255)
   * @returns New Color instance representing black
   */
  public static black(): Color {
    return new Color(0, 0, 0, 255);
  }

  /**
   * Creates a red color (255, 0, 0, 255)
   * @returns New Color instance representing red
   */
  public static red(): Color {
    return new Color(255, 0, 0, 255);
  }

  /**
   * Creates a green color (0, 255, 0, 255)
   * @returns New Color instance representing green
   */
  public static green(): Color {
    return new Color(0, 255, 0, 255);
  }

  /**
   * Creates a blue color (0, 0, 255, 255)
   * @returns New Color instance representing blue
   */
  public static blue(): Color {
    return new Color(0, 0, 255, 255);
  }
}
