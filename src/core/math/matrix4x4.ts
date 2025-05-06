import type { Vector3 } from "./vector3";

/**
 * Matrix4x4 - Handles 4x4 matrix operations for 2D/3D transformations
 *
 * Features:
 * - Translation, rotation, and scale operations
 * - Orthographic projection for 2D rendering
 * - Matrix multiplication
 * - WebGL-compatible data format
 *
 * Memory Layout (Column-Major):
 * ```sh
 * [
 *   m00, m01, m02, m03,  // Column 1
 *   m10, m11, m12, m13,  // Column 2
 *   m20, m21, m22, m23,  // Column 3
 *   m30, m31, m32, m33   // Column 4
 * ]
 * ```
 */
export class Matrix4x4 {
  /**
   * Internal array storing matrix values in column-major order
   * For perspective projection:
   * [
   *   (2n)/(r-l),      0,            (r+l)/(r-l),     0,
   *        0,     (2n)/(t-b),        (t+b)/(t-b),     0,
   *        0,          0,        -(f+n)/(f-n),   -(2fn)/(f-n),
   *        0,          0,              -1,            0
   * ]
   *
   * Where:
   * n = near plane distance
   * f = far plane distance
   * l = left plane
   * r = right plane
   * t = top plane
   * b = bottom plane
   */
  private _data: number[] = [];

  /**
   * Creates a new Matrix4x4 initialized as identity matrix
   * [
   *   1, 0, 0, 0,
   *   0, 1, 0, 0,
   *   0, 0, 1, 0,
   *   0, 0, 0, 1
   * ]
   */
  private constructor() {
    // Identity Matrix
    this._data = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }

  /**
   * Returns the raw matrix data in column-major order
   * Used for sending to shader uniforms
   */
  public get data(): number[] {
    return this._data;
  }

  /**
   * Creates and returns an identity matrix
   * Used as base for other transformations
   */
  public static identity(): Matrix4x4 {
    return new Matrix4x4();
  }

  /**
   * Creates an orthographic projection matrix
   *
   * Orthographic Matrix Structure:
   * [
   *   2/(r-l),    0,         0,        -(r+l)/(r-l),
   *      0,    2/(t-b),      0,        -(t+b)/(t-b),
   *      0,       0,     2/(n-f),      -(f+n)/(n-f),
   *      0,       0,         0,             1
   * ]
   *
   * Used for:
   * - 2D rendering
   * - UI elements
   * - Isometric views
   * - Technical drawings
   *
   * Example Usage:
   * ```typescript
   * // For a 1920x1080 screen:
   * let ortho = Matrix4x4.orthographic(0, 1920, 0, 1080, -1, 1);
   * ```
   *
   * @param left Left clipping plane (usually 0)
   * @param right Right clipping plane (usually screen width)
   * @param bottom Bottom clipping plane (usually 0)
   * @param top Top clipping plane (usually screen height)
   * @param nearClip Near clipping plane (negative value)
   * @param farClip Far clipping plane (positive value)
   * @returns New Matrix4x4 configured as orthographic projection
   */
  public static orthographic(
    left: number,
    right: number,
    bottom: number,
    top: number,
    nearClip: number,
    farClip: number
  ): Matrix4x4 {
    let m = new Matrix4x4();

    // Calculate reciprocals for efficiency
    let lr: number = 1.0 / (left - right); // 1/(left-right)
    let bt: number = 1.0 / (bottom - top); // 1/(bottom-top)
    let nf: number = 1.0 / (nearClip - farClip); // 1/(near-far)

    // Set matrix elements (column-major order)
    // Scale X
    m._data[0] = -2.0 * lr;

    // Scale Y
    m._data[5] = -2.0 * bt;

    // Scale Z
    m._data[10] = 2.0 * nf;

    // Translate X
    m._data[12] = (left + right) * lr;

    // Translate Y
    m._data[13] = (top + bottom) * bt;

    // Translate Z
    m._data[14] = (farClip + nearClip) * nf;

    return m;
  }

  /**
   * Creates a translation matrix from a Vector3 position
   *
   * Translation Matrix Structure:
   * [
   *   1, 0, 0, x,  // x = position.x
   *   0, 1, 0, y,  // y = position.y
   *   0, 0, 1, z,  // z = position.z
   *   0, 0, 0, 1
   * ]
   *
   * Used for:
   * - Moving objects in 3D space
   * - Positioning sprites
   * - Offsetting geometry
   *
   * Note: In column-major order, translation values are stored in:
   * - m._data[12] for X translation
   * - m._data[13] for Y translation
   * - m._data[14] for Z translation
   *
   * @param position Vector3 containing the translation values
   * @returns New Matrix4x4 configured for translation
   */
  public static translation(position: Vector3): Matrix4x4 {
    let m = new Matrix4x4();

    // X translation
    m._data[12] = position.x;

    // Y translation
    m._data[13] = position.y;

    // Z translation
    m._data[14] = position.z;

    return m;
  }

  // Radians range is 0 to pi, a full rotation is 2.pi

