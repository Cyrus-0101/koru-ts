import type { Shader } from "../gl/shaders";
import { AnimatedSprite } from "../graphics/animatedSprite";
import { Sprite } from "../graphics/sprite";
import { BaseComponent } from "./baseComponent";
import type { IComponent } from "./IComponent";
import type { IComponentBuilder } from "./IComponentBuilder";
import type { IComponentData } from "./IComponentData";
import { SpriteComponentData } from "./spriteComponent";

/**
 * Component data for animated sprite configuration
 * Stores animated sprite properties loaded from JSON
 *
 * Properties:
 * - name: Sprite identifier
 * - materialName: Associated material name
 */
export class AnimatedSpriteComponentData
  extends SpriteComponentData
  implements IComponentData
{
  public frameWidth!: number;
  public frameHeight!: number;
  public frameCount!: number;
  public frameSequence: number[] = [];
  public autoPlay: boolean = true;

  public setFromJson(json: any): void {
    super.setFromJson(json);

    if (json.autoPlay !== undefined) {
      this.autoPlay = Boolean(json.autoPlay);
    }

    if (json.frameWidth === undefined) {
      throw new Error(
        `ERROR: AnimatedSpriteComponentData required 'frameWidth' to be defined`
      );
    } else {
      this.frameWidth = Number(json.frameWidth);
    }

    if (json.frameHeight === undefined) {
      throw new Error(
        `ERROR: AnimatedSpriteComponentData required 'frameHeight' to be defined`
      );
    } else {
      this.frameHeight = Number(json.frameHeight);
    }

    if (json.frameCount === undefined) {
      throw new Error(
        `ERROR: AnimatedSpriteComponentData required 'frameCount' to be defined`
      );
    } else {
      this.frameCount = Number(json.frameCount);
    }

    if (json.frameSequence === undefined) {
      throw new Error(
        `ERROR: AnimatedSpriteComponentData required 'frameSequence' to be defined`
      );
    } else {
      this.frameSequence = json.frameSequence;
    }
  }
}

/**
 * Builder for creating animated sprite components from JSON data
 * Handles deserialization of animated sprite configuration
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
export class AnimatedSpriteComponentBuilder implements IComponentBuilder {
  // Type that builder handles
  // Taking a section of data and constructing the component using the data
  public get type(): string {
    return "animatedSprite";
  }

  public buildFromJson(json: any): IComponent {
    let data = new AnimatedSpriteComponentData();

    data.setFromJson(json);

    return new AnimatedSpriteComponent(data);
  }
}

/**
 * AnimatedSpriteComponent - Handles animated sprite rendering for game objects
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
export class AnimatedSpriteComponent extends BaseComponent {
  /** Managed sprite instance */
  private _sprite: AnimatedSprite;

  /**
   * Creates new sprite component
   * @param name Component identifier
   * @param materialName Name of material to use for sprite
   */
  public constructor(data: AnimatedSpriteComponentData) {
    super(data);

    this._sprite = new AnimatedSprite(
      data.name,
      data.materialName,
      data.frameWidth,
      data.frameHeight,
      data.frameWidth,
      data.frameHeight,
      data.frameCount,
      data.frameSequence
    );
  }

  /**
   * Loads sprite resources
   * Called when owner object loads
   */
  public load(): void {
    this._sprite.load();
  }

  public update(time: number): void {
    this._sprite.update(time);

    super.update(time);
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
