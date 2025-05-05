/**
 * Vector2 - Represents a 2D vector with x, y components
 *
 * Used for:
 * - 2D positions
 * - Screen coordinates
 * - Texture coordinates (UV)
 * - 2D velocities
 * - 2D forces
 */
export class Vector2 {
  /** X component of the vector */
  private _x: number;

  /** Y component of the vector */
  private _y: number;

  /**
   * Creates a new Vector3
   * @param x X component (default: 0)
   * @param y Y component (default: 0)
   */
  public constructor(x: number = 0, y: number = 0) {
    this._x = x;
    this._y = y;
  }

  /** Gets the x component */
  public get x(): number {
    return this._x;
  }

  /** Sets the x component */
  public set x(value: number) {
    this._x = value;
  }

  /** Gets the y component */
  public get y(): number {
    return this._y;
  }

  /** Sets the y component */
  public set y(value: number) {
    this._y = value;
  }

  /**
   * Converts vector to array format
   * Faster than accessing individual components through getters
   * Used for efficient data transfer to WebGL buffers
   * @returns Array containing [x, y, z] components
   */
  public toArray(): number[] {
    return [this._x, this._y];
  }

  /**
   * Converts vector to Float32Array format
   * Used for WebGL uniform uploads and attribute data
   * @returns Float32Array containing vector components
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
   */
  public toFloat32Array(): Float32Array {
    return new Float32Array(this.toArray());
  }
}
