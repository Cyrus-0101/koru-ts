import { Vector2 } from "../../math/vector2";
import type { IShape2D } from "./IShape2D";
import { Rectangle2D } from "./rectangle2d";

/**
 * Circle2D - Represents a 2D circle for collision detection
 *
 * Features:
 * - Position and origin alignment
 * - Radius-based shape definition
 * - Intersection checks with other shapes (rectangles, circles)
 * - Point-in-shape testing
 */
export class Circle2D implements IShape2D {
  /**
   * Center position of the circle in world space
   */
  public position: Vector2 = Vector2.zero;

  /**
   * Origin point within the circle (0,0) = center, (1,1) = bottom-right
   */
  public origin: Vector2 = Vector2.zero;

  /**
   * Radius of the circle in units
   */
  public radius!: number;

  /**
   * Gets the offset vector based on origin and radius
   * Useful for aligning shapes relative to an object's transform
   */
  public get offset(): Vector2 {
    return new Vector2(
      this.radius + this.radius * this.origin.x,
      this.radius + this.radius * this.origin.y
    );
  }

  /**
   * Initializes circle properties from JSON configuration
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

    if (json.radius === undefined) {
      throw new Error(`Circle2D requires 'radius' to be present.`);
    }

    this.radius = Number(json.radius);
  }

  /**
   * Checks for intersection with another shape
   * Supports:
   * - Circle2D (circle-to-circle distance check)
   * - Rectangle2D (closest-point-to-circle test)
   *
   * @param other Shape to test against
   * @returns True if shapes intersect
   */
  public intersects(other: IShape2D): boolean {
    if (other instanceof Circle2D) {
      // Circle-to-circle collision using distance formula
      let distance = Math.abs(Vector2.distance(other.position, this.position));
      let radiusLength = this.radius + other.radius;

      return distance <= radiusLength;
    }

    if (other instanceof Rectangle2D) {
      // Closest point on rectangle to circle center
      let closestX = Math.max(
        other.position.x,
        Math.min(this.position.x, other.position.x + other.width)
      );
      let closestY = Math.max(
        other.position.y,
        Math.min(this.position.y, other.position.y + other.height)
      );

      // Compute distance between circle center and closest edge point
      let deltaX = this.position.x - closestX;
      let deltaY = this.position.y - closestY;

      return deltaX * deltaX + deltaY * deltaY < this.radius * this.radius;
    }

    return false;
  }

  /**
   * Determines whether a given point lies inside the circle
   * @param point The point to test
   * @returns True if point is inside the circle
   */
  public pointInShape(point: Vector2): boolean {
    // Calculate distance between point and circle center
    let absDistance = Math.abs(Vector2.distance(this.position, point));

    // Return true if distance is less than or equal to the radius
    return absDistance <= this.radius;
  }
}
