import { AssetManager } from "./assetManager";
import type { IAsset } from "./IAsset";
import type { IAssetLoader } from "./IAssetLoader";

/**
 * ImageAsset - Represents a loaded image resource
 *
 * Features:
 * - Image data storage
 * - Dimension access
 * - Asset interface implementation
 *
 * Usage:
 * ```typescript
 * const asset = new ImageAsset("player.png", imageElement);
 * const width = asset.width;  // Get image width
 * ```
 */
export class ImageAsset implements IAsset {
  /** Asset identifier */
  public readonly name: string;

  /** Loaded image data */
  public readonly data: HTMLImageElement;

  /**
   * Creates new image asset
   * @param name Unique asset identifier
   * @param data Loaded image element
   */
  public constructor(name: string, data: HTMLImageElement) {
    this.name = name;
    this.data = data;
  }

  /** Gets image width in pixels */
  public get width(): number {
    return this.data.width;
  }

  /** Gets image height in pixels */
  public get height(): number {
    return this.data.height;
  }
}

/**
 * ImageAssetLoader - Handles loading of image assets
 *
 * Features:
 * - Async image loading
 * - Multiple format support
 * - Asset manager integration
 *
 * Usage:
 * ```typescript
 * const loader = new ImageAssetLoader();
 * loader.loadAsset("assets/player.png");
 * ```
 */
export class ImageAssetLoader implements IAssetLoader {
  /**
   * Gets supported file extensions
   * @returns Array of supported extensions
   */
  public get supportedExtensions(): string[] {
    return ["png", "gif", "jpg"];
  }

  /**
   * Starts async image loading
   * @param assetName Path to image file
   */
  public loadAsset(assetName: string): void {
    let image: HTMLImageElement = new Image();
    image.onload = this.onImageLoaded.bind(this, assetName, image);
    image.src = assetName;
  }

  /**
   * Handles image load completion
   * Creates asset and notifies manager
   * @param assetName Original asset path
   * @param image Loaded image element
   */
  private onImageLoaded(assetName: string, image: HTMLImageElement) {
    console.log(`LOG: onImageLoaded: assetName/image, ${assetName} ${image}`);
    let asset = new ImageAsset(assetName, image);
    AssetManager.onAssetLoaded(asset);
  }
}
