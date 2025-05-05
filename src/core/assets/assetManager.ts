import { Message } from "../message/message";
import type { IAsset } from "./IAsset";
import type { IAssetLoader } from "./IAssetLoader";
import { ImageAssetLoader } from "./imageAssetLoader";

export const MESSAGE_ASSET_LOADER_ASSET_LOADED =
  "MESSAGE_ASSET_LOADER_ASSET_LOADED::";

/**
 * AssetManager - Central system for asset loading and management
 *
 * Responsibilities:
 * - Asset loading and caching
 * - Loader registration
 * - Asset type resolution
 * - Resource management
 *
 * Design Pattern: Singleton
 * All methods are static to ensure single point of asset management
 */
export class AssetManager {
  /** Registered asset loaders by type */
  private static _loaders: IAssetLoader[] = [];

  /** Cached assets mapped by name */
  private static _loadAssets: { [name: string]: IAsset } = {};

  /** Private constructor prevents instantiation */
  private constructor() {}

  public static initiliaze(): void {
    AssetManager._loaders.push(new ImageAssetLoader());
  }

  /**
   * Registers a new asset loader for specific asset types
   * @param loader Implementation of IAssetLoader interface
   */
  public static registerLoader(loader: IAssetLoader): void {
    AssetManager._loaders.push(loader);
  }

  public static onAssetLoaded(asset: IAsset): void {
    AssetManager._loadAssets[asset.name] = asset;
    Message.send(MESSAGE_ASSET_LOADER_ASSET_LOADED + asset.name, this, asset);
  }

  /**
   * Loads an asset by name if not already loaded
   * @param assetName Unique identifier for the asset
   */
  public static loadAsset(assetName: string): void {
    let extension = assetName.split(".").pop()?.toLowerCase();

    for (let l of AssetManager._loaders) {
      if (l.supportedExtensions.indexOf(extension!) !== -1) {
        l.loadAsset(assetName);
        return;
      }
    }

    console.warn(
      `WARN: Unable to load asset with extension '${extension}'. There is no loader associated with it.`
    );
  }

  /**
   * Checks if an asset is already loaded
   * @param assetName Asset identifier to check
   * @returns true if asset is loaded, false otherwise
   */
  public static isAssetLoaded(assetName: string): boolean {
    return AssetManager._loadAssets[assetName] !== undefined;
  }

  /**
   * Retrieves an asset, loading it if necessary
   * @param assetName Asset identifier to retrieve
   * @returns The requested asset
   */
  public static getAsset(assetName: string): IAsset | undefined {
    if (AssetManager._loadAssets[assetName] !== undefined) {
      return AssetManager._loadAssets[assetName];
    } else {
      AssetManager.loadAsset(assetName);
    }

    return undefined;
  }
}
