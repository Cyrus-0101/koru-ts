import {
  AssetManager,
  MESSAGE_ASSET_LOADER_ASSET_LOADED,
} from "../assets/assetManager";
import type { ImageAsset } from "../assets/imageAssetLoader";
import { Vector2 } from "../math/vector2";
import type { IMessageHandler } from "../message/IMessageHandler";
import { Message } from "../message/message";
import { MaterialManager } from "./materialManager";
import { Sprite } from "./sprite";

class UVInfo {
  public min: Vector2;
  public max: Vector2;

  public constructor(min: Vector2, max: Vector2) {
    this.max = max;
    this.min = min;
  }
}

/**
 * AnimatedSprite  - 2D textured quad renderer with material support
 *
 * Features:
 * - Material-based rendering
 * - Vertex buffer management
 * - Position transformation
 * - UV coordinate mapping
 * - Reference-counted textures
 *
 * Memory Layout (per vertex):
 * - Position: vec3 (x, y, z) offset: 0
 * - TexCoord: vec2 (u, v)    offset: 3
 *
 * Shader Requirements:
 * Uniforms:
 * - u_model: Model transformation matrix - mat4       // Model transformation
 * - u_tint: Color tint (vec4)            - vec4       // Material Color Tint
 * - u_diffuse: Texture sampler           - sampler2D  // Texture Unit 0
 *
 * Attributes:
 * - a_position: vec3  // location 0
 * - a_texCoord: vec2  // location 1
 */
export class AnimatedSprite extends Sprite implements IMessageHandler {
  private _frameWidth: number;
  private _frameHeight: number;
  private _frameCount: number;
  private _frameSequence: number[] = [];

  // TO-DO: Make these configurable
  private _currentFrame: number = 0;

  private _frameUVs: UVInfo[] = [];

  // Ms each frame lasts
  private _frameTime: number = 111;

  private _currentTime: number = 0;

  private _assetLoaded: boolean = false;

  private _assetWidth: number = 2;

  private _assetHeight: number = 2;

  /** Stopping or playing the animation */
  private _isPlaying: boolean = true;

  /**
   * Creates a new sprite instance
   * @param name Unique identifier for this sprite
   * @param materialName The name of the material to use with the sprite
   * @param width Width in pixels/units (default: 100)
   * @param height Height in pixels/units (default: 100)
   *
   * TO-DO: Switch to configuration class
   */
  public constructor(
    name: string,
    materialName: string,
    width: number = 100,
    height: number = 100,
    frameWidth: number = 10,
    frameHeight: number = 10,
    frameCount: number = 10,
    frameSequence: number[] = []
  ) {
    super(name, materialName, width, height);

    this._frameCount = frameCount;
    this._frameHeight = frameHeight;
    this._frameWidth = frameWidth;
    this._frameSequence = frameSequence;

    Message.subscribe(
      MESSAGE_ASSET_LOADER_ASSET_LOADED + this._material?.diffuseTextureName,
      this
    );
  }

  /**
   * Indicates if this animated sprite is currently playing
   */
  public isPlaying(): boolean {
    return this._isPlaying;
  }

  public play(): void {
    this._isPlaying = true;
  }

  public stop(): void {
    this._isPlaying = false;
  }

  public setFrame(frameNumber: number): void {
    if (frameNumber >= this._frameCount) {
      throw new Error(
        `ERROR: Frame is out of range: \nFrame Number'${frameNumber}' \nFrame Count: '${this._frameCount}'`
      );
    }

    this._currentFrame = frameNumber;
  }

  /**
   * Initializes sprite geometry and GPU resources
   * - Creates vertex buffer with interleaved data
   * - Sets up attribute pointers for shader
   * - Uploads quad geometry with UVs
   * - Configures winding order for face culling
   */
  public load(): void {
    super.load();

    if (!this._assetLoaded) {
      this.setUpFromMaterial();
    }
  }

  /**
   * Cleans up sprite resources
   * - Destroys vertex buffer in GPU Memory
   * - Releases material reference
   * - Clears material references
   *
   * Should be called when sprite is no longer needed
   */
  public destroy(): void {
    super.destroy();
  }

