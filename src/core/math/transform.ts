import { Matrix4x4 } from "./matrix4x4";
import { Vector3 } from "./vector3";

/**
 * Transform - Handles object transformations in 2D/3D space
 *
 * Features:
 * - Position tracking
 * - Rotation handling (Euler angles)
 * - Scale management
 * - Matrix transformation generation
 *
 * Usage:
 * ```typescript
 * const transform = new Transform();
 * transform.position.x = 100;
 * transform.rotation.z = Math.PI / 4; // 45 degrees
 * transform.scale.x = 2; // Double width
 * ```
 */
export class Transform {
  /** World space position */
  public position: Vector3 = Vector3.zero;

  /** Rotation in radians (Euler angles) */
  public rotation: Vector3 = Vector3.zero;

  /** Scale factors for each axis */
  public scale: Vector3 = Vector3.one;

  /**
   * Copies values from another transform
   * @param transform Source transform to copy from
   */
  public copyFrom(transform: Transform) {
    this.position.copyFrom(transform.position);
    this.rotation.copyFrom(transform.rotation);
    this.scale.copyFrom(transform.scale);
  }

  /**
   * Generates combined transformation matrix
   * Order: Scale -> Rotate -> Translate
   *
   * @returns Matrix4x4 containing all transformations
   */
  public getTransformationMatrix(): Matrix4x4 {
    let translation = Matrix4x4.translation(this.position);
    // TO-DO: Add x and y for 3D

    let rotation = Matrix4x4.rotationXYZ(
      this.rotation.x,
      this.rotation.y,
      this.rotation.z
    );
    let scale = Matrix4x4.scale(this.scale);

    // Order matters: (T * R) * S
    return Matrix4x4.multiply(Matrix4x4.multiply(translation, rotation), scale);
  }
}
