import { InputManager, Keys } from "../input/inputManager";
import { Vector3 } from "../math/vector3";
import { BaseBehaviour } from "./baseBehaviour";
import type { IBehaviour } from "./IBehaviour";
import type { IBehaviourBuilder } from "./IBehaviourBuilder";
import type { IBehaviourData } from "./IBehaviourData";

/**
 * KeyboardMovementBehaviourData - Configuration data for keyboard behaviour
 *
 * Properties:
 * - name: Behaviour identifier
 * - rotation: Rotation vector (degrees per axis per second)
 */
export class KeyboardMovementBehaviourData implements IBehaviourData {
  /** Behaviour name identifier */
  public name!: string;
  public speed: number = 0.1;

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
    this.speed = Number(json.speed);

    if (json.speed !== undefined) {
    }
  }
}

/**
 * KeyboardMovementBehaviourBuilder - Constructs keyboard movement behaviours from JSON
 *
 * Implements:
 * - IBehaviourBuilder interface
 *
 * Usage:
 * ```typescript
 * const builder = new KeyboardMovementBehaviourBuilder();
 * const behaviour = builder.buildFromJson({
 *   name: "rotate",
 *   rotation: { x: 0, y: 1, z: 0 }
 * });
 * ```
 */
export class KeyboardMovementBehaviourBuilder implements IBehaviourBuilder {
  /** @returns "rotation" type identifier */
  public get type(): string {
    return "keyboardMovement";
  }

  /**
   * Constructs keyboard movement behaviour from JSON
   * @param json Configuration data
   * @returns New KeyboardMovementBehaviourBuilder instance
   */
  public buildFromJson(json: any): IBehaviour {
    let data = new KeyboardMovementBehaviourData();

    data.setFromJson(json);

    return new KeyboardMovementBehaviour(data);
  }
}

/**
 * KeyboardMovementBehaviour - Applies continuous movement to game objects
 *
 * Features:
 * - Axis-aligned movement
 * - Configurable movement speed
 * - Frame-rate independent movement
 *
 * Usage:
 * ```typescript
 * const data = new KeyboardMovementBehaviourData();
 * data.rotation.set(0, 1, 0);
 * const behaviour = new KeyboardMovementBehaviour(data);
 * ```
 */
export class KeyboardMovementBehaviour extends BaseBehaviour {
  public speed: number = 0.1;

  /**
   * Creates new rotation behaviour
   * @param data Configuration data
   */
  public constructor(data: KeyboardMovementBehaviourData) {
    super(data);

    this.speed = data.speed;
  }

  /**
   * Updates rotation each frame
   * @param time Current engine time in milliseconds
   */
  public update(time: number): void {
    if (InputManager.isKeyDown(Keys.LEFT)) {
      this._owner.transform.position.x -= this.speed;
    }

    if (InputManager.isKeyDown(Keys.RIGHT)) {
      this._owner.transform.position.x += this.speed;
    }

    if (InputManager.isKeyDown(Keys.UP)) {
      this._owner.transform.position.y -= this.speed;
    }

    if (InputManager.isKeyDown(Keys.DOWN)) {
      this._owner.transform.position.y += this.speed;
    }

    super.update(time);
  }
}