  /**
   * Message handler for this component
   * @param message The message to be handled
   */
  public onMessage(message: Message): void {
    if (
      message.code ===
      MESSAGE_ASSET_LOADER_ASSET_LOADED + this._material?.diffuseTextureName
    ) {
      this._assetLoaded = true;

      let asset = message.context as ImageAsset;

      this._assetHeight = asset.height;
      this._assetWidth = asset.width;

      this.calculateUVs();
    }
  }

  /**
   * Updates routines on sprite state
   * Called each frame by the game engine
   *let totalWidth: number = 0;
    let yValue: number = 0;

    for (let i = 0; i < this._frameCount; ++i) {
      totalWidth += i * this._frameWidth;

      if (totalWidth > this._width) {
        yValue++;
        totalWidth = 0;
      }

      let textureWidth = this._material?.diffuseTexture?.width!;
      let textureHeight = this._material?.diffuseTexture?.height!;

      let u = (i * this._frameWidth) / textureWidth;
      let v = (yValue * this._frameHeight) / textureHeight;
      let min: Vector2 = new Vector2(u, v);

      let uMax = (i * this._frameWidth + this._frameWidth) / textureWidth;
      let vMax =
        (yValue * this._frameHeight + this._frameWidth) / textureHeight;
      let max: Vector2 = new Vector2(uMax, vMax);

      this._frameUVs.push(new UVInfo(min, max));
    }

   * @param time Current game time in milliseconds
   *
   * TODO: Add animation and movement updates
   */
  public update(time: number): void {
    if (!this._assetLoaded) {
      this.setUpFromMaterial();

      return;
    }

    // Stop the animation
    if (!this._isPlaying) {
      return;
    }

    this._currentTime += time;

    if (this._currentTime > this._frameTime) {
      this._currentFrame++;
      this._currentTime = 0;

      if (this._currentFrame >= this._frameSequence.length) {
        this._currentFrame = 0;
      }

      let frameUVs = this._frameSequence[this._currentFrame];

      this._vertices[0].texCoords.copyFrom(this._frameUVs[frameUVs].min);
      this._vertices[1].texCoords = new Vector2(
        this._frameUVs[frameUVs].min.x,
        this._frameUVs[frameUVs].max.y
      );
      this._vertices[2].texCoords.copyFrom(this._frameUVs[frameUVs].max);
      this._vertices[3].texCoords.copyFrom(this._frameUVs[frameUVs].max);
      this._vertices[4].texCoords = new Vector2(
        this._frameUVs[frameUVs].max.x,
        this._frameUVs[frameUVs].min.y
      );
      this._vertices[5].texCoords.copyFrom(this._frameUVs[frameUVs].min);

      this._buffer.clearData();

      // Upload vertex data to GPU memory
      for (let v of this._vertices) {
        this._buffer.pushBackData(v.toArray());
      }

      this._buffer.upload();

      this._buffer.unbind();
    }

    super.update(time);
  }

  //   TO-DO: Add comments
  private calculateUVs(): void {
    let totalWidth: number = 0;
    let yValue: number = 0;

    for (let i = 0; i < this._frameCount; ++i) {
      totalWidth += i * this._frameWidth;

      if (totalWidth > this._assetWidth) {
        yValue++;
        totalWidth = 0;
      }

      let u = (i * this._frameWidth) / this._assetWidth;
      let v = (yValue * this._frameHeight) / this._assetHeight;
      let min: Vector2 = new Vector2(u, v);

      let uMax = (i * this._frameWidth + this._frameWidth) / this._assetWidth;
      let vMax =
        (yValue * this._frameHeight + this._frameWidth) / this._assetHeight;
      let max: Vector2 = new Vector2(uMax, vMax);

      this._frameUVs.push(new UVInfo(min, max));
    }
  }

  // Avoiding race conditions optimization
  private setUpFromMaterial(): void {
    if (!this._assetLoaded) {
      let material = MaterialManager.getMaterial(this._materialName!);

      if (material?.diffuseTexture?.isLoaded) {
        if (AssetManager.isAssetLoaded(material.diffuseTextureName)) {
          this._assetHeight = material.diffuseTexture.height;
          this._assetWidth = material.diffuseTexture.width;
          this._assetLoaded = true;

          this.calculateUVs();
        }
      }
    }
  }
}
