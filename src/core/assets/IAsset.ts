/**
 * IAsset - Base interface for all loadable game assets
 *
 * Common asset types include:
 * - Textures (images)
 * - Audio files
 * - JSON data
 * - Shader source code
 * - 3D models
 *
 * Implementation Requirements:
 * - Assets must be immutable (readonly properties)
 * - Each asset needs a unique name
 * - Data can be of any type but should be documented
 *
 * Example Implementation:
 * ```typescript
 * class TextureAsset implements IAsset {
 *     readonly name: string;
 *     readonly data: WebGLTexture;
 *
 *     constructor(name: string, texture: WebGLTexture) {
 *         this.name = name;
 *         this.data = texture;
 *     }
 * }
 * ```
 */
export interface IAsset {
  /** Unique identifier for the asset */
  readonly name: string;

  /**
   * Asset data of any type
   * Implementations should specify concrete type
   */
  readonly data: any;
}
