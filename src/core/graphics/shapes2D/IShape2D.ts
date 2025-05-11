import type { Vector2 } from "../../math/vector2";

/**
 * IShape2D - Interface for shapes.
 * Defines position, origin, offset and other methods
 */
export interface IShape2D {
  position: Vector2;

  origin: Vector2;

  readonly offset: Vector2;

  setFromJson(json: any): void;

  intersects(other: IShape2D): boolean;

  pointInShape(point: Vector2): boolean;
}
