/**
 * Matrix4x4 - Handles 4x4 matrix operations for 3D transformations
 *
 * Matrix Layout (Column-Major Order):
 * [
 *   m00, m01, m02, m03,  // Column 1
 *   m10, m11, m12, m13,  // Column 2
 *   m20, m21, m22, m23,  // Column 3
 *   m30, m31, m32, m33   // Column 4
 * ]
 *
 * Common Uses:
 * - Projection matrices (perspective, orthographic)
 * - View matrices (camera transformations)
 * - Model matrices (object transformations)
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
    m._data[14] = (farClip + nearClip) * nf; // Translate Z

    return m;
  }
}
