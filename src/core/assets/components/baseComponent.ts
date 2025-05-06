import type { Shader } from "../../gl/shaders";
import type { SimObject } from "../../world/simObject";

/**
 * BaseComponent - Abstract base class for all game object components
 *
 * Features:
 * - Component lifecycle management (load/update/render)
 * - Owner object reference tracking
 * - Unique component naming
 * - Render pipeline integration
 *
 * Usage:
 * ```typescript
 * class CustomComponent extends BaseComponent {
 *   constructor() {
 *     super("custom");
 *   }
 * }
 * ```
 */
export abstract class BaseComponent {
  /** Reference to owning SimObject */
  protected _owner!: SimObject;

  /** Unique identifier for this component type */
  public name!: string;

  /**
   * Creates new component
   * @param name Unique identifier for this component
   */
  public constructor(name: string) {}

  /**
   * Sets owning object reference
   * @param owner SimObject that owns this component
   */
  public setOwner(owner: SimObject) {
    this._owner = owner;
  }

  /**
   * Fetches the owner of this SimObject
   */
  public get owner(): SimObject {
    return this._owner;
  }

  /** Loads component resources */
  public load(): void {}

  /**
   * Updates component state
   * @param time Current engine time in milliseconds
   */
  public update(time: number): void {}

  /**
   * Renders component
   * @param shader Shader to use for rendering
   */
  public render(shader: Shader): void {}
}
