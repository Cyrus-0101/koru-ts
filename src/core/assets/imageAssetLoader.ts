import { AssetManager } from "./assetManager";
import type { IAsset } from "./IAsset";
import type { IAssetLoader } from "./IAssetLoader";

export class ImageAsset implements IAsset {
  public readonly name: string;
  public readonly data: HTMLImageElement;

  public constructor(name: string, data: HTMLImageElement) {
    this.name = name;
    this.data = data;
  }

  public get width(): number {
    return this.data.width;
  }

  public get height(): number {
    return this.data.height;
  }
}

export class ImageAssetLoader implements IAssetLoader {
  public get supportedExtensions(): string[] {
    return ["png", "gif", "jpg"];
  }

  public loadAsset(assetName: string): void {
    let image: HTMLImageElement = new Image();

    image.onload = this.onImageLoaded.bind(this, assetName, image);
    image.src = assetName;
  }

  private onImageLoaded(assetName: string, image: HTMLImageElement) {
    console.log(`LOG: onImageLoaded: assetName/image, ${assetName} ${image}`);

    let asset = new ImageAsset(assetName, image);

    AssetManager.onAssetLoaded(asset);
  }
}
