import { AudioManager } from "../audio/audioManager";
import type { CollisionData } from "../collision/collisionManager";
import type { AnimatedSpriteComponent } from "../components/animatedSpriteComponent";
import { Vector2 } from "../math/vector2";
import { Vector3 } from "../math/vector3";
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
 * - acceleration: Gravity vector in units per second
 * - playerCollisionComponent: Name of collision component for the player
 * - groundCollisionComponent: Name of collision component for the ground
 * - animatedSpriteName: Name of animated sprite used for visual feedback
 */
export class PlayerBehaviourData implements IBehaviourData {
  /** Behaviour name identifier */
  public name!: string;
  public acceleration: Vector2 = new Vector2(0, 920);
  public playerCollisionComponent!: string;
  public groundCollisionComponent!: string;
  public animatedSpriteName!: string;

  /**
   * Loads configuration from JSON
   * @param json Source configuration data
   * @throws Error if any required field is missing
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
   * @returns New PlayerBehaviour instance
   */
  public buildFromJson(json: any): IBehaviour {
    let data = new PlayerBehaviourData();

    data.setFromJson(json);

    return new PlayerBehaviour(data);
  }
}

/**
 * PlayerBehaviour - Controls player physics and interactions such as jumping,
 * gravity, collisions, death, reset, and animation control.
 *
 * Features:
 * - Flap-based flight
 * - Gravity and velocity control
 * - Collision detection with ground and obstacles
 * - Animation control via sprite
 * - Game state management via messages
 *
 * Usage:
 * ```typescript
 * const data = new PlayerBehaviourData();
 * data.name = "player";
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

  private _isPlaying: boolean = false;

  private _initialPosition: Vector3 = Vector3.zero;

  // TO-DO: Move this to configuration or use a more generic approach
  private _pipeNames: string[] = [
    "pipe1Collision_end",
    "pipe1Collision_middle_top",
    "pipe1Collision_endneg",
    "pipe1Collision_middle_bottom",
  ];

  /**
   * Creates a new player behaviour instance
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

    Message.subscribe("GAME_RESET", this);

    Message.subscribe("GAME_START", this);
  }

  /**
   * Called when all components are initialized and ready
   */
  public updateReady(): void {
    super.updateReady();

    // Obtain the reference to the animated sprite
    this._sprite = this._owner.getComponentByName(
      this._animatedSpriteName
    ) as AnimatedSpriteComponent;

    if (this._sprite === undefined) {
      throw new Error(
        `ERROR: AnimatedSpriteComponent: '${this._animatedSpriteName}', is not attached to the owner of this component.`
      );
    }

    // Ensure the animation plays immediately
    this._sprite.setFrame(0);

    this._initialPosition.copyFrom(this._owner.transform.position);
  }

  /**
   * Updates player movement each frame
   * @param time Current engine time in milliseconds
   */
  public update(time: number): void {
    let seconds: number = time / 1000;

    // Only apply velocity if game has started
    if (this._isPlaying) {
      this._velocity.add(this._acceleration.clone().scale(seconds));
    }

    // Limit max falling speed
    if (this._velocity.y > 400) {
      this._velocity.y = 400;
    }

    // Clamp position to prevent flying over screen
    if (this._owner.transform.position.y < -13) {
      this._owner.transform.position.y = -13;
      this._velocity.y = 0;
    }

    // Apply movement
    this._owner.transform.position.add(
      this._velocity.clone().scale(seconds).toVector3()
    );

    // Rotate up on flap
    if (this._velocity.y < 0) {
      this._owner.transform.rotation.z -= Math.degToRad(600.0) * seconds;

      if (this._owner.transform.rotation.z < Math.degToRad(-20)) {
        this._owner.transform.rotation.z = Math.degToRad(-20);
      }
    }

    // Rotate down on fall/die
    if (this.isFalling() || !this._isAlive) {
      this._owner.transform.rotation.z += Math.degToRad(480.0) * seconds;

      if (this._owner.transform.rotation.z > Math.degToRad(90)) {
        this._owner.transform.rotation.z = Math.degToRad(90);
      }
    }

    // Control sprite animation based on state
    if (this.shouldNotFlap()) {
      this._sprite.stop();
    } else {
      if (!this._sprite.isPlaying) {
        this._sprite.play();
      }
    }

    super.update(time);
  }

  /**
   * Handles incoming messages
   * @param message The received message
   */
  public onMessage(message: Message): void {
    switch (message.code) {
      case "MOUSE_DOWN":
        this.onFlap();

        break;

      case "COLLISION_ENTRY: " + this._playerCollisionComponent:
        let data: CollisionData = message.context as CollisionData;

        // Check when duck hits the ground
        if (
          data.a.name === this._groundCollisionComponent ||
          data.b.name === this._groundCollisionComponent
        ) {
          this.die();

          this.decelerate();
        }

        // Check for pipe collision
        if (
          this._pipeNames.indexOf(data.a.name) !== -1 ||
          this._pipeNames.indexOf(data.b.name) !== -1
        ) {
          this.die();

          this.decelerate();
        }
        break;

      case "GAME_RESET":
        this.reset();

        break;
      case "GAME_START":
        this.start();

        break;
    }
  }

  /**
   * Determines if player is falling fast enough to begin rotating downward
   * @returns True if velocity exceeds threshold
   */
  private isFalling(): boolean {
    return this._velocity.y > 220.0;
  }

  /**
   * Determines if sprite should stop flapping animation
   * @returns True if not alive, falling fast, or game isn't playing
   */
  private shouldNotFlap(): boolean {
    return this._isPlaying || this._velocity.y > 220.0 || !this._isAlive;
  }

  /**
   * Triggers player death logic
   */
  private die(): void {
    if (this._isAlive) {
      this._isAlive = false;

      AudioManager.playSound("dead");

      Message.send("PLAYER_DIED", this);
    }
  }

  /**
   * Resets player to initial state
   */
  private reset(): void {
    this._isAlive = true;
    this._isPlaying = false;
    this._sprite.owner.transform.position.copyFrom(this._initialPosition);
    this._sprite.owner.transform.rotation.z = 0;

    this._velocity.set(0, 0);
    this._acceleration.set(0, 920);
    this._sprite.play();
  }

  /**
   * Starts the game by setting isPlaying to true
   */
  private start(): void {
    this._isPlaying = true;

    Message.send("PLAYER_RESET", this);
  }

  /**
   * Stops acceleration and velocity
   */
  private decelerate(): void {
    this._acceleration.y = 0;

    this._velocity.y = 0;
  }

  /**
   * Triggers a flap action
   */
  private onFlap(): void {
    if (this._isAlive && this._isPlaying) {
      this._velocity.y = -280;

      AudioManager.playSound("flap");
    }
  }

  /**
   * Moves player to specified Y position and restarts
   * @param y Target Y coordinate
   */
  private onRestart(y: number): void {
    this._owner.transform.rotation.z = 0;

    this._owner.transform.position.set(33, y);

    this._velocity.set(0, 0);

    this._acceleration.set(0, 920);

    this._isAlive = true;

    this._sprite.play();
  }
}
