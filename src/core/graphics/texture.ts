import {
  AssetManager,
  MESSAGE_ASSET_LOADER_ASSET_LOADED,
} from "../assets/assetManager";
import type { ImageAsset } from "../assets/imageAssetLoader";
import { gl } from "../gl/gl";
import type { IMessageHandler } from "../message/IMessageHandler";
import { Message } from "../message/message";

/** MipMap level for texture loading */
const LEVEL: number = 0;

/** Texture border size (must be 0 according to WebGL spec) */
const BORDER: number = 0;

/** White pixel data used as temporary texture while loading */
const TEMP_IMAGE_DATA: Uint8Array = new Uint8Array([255, 255, 255, 255]);

/**
 * Texture - Handles WebGL texture loading and management
 *
 * Features:
 * - Asynchronous texture loading
 * - Temporary texture during load
 * - Texture unit management
 * - WebGL texture lifecycle
 *
 * Implementation:
 * Uses MessageBus for load notifications
 * Supports multiple texture units
 * Manages WebGL texture bindings
 */
export class Texture implements IMessageHandler {
  /** Unique identifier for this texture */
  private _name: string;

  /** WebGL texture object handle */
  private _handle: WebGLTexture;

  /** Indicates if texture has finished loading */
  private _isloaded: boolean = false;

  /** Texture width in pixels */
  private _width: number;

  /** Texture height in pixels */
  private _height: number;

  /**
   * Creates a new texture
   * @param name Unique identifier/path for texture
   * @param width Initial width (default: 1)
   * @param height Initial height (default: 1)
   */
  public constructor(name: string, width: number = 1, height: number = 1) {
    this._name = name;
    this._width = width;
    this._height = height;

    this._handle = gl.createTexture();

    this.bind();

    // Used when loading raw data to the texture
    gl.texImage2D(
      gl.TEXTURE_2D,
      LEVEL,
      gl.RGBA,
      1,
      1,
      BORDER,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      TEMP_IMAGE_DATA
    );

    // Kick-off asset downloading
    let asset = AssetManager.getAsset(this._name) as ImageAsset;

    if (asset !== undefined) {
      this.loadTextureFromAsset(asset);
    } else {
      Message.subscribe(MESSAGE_ASSET_LOADER_ASSET_LOADED + this._name, this);
    }
  }

  /** Gets texture loading state */
  public get isLoaded(): boolean {
    return this._isloaded;
  }

  /** Gets texture identifier */
  public get name(): string {
    return this._name;
  }

  /** Gets texture width in pixels */
  public get width(): number {
    return this._width;
  }

  /** Gets texture height in pixels */
  public get height(): number {
    return this._height;
  }

  /**
   * Activates a texture unit and binds this texture
   * @param textureUnit Texture unit index (default: 0)
   */
  public activateAndBind(textureUnit: number = 0): void {
    gl.activeTexture(gl.TEXTURE0 + textureUnit);

    this.bind();
  }

  /** Binds this texture to the active texture unit */
  public bind(): void {
    gl.bindTexture(gl.TEXTURE_2D, this._handle);
  }

  /** Unbinds any texture from the active texture unit */
  public unbind(): void {
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /** Deletes the WebGL texture and frees resources. Good Practice. */
  public destroy(): void {
    gl.deleteTexture(this._handle);
  }

  /**
   * Handles texture loaded messages
   * @param message Message containing loaded texture data
   */
  public onMessage(message: Message): void {
    if (message.code === MESSAGE_ASSET_LOADER_ASSET_LOADED + this._name) {
      this.loadTextureFromAsset(message.context as ImageAsset);
    }
  }

  /**
   * Loads texture data from an image asset
   * @param asset Image asset containing pixel data
   */
  private loadTextureFromAsset(asset: ImageAsset): void {
    this._width = asset.width;
    this._height = asset.height;

    this.bind();

    // Used to load an image bitmap
    gl.texImage2D(
      gl.TEXTURE_2D,
      LEVEL,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      asset.data
    );

    if (this.isPowerOf2()) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      // Do not generate a mipmap and clamp wrapping to edge, Why?
      // If its not a powerof2() do not tile it, not openGL but WebGL specific code.
      // Instead of u and v webgl uses s and t, why, idk.
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    // TO-DO: Set texture filtering based on configuration
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    this._isloaded = true;
  }

  private isPowerOf2(): boolean {
    return (
      this.isValuePowerOf2(this._width) && this.isValuePowerOf2(this._height)
    );
  }

  private isValuePowerOf2(value: number): boolean {
    return (value & (value - 1)) == 0;
  }
}
