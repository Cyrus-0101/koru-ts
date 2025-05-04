import type { IAsset } from "./IAsset";

/**
 * IAssetLoader - Interface for implementing asset type-specific loaders
 *
 * Responsibilities:
 * - Load specific types of assets (images, audio, etc.)
 * - Validate file extensions
 * - Parse raw data into usable format
 * - Create and return IAsset instances
 *
 * Example Implementation:
 * ```typescript
 * class ImageLoader implements IAssetLoader {
 *     readonly supportedExtensions = ['.png', '.jpg', '.webp'];
 *
 *     loadAsset(assetName: string): IAsset {
 *         // Load image data
 *         // Create and return ImageAsset
 *     }
 * }
 * ```
 */
export interface IAssetLoader {
  /**
   * List of file extensions this loader can handle
   * Example: ['.png', '.jpg'] for image loader
   */
  readonly supportedExtensions: string[];

  /**
   * Loads an asset from the specified path/name
   * @param assetName Path or identifier of asset to load
   * @returns Loaded asset implementing IAsset interface
   * @throws Error if loading fails or asset type not supported
   */
  loadAsset(assetName: string): void;
}
