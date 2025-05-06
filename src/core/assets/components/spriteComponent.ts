import type { Shader } from "../../gl/shaders";
import { Sprite } from "../../graphics/sprite";
import { BaseComponent } from "./baseComponent";

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
  public constructor(name: string, materialName: string) {
    super(name);

    this._sprite = new Sprite(name, materialName);
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
