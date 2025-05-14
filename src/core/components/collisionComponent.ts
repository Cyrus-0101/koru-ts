import { CollisionManager } from "../collision/collisionManager";
import type { Shader } from "../gl/shaders";
import { Circle2D } from "../graphics/shapes2D/circle2D";
import type { IShape2D } from "../graphics/shapes2D/IShape2D";
import { Rectangle2D } from "../graphics/shapes2D/rectangle2d";
import { BaseComponent } from "./baseComponent";
import type { IComponent } from "./IComponent";
import type { IComponentBuilder } from "./IComponentBuilder";
import type { IComponentData } from "./IComponentData";

/**
 * CollisionComponentData - Configuration data for collision component
 *
 * Stores collision properties loaded from JSON.
 *
 * Properties:
 * - name: Unique identifier for this collision component
 * - shape: Reference to a 2D shape (Rectangle2D or Circle2D)
 * - static: Whether the object is static (does not move)
 */
export class CollisionComponentData implements IComponentData {
  public name!: string;
  public shape!: IShape2D;
  public static: boolean = true;

  /**
   * Loads configuration from JSON
   * @param json Source configuration data
   * @throws Error if required fields are missing
   */
  public setFromJson(json: any): void {
    if (json.name !== undefined) {
      this.name = String(json.name);
    }

    if (json.static !== undefined) {
      this.static = Boolean(json.static);
    }

    if (json.shape === undefined) {
      throw new Error(
        `ERROR: CollisionComponentData requries 'shape', to be present `
      );
    } else {
      if (json.shape.type === undefined) {
        throw new Error(
          `ERROR: CollisionComponentData requires 'shape.type', to be present`
        );
      }

      let shapeType = String(json.shape.type).toLowerCase();

      switch (shapeType) {
        case "rectangle":
          this.shape = new Rectangle2D();

          break;

        case "circle":
          this.shape = new Circle2D();

          break;

        default:
          throw new Error(`ERROR: Unsupported shape.type, '${shapeType}'`);
      }
    }

    this.shape.setFromJson(json.shape);
  }
}

/**
 * CollisionComponentBuilder - Constructs collision components from JSON
 *
 * Implements:
 * - IComponentBuilder interface
 *
 * Usage:
 * ```typescript
 * const builder = new CollisionComponentBuilder();
 * const component = builder.buildFromJson({
 *   name: "playerCollision",
 *   type: "collision",
 *   shape: {
 *     type: "circle",
 *     radius: 10
 *   }
 * });
 * ```
 */
export class CollisionComponentBuilder implements IComponentBuilder {
  /** @returns "collision" type identifier */
  public get type(): string {
    return "collision";
  }

  /**
   * Constructs a collision component from JSON config
   * @param json Configuration data
   * @returns New CollisionComponent instance
   */
  public buildFromJson(json: any): IComponent {
    let data = new CollisionComponentData();

    data.setFromJson(json);

    return new CollisionComponent(data);
  }
}

/**
 * CollisionComponent - Handles physics and collision detection for game objects
 *
 * Features:
 * - Manages collision shapes (rectangles, circles)
 * - Registers with global collision manager
 * - Tracks position relative to owner
 * - Provides hooks for entry/update/exit events
 *
 * Usage:
 * ```typescript
 * const comp = new CollisionComponent(data);
 * comp.onCollisionEntry(other);
 * ```
 */
export class CollisionComponent extends BaseComponent {
  /** Managed shape instance used for collision detection */
  private _shape: IShape2D;

  /** Flag indicating whether this component is static (non-moving) */
  private _static: boolean;

  /**
   * Creates a new collision component
   * @param data Configuration data
   */
  public constructor(data: CollisionComponentData) {
    super(data);

    this._shape = data.shape;
    this._static = data.static;
  }

  /**
   * Gets the managed shape instance
   * @returns Shape used for collision detection
   */
  public get shape(): IShape2D {
    return this._shape;
  }

  /**
   * Gets whether this component is static
   * @returns True if component does not move
   */
  public get isStatic(): boolean {
    return this._static;
  }

  /**
   * Called when component is loaded into the scene
   */
  public load(): void {
    super.load();

    // Position shape based on owner's world position
    this._shape.position.copyFrom(
      this.owner.getWorldPosition().toVector2().subtract(this._shape.offset)
    );

    // Register with global collision manager
    CollisionManager.registerCollisionComponent(this);
  }

  /**
   * Updates shape position each frame
   * @param time Current engine time in milliseconds
   */
  public update(time: number): void {
    this._shape.position.copyFrom(
      this.owner.getWorldPosition().toVector2().subtract(this._shape.offset)
    );

    super.update(time);
  }

  /**
   * Render debug visualization of the collision shape
   * @param shader Shader to use for rendering
   */
  public render(shader: Shader): void {
    // Debug drawing would go here

    // Render parent content
    super.render(shader);
  }

  /**
   * Called when a collision starts
   * @param other Colliding component
   */
  public onCollisionEntry(other: CollisionComponent): void {
    // console.log("onCollisionEntry", this, other);
    // Optional override point
  }

  /**
   * Called while a collision is ongoing
   * @param other Colliding component
   */
  public onCollisionUpdate(other: CollisionComponent): void {
    // console.log("onCollisionUpdate", this, other);
    // Optional override point
  }

  /**
   * Called when a collision ends
   * @param other Colliding component
   */
  public onCollisionExit(other: CollisionComponent): void {
    // console.log("onCollisionExit", this, other);
    // Optional override point
  }
}
