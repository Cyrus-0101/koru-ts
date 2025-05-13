import { AudioManager } from "../audio/audioManager";
import type { CollisionData } from "../collision/collisionManager";
import type { AnimatedSpriteComponent } from "../components/animatedSpriteComponent";
import { Vector2 } from "../math/vector2";
import type { IMessageHandler } from "../message/IMessageHandler";
import { Message } from "../message/message";
import { BaseBehaviour } from "./baseBehaviour";
import type { IBehaviour } from "./IBehaviour";
import type { IBehaviourBuilder } from "./IBehaviourBuilder";
import type { IBehaviourData } from "./IBehaviourData";
import "../math/mathExtensions"; // This ensures the Math methods are attached at runtime

/**
 * PlayerBehaviourData - Configuration data for player behaviour
 *
 * Properties:
 * - name: Behaviour identifier
 * - rotation: Rotation vector (degrees per axis per second)
 */
export class PlayerBehaviourData implements IBehaviourData {
  /** Behaviour name identifier */
  public name!: string;
  public acceleration: Vector2 = new Vector2(0, 920);
  public playerCollisionComponent!: string;
  public groundCollisionComponent!: string;
  public animatedSpriteName!: string;

  /**
   * Loads rotation configuration from JSON
   * @param json Source configuration data
   * @throws Error if name is not defined
   */
  public setFromJson(json: any): void {
    if (json.name === undefined) {
      throw new Error("ERROR: Name must be defined in behaviour data.");
    } else {
      this.name = String(json.name);
    }

    if (json.acceleration !== undefined) {
      this.acceleration.setFromJson(json.acceleration);
    }

    if (json.playerCollisionComponent === undefined) {
      throw new Error(
        "ERROR: PlayerCollisionComponent must be defined in behaviour data."
      );
    } else {
      this.playerCollisionComponent = String(json.playerCollisionComponent);
    }

    if (json.groundCollisionComponent === undefined) {
      throw new Error(
        "ERROR: GroundCollisionComponent must be defined in behaviour data."
      );
    } else {
      this.groundCollisionComponent = String(json.groundCollisionComponent);
    }

    if (json.animatedSpriteName === undefined) {
      throw new Error(
        "ERROR: AnimatedSpriteName must be defined in behaviour data."
      );
    } else {
      this.animatedSpriteName = String(json.animatedSpriteName);
    }
  }
}

/**
 * PlayerBehaviourBuilder - Constructs player movement behaviours from JSON
 *
 * Implements:
 * - IBehaviourBuilder interface
 *
 * Usage:
 * ```typescript
 * const builder = new PlayerBehaviourBuilder();
 * const behaviour = builder.buildFromJson({
 *   name: "rotate",
 *   rotation: { x: 0, y: 1, z: 0 }
 * });
 * ```
 */
export class PlayerBehaviourBuilder implements IBehaviourBuilder {
  /** @returns "behaviour" type identifier */
  public get type(): string {
    return "player";
  }

  /**
   * Constructs player movement behaviour from JSON
   * @param json Configuration data
   * @returns New PlayerBehaviourBuilder instance
   */
  public buildFromJson(json: any): IBehaviour {
    let data = new PlayerBehaviourData();

    data.setFromJson(json);

    return new PlayerBehaviour(data);
  }
}

/**
 * PlayerBehaviour - Applies continuous movement to game objects
 *
 * Features:
 * - Axis-aligned movement
 * - Configurable movement speed
 * - Frame-rate independent movement
 *
 * Usage:
 * ```typescript
 * const data = new PlayerBehaviourData();
 * data.rotation.set(0, 1, 0);
 * const behaviour = new PlayerBehaviour(data);
 * ```
 */
export class PlayerBehaviour extends BaseBehaviour implements IMessageHandler {
  private _acceleration: Vector2;

  private _velocity: Vector2 = Vector2.zero;

  private _isAlive: boolean = true;

