import type { Color } from "./color";
import type { Texture } from "./texture";
import { TextureManager } from "./textureManager";

/**
 * Material - Combines texture and color for sprite rendering
 *
 * Features:
 * - Diffuse texture management with reference counting
 * - Color tinting with WebGL compatibility
 * - Automatic resource cleanup
 * - Integration with TextureManager
 *
 * Usage:
 * ```typescript
 * // Create new material
 * const material = new Material(
 *   "wood",
 *   "assets/textures/wood.png",
 *   Color.white()
 * );
 * ```
 */
export class Material {
  /** Unique identifier for this material */
  private _name: string;

  /** Path/name of the diffuse texture */
  private _diffuseTextureName: string;

  /** Reference to the loaded diffuse texture */
  private _diffuseTexture!: Texture | undefined;

  /** Color tint applied to the material */
  private _tint: Color;

  /**
   * Creates a new material
   * @param name Unique identifier
   * @param diffuseTextureName Path/name of diffuse texture
   * @param tint Color tint to apply (default: white)
   */
  public constructor(name: string, diffuseTextureName: string, tint: Color) {
    this._name = name;
    this._diffuseTextureName = diffuseTextureName;
    this._tint = tint;

    if (this._diffuseTextureName !== undefined) {
      this._diffuseTexture = TextureManager.getTexture(
        this._diffuseTextureName
      );
    }
  }

  /** Gets material identifier */
  public get name(): string {
    return this._name;
  }

  /** Gets current diffuse texture name/path */
  public get diffuseTextureName(): string {
    return this._diffuseTextureName;
  }

  /** Gets current diffuse texture */
  public get diffuseTexture(): Texture | undefined {
    return this._diffuseTexture;
  }

  /** Gets current tint */
  public get tint(): Color {
    return this._tint;
  }

  /**
   * Sets new diffuse texture
   * - Releases previous texture reference
   * - Loads new texture through TextureManager
   * - Handles undefined textures gracefully
   *
   * @param value Path/name of new texture asset
   */
  public set diffuseTextureName(value: string) {
    if (this._diffuseTexture !== undefined) {
      TextureManager.releaseTexture(this._diffuseTextureName);
    }

    this._diffuseTextureName = value;

    if (this._diffuseTextureName !== undefined) {
      this._diffuseTexture = TextureManager.getTexture(
        this._diffuseTextureName
      );
    }
  }

  /**
   * Cleans up material resources
   * - Releases texture reference to TextureManager
   * - Clears texture references
   *
   * Called when:
   * - Material is destroyed
   * - Sprite using material is destroyed
   * - MaterialManager releases material
   */
  public destroy(): void {
    TextureManager.releaseTexture(this._diffuseTextureName);

    this._diffuseTexture = undefined;
  }
}
