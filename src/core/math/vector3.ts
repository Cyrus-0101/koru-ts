import { Vector2 } from "./vector2";

/**
 * Vector3 - Represents a 3D vector with x, y, z components
 * Used for:
 * - 3D positions
 * - Directions
 * - Velocities
 * - Forces
 * - Scaling
 */
export class Vector3 {
  /** X component of the vector */
  private _x: number;

  /** Y component of the vector */
  private _y: number;

  /** Z component of the vector */
  private _z: number;

  /**
   * Creates a new Vector3
   * @param x X component (default: 0)
   * @param y Y component (default: 0)
   * @param z Z component (default: 0)
   */
  public constructor(x: number = 0, y: number = 0, z: number = 0) {
    this._x = x;
    this._y = y;
    this._z = z;
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

  /** Gets the z component */
  public get z(): number {
    return this._z;
  }

  /** Sets the z component */
  public set z(value: number) {
    this._z = value;
  }

  public static get zero(): Vector3 {
    return new Vector3();
  }

  public static get one(): Vector3 {
    return new Vector3(1, 1, 1);
  }

  /**
   * Converts vector to array format
   * Faster than accessing individual components through getters
   * Used for efficient data transfer to WebGL buffers
   * @returns Array containing [x, y, z] components
   */
  public toArray(): number[] {
    return [this._x, this._y, this._z];
  }

  public set(x?: number, y?: number, z?: number): void {
    if (x !== undefined) {
      this._x = x;
    }

    if (y !== undefined) {
      this._y = y;
    }

    if (z !== undefined) {
      this._z = z;
    }
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
  public copyFrom(vector: Vector3): void {
    this._x = vector._x;
    this._y = vector._y;
    this._z = vector._z;
  }

  /**
   * Sets vector components from a JSON object
   * @param json Object containing x, y, z number values
   * @example
   * vector.setFromJson({ x: 1, y: 2, z: 3 })
   */
  public setFromJson(json: any): void {
    if (json.x !== undefined) {
      this._x = Number(json.x);
    }

    if (json.y !== undefined) {
      this._y = Number(json.y);
    }

    if (json.z !== undefined) {
      this._z = Number(json.z);
    }
  }

  /**
   * Adds another vector to this one (component-wise)
   * Modifies the current vector in place
   * @param v Vector to add
   * @returns This vector after addition
   */
  public add(v: Vector3): Vector3 {
    this._x += v._x;
    this._y += v._y;
    this._z += v._z;

    return this;
  }

  /**
   * Subtracts another vector from this one (component-wise)
   * Modifies the current vector in place
   * @param v Vector to subtract
   * @returns This vector after subtraction
   */
  public subtract(v: Vector3): Vector3 {
    this._x -= v._x;
    this._y -= v._y;
    this._z -= v._z;

    return this;
  }

  /**
   * Multiplies this vector by another (component-wise)
   * Modifies the current vector in place
   * @param v Vector to multiply by
   * @returns This vector after multiplication
   */
  public multiply(v: Vector3): Vector3 {
    this._x *= v._x;
    this._y *= v._y;
    this._z *= v._z;

    return this;
  }

  /**
   * Divides this vector by another (component-wise)
   * Modifies the current vector in place
   * @param v Vector to divide by
   * @returns This vector after division
   */
  public divide(v: Vector3): Vector3 {
    this._x /= v._x;
    this._y /= v._y;
    this._z /= v._z;

    return this;
  }

  /**
   * Checks if this vector is equal to another (component-wise)
   * Returns true if all are true and false if any one is different
   * @param v Vector to check equality for
   * @returns true or false
   */
  public equals(v: Vector3): boolean {
    return this._x == v._x && this._y == v._y && this._z == v._z;
  }

  public static distance(a: Vector3, b: Vector3): number {
    let diff = a.subtract(b);

    return Math.sqrt(diff.x * diff.x + diff._y * diff.y + diff.z * diff.z);
  }

  /**
   * Clones a vector and returns a new one
   * @returns new Vector2 with cloned values
   */
  public clone(): Vector3 {
    return new Vector3(this._x, this._y, this._z);
  }

  /**
   * Hacky method to convert a Vector3 to Vector2 with x and y values passed
   * @returns new Vector2 with x,y values
   */
  public toVector2(): Vector2 {
    return new Vector2(this._x, this._y);
  }
}
