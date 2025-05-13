import type { SimObject } from "../world/simObject";
import type { IBehaviour } from "./IBehaviour";
import type { IBehaviourData } from "./IBehaviourData";

/**
 * BaseBehaviour - Abstract base class for all game object behaviours
 *
 * Features:
 * - Common behaviour interface implementation
 * - Owner object tracking
 * - Behaviour naming
 * - Update and apply lifecycle methods
 *
 * Usage:
 * ```typescript
 * class CustomBehaviour extends BaseBehaviour {
 *   constructor(data: IBehaviourData) {
 *     super(data);
 *   }
 * }
 * ```
 */
export abstract class BaseBehaviour implements IBehaviour {
  /** Public identifier for this behaviour */
  public name: string;

  /** Configuration data for this behaviour */
  protected _data: IBehaviourData;

  /** Reference to the owning game object */
  protected _owner!: SimObject;

  /**
   * Creates a new behaviour instance
   * @param data Configuration data for this behaviour
   */
  public constructor(data: IBehaviourData) {
    this._data = data;
    this.name = this._data.name;
  }

  /**
   * Sets the owning game object for this behaviour
   * @param owner SimObject that owns this behaviour
   */
  public setOwner(owner: SimObject): void {
    this._owner = owner;
  }

  public updateReady(): void {}

  /**
   * Updates behaviour state
   * @param time Current engine time in milliseconds
   */
  public update(time: number): void {}

  /**
   * Applies behaviour effects
   * @param userData Optional data to customize behaviour application
   */
  public apply(userData: any): void {}
}
