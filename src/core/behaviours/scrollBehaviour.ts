import { Vector2 } from "../math/vector2";
import type { IMessageHandler } from "../message/IMessageHandler";
import { Message } from "../message/message";
import { BaseBehaviour } from "./baseBehaviour";
import type { IBehaviour } from "./IBehaviour";
import type { IBehaviourBuilder } from "./IBehaviourBuilder";
import type { IBehaviourData } from "./IBehaviourData";

/**
 * ScrollBehaviourData - Configuration data for scroll behaviour
 *
 * Properties:
 * - name: Behaviour identifier
 * - velocity: Speed of scrolling in units per second (x, y)
 * - minPosition: Minimum x/y position before resetting
 * - resetPosition: Position to return to when reset
 * - startMessage: Message that triggers scrolling to begin
 * - stopMessage: Message that stops scrolling
 * - resetMessage: Message that resets position
 */
export class ScrollBehaviourData implements IBehaviourData {
  public name!: string;
  public velocity: Vector2 = Vector2.zero;
  public minPosition: Vector2 = Vector2.zero;
  public resetPosition: Vector2 = Vector2.zero;
  public startMessage!: string;
  public stopMessage!: string;
  public resetMessage!: string;

  /**
   * Loads configuration from JSON
   * @param json Source configuration data
   * @throws Error if any required field is missing
   */
  public setFromJson(json: any): void {
    if (json.name === undefined) {
      throw new Error("ERROR: 'Name' must be defined in behaviour data.");
    } else {
      this.name = String(json.name);
    }

    if (json.startMessage !== undefined) {
      this.startMessage = String(json.startMessage);
    }

    if (json.stopMessage !== undefined) {
      this.stopMessage = String(json.stopMessage);
    }

    if (json.resetMessage !== undefined) {
      this.resetMessage = String(json.resetMessage);
    }

    if (json.velocity !== undefined) {
      this.velocity.setFromJson(json.velocity);
    } else {
      throw new Error(
        "ERROR: ScrollBehaviourData requires property 'velocity' to be defined!"
      );
    }

    if (json.minPosition !== undefined) {
      this.minPosition.setFromJson(json.minPosition);
    } else {
      throw new Error(
        "ERROR: ScrollBehaviourData requires property 'minPosition' to be defined!"
      );
    }

    if (json.resetPosition !== undefined) {
      this.resetPosition.setFromJson(json.resetPosition);
    } else {
      throw new Error(
        "ERROR: ScrollBehaviourData requires property 'resetPosition' to be defined!"
      );
    }
  }
}

/**
 * ScrollBehaviourBuilder - Constructs scroll behaviours from JSON
 *
 * Implements:
 * - IBehaviourBuilder interface
 *
 * Usage:
 * ```typescript
 * const builder = new ScrollBehaviourBuilder();
 * const behaviour = builder.buildFromJson({
 *   name: "scroll",
 *   velocity: { x: -10, y: 0 },
 *   minPosition: { x: -100, y: 0 },
 *   resetPosition: { x: 320, y: 0 },
 *   startMessage: "GAME_START"
 * });
 * ```
 */
export class ScrollBehaviourBuilder implements IBehaviourBuilder {
  /** @returns "scroll" type identifier */
  public get type(): string {
    return "scroll";
  }

  /**
   * Constructs a scroll behaviour from JSON config
   * @param json Configuration data
   * @returns New ScrollBehaviour instance
   */
  public buildFromJson(json: any): IBehaviour {
    let data = new ScrollBehaviourData();

    data.setFromJson(json);

    return new ScrollBehaviour(data);
  }
}

/**
 * ScrollBehaviour - Scrolls an object continuously or on message trigger
 *
 * Features:
 * - Start/stop scrolling via messages
 * - Auto-reset when reaching minimum bounds
 * - Reset to initial or configured position
 */
export class ScrollBehaviour extends BaseBehaviour implements IMessageHandler {
  private _velocity: Vector2 = Vector2.zero;
  private _minPosition: Vector2 = Vector2.zero;
  private _resetPosition: Vector2 = Vector2.zero;
  private _startMessage: string;
  private _stopMessage: string;
  private _resetMessage: string;
  private _isScrolling: boolean = false;
  private _initialPosition: Vector2 = Vector2.zero;

  /**
   * Creates a new scroll behaviour
   * @param data Configuration data
   */
  public constructor(data: ScrollBehaviourData) {
    super(data);

    this._velocity.copyFrom(data.velocity);
    this._minPosition.copyFrom(data.minPosition);
    this._resetPosition.copyFrom(data.resetPosition);
    this._startMessage = data.startMessage;
    this._stopMessage = data.stopMessage;
    this._resetMessage = data.resetMessage;
  }

  /**
   * Called when all components are initialized and ready
   */
  public updateReady(): void {
    super.updateReady();

    if (this._startMessage !== undefined) {
      Message.subscribe(this._startMessage, this);
    }

    if (this._stopMessage !== undefined) {
      Message.subscribe(this._stopMessage, this);
    }

    if (this._resetMessage !== undefined) {
      Message.subscribe(this._resetMessage, this);
    }

    this._initialPosition.copyFrom(this._owner.transform.position.toVector2());
  }

  /**
   * Updates scroll position each frame
   * @param time Current engine time in milliseconds
   */
  public update(time: number): void {
    if (this._isScrolling) {
      this._owner.transform.position.add(
        this._velocity
          .clone()
          .scale(time / 1000)
          .toVector3()
      );

      // Check if we've reached or passed minimum position
      if (
        this._owner.transform.position.x <= this._minPosition.x &&
        this._owner.transform.position.y <= this._minPosition.y
      ) {
        this.reset();
      }
    }
  }

  /**
   * Handles incoming messages
   * @param message The received message
   */
  public onMessage(message: Message): void {
    if (message.code === this._startMessage) {
      this._isScrolling = true;
    } else if (message.code === this._stopMessage) {
      this._isScrolling = false;
    } else if (message.code === this._resetMessage) {
      this.initial();
    }
  }

  /**
   * Resets object to configured reset position
   */
  private reset(): void {
    this._owner.transform.position.copyFrom(this._resetPosition.toVector3());
  }

  /**
   * Resets object back to its initial position
   */
  private initial(): void {
    this._owner.transform.position.copyFrom(this._initialPosition.toVector3());
  }
}
