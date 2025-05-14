import { AssetManager } from "./assetManager";
import type { IAsset } from "./IAsset";
import type { IAssetLoader } from "./IAssetLoader";

/**
 * JsonAsset - Represents a loaded JSON resource
 *
 * Features:
 * - JSON data storage
 * - Asset interface implementation
 * - Type-safe data access
 *
 * Usage:
 * ```typescript
 * const asset = new JsonAsset("config.json", jsonData);
 * const data = asset.data;  // Access parsed JSON
 * ```
 */
export class JsonAsset implements IAsset {
  /** Asset identifier */
  public readonly name: string;

  /** Parsed JSON data */
  public readonly data: any;

  /**
   * Creates new JSON asset
   * @param name Unique asset identifier
   * @param data Parsed JSON data
   */
  public constructor(name: string, data: any) {
    this.name = name;
    this.data = data;
  }
}

/**
 * JsonAssetLoader - Handles loading of JSON assets
 *
 * Features:
 * - Async JSON loading
 * - JSON format support
 * - Asset manager integration
 *
 * Usage:
 * ```typescript
 * const loader = new JsonAssetLoader();
 * loader.loadAsset("assets/testZone.json");
 * ```
 */
export class JsonAssetLoader implements IAssetLoader {
  /**
   * Gets supported file extensions
   * @returns Array of supported extensions
   */
  public get supportedExtensions(): string[] {
    return ["json"];
  }

  /**
   * Starts async JSON loading
   * @param assetName Path to JSON file
   */
  public loadAsset(assetName: string): void {
    let request: XMLHttpRequest = new XMLHttpRequest();

    request.open("GET", assetName);

    request.addEventListener(
      "load",
      this.onJsonLoaded.bind(this, assetName, request)
    );

    request.send();
  }

  /**
   * Handles JSON load completion
   * Creates asset and notifies manager
   * @param assetName Original asset path
   * @param request ResponseText loaded JSON asset
   */
  private onJsonLoaded(assetName: string, request: XMLHttpRequest) {
    console.info("LOG: onJSONLoaded: assetName/request", assetName, request);

    // To-DO: Add robust error handling
    if (request.readyState === request.DONE) {
      const jsonData = JSON.parse(request.responseText);

      let asset = new JsonAsset(assetName, jsonData);

      AssetManager.onAssetLoaded(asset);
    }
  }
}
