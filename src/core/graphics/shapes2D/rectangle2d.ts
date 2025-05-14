import { Vector2 } from "../../math/vector2";
import { Circle2D } from "./circle2D";
import type { IShape2D } from "./IShape2D";

/**
 * Rectangle2D - Represents a 2D axis-aligned rectangle for collision detection
 *
 * Features:
 * - Position and origin alignment
 * - Width and height dimensions
 * - Intersection checks with other shapes (rectangles, circles)
 * - Point-in-shape testing
 */
export class Rectangle2D implements IShape2D {
  /**
   * Position of the rectangle's top-left corner in world space
   */
  public position: Vector2 = Vector2.zero;

  /**
   * Origin point within the rectangle (0,0) = top-left, (1,1) = bottom-right
   */
  public origin: Vector2 = Vector2.zero;

  /**
   * Width of the rectangle in units
   */
  public width!: number;

  /**
   * Height of the rectangle in units
   */
  public height!: number;

  /**
   * Gets the offset vector based on origin and size
   * Useful for aligning shapes relative to an object's transform
   */
  public get offset(): Vector2 {
    return new Vector2(this.width * this.origin.x, this.height * this.origin.y);
  }

  /**
   * Initializes rectangle properties from JSON configuration
   * @param json Source configuration data
   * @throws Error if required fields are missing
   */
  public setFromJson(json: any): void {
    if (json.position !== undefined) {
      this.position.setFromJson(json.position);
    }

    if (json.origin !== undefined) {
      this.origin.setFromJson(json.origin);
    }

    if (json.width === undefined) {
      throw new Error(`Rectangle2D requires 'width' to be present.`);
    }

    this.width = Number(json.width);

    if (json.height === undefined) {
      throw new Error(`Rectangle2D requires 'height' to be present.`);
    }

    this.height = Number(json.height);
  }

  /**
   * Checks for intersection with another shape
   * Supports:
   * - Rectangle2D (point-in-rectangle checks)
   * - Circle2D (closest-point-to-circle test)
   *
   * @param other Shape to test against
   * @returns True if shapes intersect
   */
  public intersects(other: IShape2D): boolean {
    if (other instanceof Rectangle2D) {
      // Test all four corners of the other rectangle
      return (
        this.pointInShape(other.position) ||
        this.pointInShape(
          new Vector2(other.position.x + other.width, other.position.y)
        ) ||
        this.pointInShape(
          new Vector2(
            other.position.x + other.width,
            other.position.y + other.height
          )
        ) ||
        this.pointInShape(
          new Vector2(other.position.x, other.position.y + other.height)
        )
      );
    }

    if (other instanceof Circle2D) {
      // Closest point on rectangle to circle center
      let closestX = Math.max(
        this.position.x,
        Math.min(other.position.x, this.position.x + this.width)
      );
      let closestY = Math.max(
        this.position.y,
        Math.min(other.position.y, this.position.y + this.height)
      );

      // Compute distance between circle center and closest edge point
      let deltaX = other.position.x - closestX;

      let deltaY = other.position.y - closestY;

      // If distance is less than radius, we have a collision
      return deltaX * deltaX + deltaY * deltaY < other.radius * other.radius;
    }

    return false;
  }

  /**
   * Determines whether a given point lies inside the rectangle
   * Handles negative dimensions correctly
   *
   * @param point The point to test
   * @returns True if point is inside the rectangle
   */
  public pointInShape(point: Vector2): boolean {
    // Normalize min/max coordinates for negative dimensions
    let x = this.width < 0 ? this.position.x - this.width : this.position.x;
    let y = this.height < 0 ? this.position.y - this.height : this.position.y;

    let extentX =
      this.width < 0 ? this.position.x : this.position.x + this.width;
    let extentY =
      this.height < 0 ? this.position.y : this.position.y + this.height;

    return (
      point.x >= x && point.x <= extentX && point.y >= y && point.y <= extentY
    );
  }
}