  /**
   * Creates rotation matrix around X axis
   * @param angleInRadians Rotation angle in radians
   * @returns New rotation matrix
   */
  public static rotationX(angleInRadians: number): Matrix4x4 {
    let m = new Matrix4x4();

    let c = Math.cos(angleInRadians);
    let s = Math.sin(angleInRadians);

    m._data[5] = c;
    m._data[6] = s;
    m._data[9] = -s;
    m._data[10] = c;

    return m;
  }

  /**
   * Creates rotation matrix around Y axis
   * @param angleInRadians Rotation angle in radians
   * @returns New rotation matrix
   */
  public static rotationY(angleInRadians: number): Matrix4x4 {
    let m = new Matrix4x4();

    let c = Math.cos(angleInRadians);
    let s = Math.sin(angleInRadians);

    m._data[0] = c;
    m._data[2] = -s;
    m._data[8] = s;
    m._data[10] = c;

    return m;
  }

  /**
   * Creates rotation matrix around Z axis
   * Used primarily for 2D sprite rotation
   *
   * @param angleInRadians Rotation angle in radians (0 to 2π)
   * @returns New rotation matrix
   */
  public static rotationZ(angleInRadians: number): Matrix4x4 {
    let m = new Matrix4x4();

    // The cosine of the angle in radians
    let c = Math.cos(angleInRadians);

    // The sine of the angle in radians
    let s = Math.sin(angleInRadians);

    m._data[0] = c;
    m._data[1] = s;
    m._data[5] = -s;
    m._data[6] = c;

    return m;
  }

  /**
   * Creates combined XYZ rotation matrix
   * Order: Z * Y * X (applied right to left)
   *
   * @param xRadians X-axis rotation in radians
   * @param yRadians Y-axis rotation in radians
   * @param zRadians Z-axis rotation in radians
   * @returns Combined rotation matrix
   */
  public static rotationXYZ(
    xRadians: number,
    yRadians: number,
    zRadians: number
  ): Matrix4x4 {
    let rx = Matrix4x4.rotationX(xRadians);
    let ry = Matrix4x4.rotationY(yRadians);
    let rz = Matrix4x4.rotationZ(zRadians);

    // ZYX
    return Matrix4x4.multiply(Matrix4x4.multiply(rz, ry), rx);
  }

  /**
   * Creates scale transformation matrix
   * @param scale Vector3 containing scale factors
   * @returns New scale matrix
   */
  public static scale(scale: Vector3): Matrix4x4 {
    let m = new Matrix4x4();

    m._data[0] = scale.x;
    m._data[5] = scale.y;
    m._data[10] = scale.z;

    return m;
  }

  /**
   * Multiplies two matrices (a * b)
   * Used to combine transformations
   *
   * @param a First matrix (applied second)
   * @param b Second matrix (applied first)
   * @returns New matrix containing combined transformation
   */
  public static multiply(a: Matrix4x4, b: Matrix4x4): Matrix4x4 {
    let m = new Matrix4x4();

    let b00 = b._data[0 * 4 + 0];
    let b01 = b._data[0 * 4 + 1];
    let b02 = b._data[0 * 4 + 2];
    let b03 = b._data[0 * 4 + 3];
    let b10 = b._data[1 * 4 + 0];
    let b11 = b._data[1 * 4 + 1];
    let b12 = b._data[1 * 4 + 2];
    let b13 = b._data[1 * 4 + 3];
    let b20 = b._data[2 * 4 + 0];
    let b21 = b._data[2 * 4 + 1];
    let b22 = b._data[2 * 4 + 2];
    let b23 = b._data[2 * 4 + 3];
    let b30 = b._data[3 * 4 + 0];
    let b31 = b._data[3 * 4 + 1];
    let b32 = b._data[3 * 4 + 2];
    let b33 = b._data[3 * 4 + 3];
    let a00 = a._data[0 * 4 + 0];
    let a01 = a._data[0 * 4 + 1];
    let a02 = a._data[0 * 4 + 2];
    let a03 = a._data[0 * 4 + 3];
    let a10 = a._data[1 * 4 + 0];
    let a11 = a._data[1 * 4 + 1];
    let a12 = a._data[1 * 4 + 2];
    let a13 = a._data[1 * 4 + 3];
    let a20 = a._data[2 * 4 + 0];
    let a21 = a._data[2 * 4 + 1];
    let a22 = a._data[2 * 4 + 2];
    let a23 = a._data[2 * 4 + 3];
    let a30 = a._data[3 * 4 + 0];
    let a31 = a._data[3 * 4 + 1];
    let a32 = a._data[3 * 4 + 2];
    let a33 = a._data[3 * 4 + 3];

    m._data[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
    m._data[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
    m._data[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
    m._data[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
    m._data[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
    m._data[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
    m._data[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
    m._data[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
    m._data[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
    m._data[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
    m._data[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
    m._data[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
    m._data[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
    m._data[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
    m._data[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
    m._data[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

    return m;
  }

  /**
   * Converts matrix data to a Float32Array()
   * @returns new FLoat32Array data of this matrix
   */
  public toFloat32Array(): Float32Array {
    return new Float32Array(this._data);
  }

  /**
   * Copies values from another matrix
   * @param m Source matrix to copy from
   */
  public copyFrom(m: Matrix4x4): void {
    for (let i = 0; i < 16; ++i) {
      this._data[i] = m._data[i];
    }
  }
}
