import { Texture } from "./texture";

/**
 * TextureReferenceNode - Tracks texture usage and reference counting
 *
 * Used for:
 * - Managing texture lifetime
 * - Reference counting
 * - Automatic cleanup
 */
class TextureReferenceNode {
  /** The actual texture being referenced */
  public texture: Texture;

  /** Number of active references to this texture */
  public referenceCount: number = 1;

  /**
   * Creates a new reference node
   * @param texture The texture to track
   */
  public constructor(texture: Texture) {
    this.texture = texture;
  }
}

/**
 * TextureManager - Singleton manager for texture resources
 *
 * Features:
 * - Texture caching and reuse
 * - Reference counting
 * - Automatic resource cleanup
 * - Memory management
 *
 * Design Pattern: Singleton
 * All methods are static to ensure single point of texture management
 */
export class TextureManager {
  /** Map of texture names to reference nodes */
  private static _textures: { [name: string]: TextureReferenceNode } = {};

  /** Private constructor prevents instantiation */
  private constructor() {}

  /**
   * Gets or creates a texture by name
   * Increments reference count if texture exists
   *
   * @param textureName Path or identifier for the texture
   * @returns The requested texture
   */
  public static getTexture(textureName: string): Texture {
    if (TextureManager._textures[textureName] === undefined) {
      let texture = new Texture(textureName);

      TextureManager._textures[textureName] = new TextureReferenceNode(texture);
    } else {
      TextureManager._textures[textureName].referenceCount++;
    }

    return TextureManager._textures[textureName].texture;
  }

  /**
   * Releases a reference to a texture
   * Destroys texture when reference count reaches 0
   *
   * @param textureName Name of texture to release
   */
  public static releaseTexture(textureName: string): void {
    if (TextureManager._textures[textureName] === undefined) {
      console.warn(
        `WARN: A texture named '${textureName}' does not exist and cannot be released.`
      );
    } else {
      TextureManager._textures[textureName].referenceCount--;

      if (TextureManager._textures[textureName].referenceCount < 1) {
        TextureManager._textures[textureName].texture.destroy();

        delete TextureManager._textures[textureName];
      }
    }
  }
}
