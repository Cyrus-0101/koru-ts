import type { Shader } from "../gl/shaders";
import { Sprite } from "../graphics/sprite";
import { Vector3 } from "../math/vector3";
import { BaseComponent } from "./baseComponent";
import { ComponentManager } from "./componentManager";
import type { IComponent } from "./IComponent";
import type { IComponentBuilder } from "./IComponentBuilder";
import type { IComponentData } from "./IComponentData";

/**
 * Component data for sprite configuration
 * Stores sprite properties loaded from JSON
 *
 * Properties:
 * - name: Sprite identifier
 * - materialName: Associated material name
 */
export class SpriteComponentData implements IComponentData {
  public name!: string;
  public materialName!: string;
  public origin: Vector3 = Vector3.zero;

  public setFromJson(json: any): void {
    if (json.name !== undefined) {
      this.name = String(json.name);
    }

    if (json.materialName !== undefined) {
      this.materialName = String(json.materialName);
    }

    if (json.origin !== undefined) {
      this.origin.setFromJson(json.origin);
    }
  }
}

/**
 * Builder for creating sprite components from JSON data
 * Handles deserialization of sprite configuration
 *
 * @implements {IComponentBuilder}
 *
 * @example
 * const builder = new SpriteComponentBuilder();
 * const sprite = builder.buildFromJson({
 *   name: "player",
 *   materialName: "playerMaterial"
 * });
 */
export class SpriteComponentBuilder implements IComponentBuilder {
  // Type that builder handles
  // Taking a section of data and constructing the component using the data
  public get type(): string {
    return "sprite";
  }

  public buildFromJson(json: any): IComponent {
    let data = new SpriteComponentData();

    data.setFromJson(json);

    return new Spritecomponent(data);
  }
}

/**
 * SpriteComponent - Handles sprite rendering for game objects
 *
 * Features:
 * - Sprite management
 * - Material integration
 * - Automatic resource loading
 * - Shader-based rendering
 *
 * Usage:
 * ```typescript
 * const sprite = new SpriteComponent("player", "playerMaterial");
 * gameObject.addComponent(sprite);
 * ```
 */
export class Spritecomponent extends BaseComponent {
  /** Managed sprite instance */
  private _sprite: Sprite;

  /**
   * Creates new sprite component
   * @param name Component identifier
   * @param materialName Name of material to use for sprite
   */
  public constructor(data: SpriteComponentData) {
    super(data);

    this._sprite = new Sprite(data.name, data.materialName);

    // Only check when origin is not default
    if (!data.origin.equals(Vector3.zero)) {
      this._sprite.origin.copyFrom(data.origin);
    }
  }

  /**
   * Loads sprite resources
   * Called when owner object loads
   */
  public load(): void {
    this._sprite.load();
  }

  /**
   * Renders sprite using provided shader
   * @param shader Shader to use for rendering
   */
  public render(shader: Shader): void {
    // Draw sprite
    this._sprite.draw(shader, this.owner.worldMatrix);

    // Render parent content
    super.render(shader);
  }

  /** Gets managed sprite instance */
  public get sprite(): Sprite {
    return this._sprite;
  }
}
