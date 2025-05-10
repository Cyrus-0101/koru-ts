import type { Shader } from "../../gl/shaders";
import { Circle2D } from "../../graphics/shapes2D/circle2D";
import type { IShape2D } from "../../graphics/shapes2D/IShape2D";
import { Rectangle2D } from "../../graphics/shapes2D/rectangle2d";
import { BaseComponent } from "./baseComponent";
import type { IComponent } from "./IComponent";
import type { IComponentBuilder } from "./IComponentBuilder";
import type { IComponentData } from "./IComponentData";

/**
 * Component data for sprite configuration
 * Stores collision properties loaded from JSON
 *
 * Properties:
 * - name: Collision identifier
 * - materialName: Associated material name
 */
export class CollisionComponentData implements IComponentData {
  public name!: string;
  public shape!: IShape2D;

  public setFromJson(json: any): void {
    if (json.name !== undefined) {
      this.name = String(json.name);
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

      const shapeType = String(json.shape.type).toLowerCase();
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
 * Builder for creating collision components from JSON data
 * Handles deserialization of collision configuration
 *
 * @implements {IComponentBuilder}
 *
 * @example
 * const builder = new CollisionComponentBuilder();
 * const collision = builder.buildFromJson({
 *   name: "player",
 *   type: "collision",
 *   ...
 * });
 */
export class CollisionComponentBuilder implements IComponentBuilder {
  // Type that builder handles
  // Taking a section of data and constructing the component using the data
  public get type(): string {
    return "collision";
  }

  public buildFromJson(json: any): IComponent {
    let data = new CollisionComponentData();

    data.setFromJson(json);

    return new CollisionComponent(data);
  }
}

/**
 * CollisionComponent - Handles sprite rendering for game objects
 *
 * Features:
 * - Collision management
 *
 * Usage:
 * ```typescript
 * const shape = new CollisionComponent("circle2D");
 * gameObject.addComponent(shape);
 * ```
 */
export class CollisionComponent extends BaseComponent {
  /** Managed shape instance */
  private _shape: IShape2D;

  /**
   * Creates new collision component
   * @param name Component identifier
   * @param materialName Name of material to use for collision
   */
  public constructor(data: CollisionComponentData) {
    super(data);

    this._shape = data.shape;
  }

  /** Gets managed shape instance */
  public get shape(): IShape2D {
    return this._shape;
  }

  /**
   * Render debug function
   * @param shader Shader to use for rendering
   */
  public render(shader: Shader): void {
    // this._sprite.draw(shader, this.owner.worldMatrix);

    // Render parent content
    super.render(shader);
  }
}
