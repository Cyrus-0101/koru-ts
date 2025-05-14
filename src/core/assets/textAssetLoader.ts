import { AssetManager } from "./assetManager";
import type { IAsset } from "./IAsset";
import type { IAssetLoader } from "./IAssetLoader";

/**
 * TextAsset - Represents a loaded Text resource
 *
 * Features:
 * - Font text data storage
 * - Asset interface implementation
 * - Type-safe data access
 *
 * Usage:
 * ```typescript
 * const asset = new TextAsset("text.txt", textData);
 * const data = asset.data;  // Access parsed Text
 * ```
 */
export class TextAsset implements IAsset {
  /** Asset identifier */
  public readonly name: string;

  /** Parsed Text data */
  public readonly data: string;

  /**
   * Creates new Text asset
   * @param name Unique asset identifier
   * @param data Parsed string text data
   */
  public constructor(name: string, data: string) {
    this.name = name;
    this.data = data;
  }
}

/**
 * TextAssetLoader - Handles loading of text assets
 *
 * Features:
 * - Async text loading
 * - Text format support
 * - Asset manager integration
 *
 * Usage:
 * ```typescript
 * const loader = new TextAssetLoader();
 * loader.loadAsset("assets/testZone.txt");
 * ```
 */
export class TextAssetLoader implements IAssetLoader {
  /**
   * Gets supported file extensions
   * @returns Array of supported extensions
   */
  public get supportedExtensions(): string[] {
    return ["txt"];
  }

  /**
   * Starts async text loading
   * @param assetName Path to text file
   */
  public loadAsset(assetName: string): void {
    let request: XMLHttpRequest = new XMLHttpRequest();

    request.open("GET", assetName);

    request.addEventListener(
      "load",
      this.onTextLoaded.bind(this, assetName, request)
    );

    request.send();
  }

  /**
   * Handles Text & handles load completion
   *
   * Creates asset and notifies manager
   * @param assetName Original asset path
   * @param request ResponseText loaded text asset
   */
  private onTextLoaded(assetName: string, request: XMLHttpRequest) {
    console.info("LOG: onTextLoaded: assetName/request", assetName, request);

    // To-DO: Add robust error handling
    if (request.readyState === request.DONE) {
      let asset = new TextAsset(assetName, request.responseText);

      AssetManager.onAssetLoaded(asset);
    }
  }
}
