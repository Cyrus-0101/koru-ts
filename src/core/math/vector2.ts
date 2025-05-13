import { Vector3 } from "./vector3";

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
   * Creates a new Vector2
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

  /** Static method that returns a new Vector2 with default values = 0s */
  public static get zero(): Vector2 {
    return new Vector2();
  }

  /** Static method that returns a new Vector2(1, 1) */
  public static get one(): Vector2 {
    return new Vector2(1, 1);
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

  /**
   * Copies components from another Vector3
   * @param vector Source vector to copy values from
   * @example
   * vectorA.copyFrom(vectorB)
   */
  public copyFrom(vector: Vector2): void {
    this._x = vector._x;
    this._y = vector._y;
  }

  /**
   * Sets vector components from a JSON object
   * @param json Object containing x, y number values
   * @example
   * vector.setFromJson({ x: 1, y: 2 })
   */
  public setFromJson(json: any): void {
    if (json.x !== undefined) {
      this._x = Number(json.x);
    }

    if (json.y !== undefined) {
      this._y = Number(json.y);
    }
  }

  public set(x?: number, y?: number): void {
    if (x !== undefined) {
      this._x = x;
    }

    if (y !== undefined) {
      this._y = y;
    }
  }

  public toVector(): Vector3 {
    return new Vector3(this._x, this._y, 0);
  }

  /**
   * Adds another vector to this one (component-wise)
   * Modifies the current vector in place
   * @param v Vector to add
   * @returns This vector after addition
   */
  public add(v: Vector2): Vector2 {
    this._x += v._x;
    this._y += v._y;

    return this;
  }

  /**
   * Subtracts another vector from this one (component-wise)
   * Modifies the current vector in place
   * @param v Vector to subtract
   * @returns This vector after subtraction
   */
  public subtract(v: Vector2): Vector2 {
    this._x -= v._x;
    this._y -= v._y;

    return this;
  }

  /**
   * Multiplies this vector by another (component-wise)
   * Modifies the current vector in place
   * @param v Vector to multiply by
   * @returns This vector after multiplication
   */
  public multiply(v: Vector2): Vector2 {
    this._x *= v._x;
    this._y *= v._y;

    return this;
  }

  /**
   * Divides this vector by another (component-wise)
   * Modifies the current vector in place
   * @param v Vector to divide by
   * @returns This vector after division
   */
  public divide(v: Vector2): Vector2 {
    this._x /= v._x;
    this._y /= v._y;

    return this;
  }

  public static distance(a: Vector2, b: Vector2): number {
    let diff = a.clone().subtract(b);

    return Math.sqrt(diff.x * diff.x + diff.y * diff.y);
  }

  /**
   * Clones a vector and returns a new one
   * @returns new Vector2 with cloned values
   */
  public clone(): Vector2 {
    return new Vector2(this._x, this._y);
  }

  public scale(scale: number): Vector2 {
    this._x *= scale;
    this._y *= scale;

    return this;
  }
}