  private _playerCollisionComponent: string;

  private _groundCollisionComponent: string;

  private _animatedSpriteName: string;

  private _sprite!: AnimatedSpriteComponent;
  /**
   * Creates new rotation behaviour
   * @param data Configuration data
   */
  public constructor(data: PlayerBehaviourData) {
    super(data);

    this._acceleration = data.acceleration;

    this._playerCollisionComponent = data.playerCollisionComponent;

    this._groundCollisionComponent = data.groundCollisionComponent;

    this._animatedSpriteName = data.animatedSpriteName;

    Message.subscribe("MOUSE_DOWN", this);

    Message.subscribe(
      "COLLISION_ENTRY: " + this._playerCollisionComponent,
      this
    );
  }

  public updateReady(): void {
    super.updateReady();

    this._sprite = this._owner.getComponentByName(
      this._animatedSpriteName
    ) as AnimatedSpriteComponent;

    if (this._sprite === undefined) {
      throw new Error(
        `ERROR: AnimatedSpriteComponent: '${this._animatedSpriteName}', is not attached to the owner of this component.`
      );
    }
  }

  /**
   * Updates rotation each frame
   * @param time Current engine time in milliseconds
   */
  public update(time: number): void {
    if (!this._isAlive) {
      return;
    }

    let seconds: number = time / 1000;

    this._velocity.add(this._acceleration.clone().scale(seconds));

    // Limit max speed
    if (this._velocity.y > 400) {
      this._velocity.y = 400;
    }

    // Prevent flying over screen
    if (this._owner.transform.position.y < -13) {
      this._owner.transform.position.y = -13;
      this._velocity.y = 0;
    }

    this._owner.transform.position.add(
      this._velocity.clone().scale(seconds).toVector3()
    );

    if (this._velocity.y < 0) {
      this._owner.transform.rotation.z -= Math.degToRad(600.0) * seconds;

      if (this._owner.transform.rotation.z < Math.degToRad(-20)) {
        this._owner.transform.rotation.z = Math.degToRad(-20);
      }
    }

    if (this.isFalling() || !this._isAlive) {
      this._owner.transform.rotation.z += Math.degToRad(480.0) * seconds;

      if (this._owner.transform.rotation.z > Math.degToRad(90)) {
        this._owner.transform.rotation.z = Math.degToRad(90);
      }
    }

    if (this.shouldNotFlap()) {
      this._sprite.stop();
    } else {
      if (!this._sprite.isPlaying()) {
        this._sprite.play();
      }
    }

    super.update(time);
  }

  private isFalling(): boolean {
    return this._velocity.y > 220.0;
  }

  private shouldNotFlap(): boolean {
    return this._velocity.y > 220.0 || !this._isAlive;
  }

  private die(): void {
    this._isAlive = false;

    AudioManager.playSound("dead");
  }

  private decelerate(): void {
    this._acceleration.y = 0;

    this._velocity.y = 0;
  }

  private onFlap(): void {
    if (this._isAlive) {
      this._velocity.y = -280;

      AudioManager.playSound("flap");
    }
  }

  private onRestart(y: number): void {
    this._owner.transform.rotation.z = 0;

    this._owner.transform.position.set(33, y);

    this._velocity.set(0, 0);

    this._acceleration.set(0, 920);

    this._isAlive = true;

    this._sprite.play();
  }

  public onMessage(message: Message): void {
    switch (message.code) {
      case "MOUSE_DOWN":
        this.onFlap();

        break;

      case "COLLISION_ENTRY: " + this._playerCollisionComponent:
        let data: CollisionData = message.context as CollisionData;

        // When duck hits the ground
        if (
          data.a.name === this._groundCollisionComponent ||
          data.b.name === this._groundCollisionComponent
        ) {
          this.die();

          this.decelerate();

          Message.send("PLAYER_DIED", this);
        }

        break;
    }
  }
}
