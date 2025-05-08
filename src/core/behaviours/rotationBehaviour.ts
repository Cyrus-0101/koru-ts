import { Vector3 } from "../math/vector3";
import { BaseBehaviour } from "./baseBehaviour";
import type { IBehaviour } from "./IBehaviour";
import type { IBehaviourBuilder } from "./IBehaviourBuilder";
import type { IBehaviourData } from "./IBehaviourData";

/**
 * RotationBehaviourData - Configuration data for rotation behaviour
 *
 * Properties:
 * - name: Behaviour identifier
 * - rotation: Rotation vector (degrees per axis per second)
 */
export class RotationBehaviourData implements IBehaviourData {
  /** Behaviour name identifier */
  public name!: string;

  /** Rotation vector (degrees per axis per second) */
  public rotation: Vector3 = Vector3.zero;

  /**
   * Loads rotation configuration from JSON
   * @param json Source configuration data
   * @throws Error if name is not defined
   */
  public setFromJson(json: any): void {
    if (json.name === undefined) {
      throw new Error("ERROR: Name must be defined in behaviour data.");
    }

    this.name = String(json.name);

    if (json.rotation !== undefined) {
      this.rotation.setFromJson(json.rotation);
    }
  }
}

/**
 * RotationBehaviourBuilder - Constructs rotation behaviours from JSON
 *
 * Implements:
 * - IBehaviourBuilder interface
 *
 * Usage:
 * ```typescript
 * const builder = new RotationBehaviourBuilder();
 * const behaviour = builder.buildFromJson({
 *   name: "rotate",
 *   rotation: { x: 0, y: 1, z: 0 }
 * });
 * ```
 */
export class RotationBehaviourBuilder implements IBehaviourBuilder {
  /** @returns "rotation" type identifier */
  public get type(): string {
    return "rotation";
  }

  /**
   * Constructs rotation behaviour from JSON
   * @param json Configuration data
   * @returns New RotationBehaviour instance
   */
  public buildFromJson(json: any): IBehaviour {
    let data = new RotationBehaviourData();

    data.setFromJson(json);

    return new RotationBehaviour(data);
  }
}

/**
 * RotationBehaviour - Applies continuous rotation to game objects
 *
 * Features:
 * - Axis-aligned rotation
 * - Configurable rotation speed
 * - Frame-rate independent rotation
 *
 * Usage:
 * ```typescript
 * const data = new RotationBehaviourData();
 * data.rotation.set(0, 1, 0);
 * const behaviour = new RotationBehaviour(data);
 * ```
 */
export class RotationBehaviour extends BaseBehaviour {
  /** Rotation vector (degrees per axis per second) */
  private _rotation: Vector3;

  /**
   * Creates new rotation behaviour
   * @param data Configuration data
   */
  public constructor(data: RotationBehaviourData) {
    super(data);

    this._rotation = data.rotation;
  }

  /**
   * Updates rotation each frame
   * @param time Current engine time in milliseconds
   */
  public update(time: number): void {
    this._owner.transform.rotation.add(this._rotation);

    super.update(time);
  }
}
