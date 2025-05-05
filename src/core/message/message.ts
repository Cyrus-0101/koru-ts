import type { IMessageHandler } from "./IMessageHandler";
import { MessageBus } from "./messageBus";

/**
 * Message Priority Levels
 * - NORMAL: Queued for later processing
 * - HIGH: Processed immediately
 */
export enum MessagePriority {
  NORMAL,
  HIGH,
}

/**
 * Message - Represents a game event or notification
 *
 * Used for:
 * - Component communication
 * - Event notifications
 * - State changes
 * - System commands
 *
 * Design Pattern: Observer Pattern
 * Messages enable loose coupling between game systems
 */
export class Message {
  /** Unique message type identifier */
  public code: string = "";

  /** Additional data or payload */
  public context: any;

  /** Component that created the message */
  public sender: any;

  /** Processing priority level */
  public priority: MessagePriority = MessagePriority.NORMAL;

  /**
   * Creates a new message
   * @param code Unique identifier for message type
   * @param sender Component that created the message
   * @param context Optional payload data
   * @param priority Processing priority (default: NORMAL)
   */
  public constructor(
    code: string,
    sender: any,
    context?: any,
    priority: MessagePriority = MessagePriority.NORMAL
  ) {
    this.code = code;
    this.sender = sender;
    this.context = context;
    this.priority = priority;
  }

  /**
   * Sends a normal priority message through the MessageBus.
   * Normal priority messages are queued and processed during the next update
   *
   * @param code Message type identifier
   * @param sender Component sending the message
   * @param context Optional data payload
   *
   * Example:
   * ```typescript
   * Message.send("PLAYER_DIED", this, { position: player.position });
   * ```
   */
  public static send(code: string, sender: any, context?: any): void {
    MessageBus.post(new Message(code, sender, context, MessagePriority.NORMAL));
  }

  /**
   * Sends a high priority message through the MessageBus
   * High priority messages are processed immediately
   * Use for time-critical notifications
   *
   * @param code Message type identifier
   * @param sender Component sending the message
   * @param context Optional data payload
   *
   * Example:
   * ```typescript
   * Message.sendPriority("COLLISION", this, { damage: 50 });
   * ```
   */
  public static sendPriority(code: string, sender: any, context?: any): void {
    MessageBus.post(new Message(code, sender, context, MessagePriority.HIGH));
  }

  /**
   * Subscribes the provided handler to receive messages of a specific code.
   * Adds handler to MessageBus subscription list for specified message type
   *
   * @param code Message type to listen for (e.g., "COLLISION", "GAME_OVER")
   * @param handler Message Handler to be called when a message containing the provided code is sent
   *
   * Example:
   * ```typescript
   * class PlayerController implements IMessageHandler {
   *     constructor() {
   *         Message.subscribe("COLLISION", this);
   *     }
   *
   *     onMessage(message: Message): void {
   *         if (message.code === "COLLISION") {
   *             // Handle collision...
   *         }
   *     }
   * }
   * ```
   *
   * Note: If handler is already subscribed to this message code,
   * MessageBus will log a warning and prevent duplicate subscription
   */
  public static subscribe(code: string, handler: IMessageHandler): void {
    MessageBus.addSubscription(code, handler);
  }

  /**
   * Unsubscribes the provided handler from receiving messages of a specific code.
   * Removes the handler from the MessageBus subscription list
   *
   * @param code Code to stop listening for
   * @param handler Message Handler to unsubscribe
   *
   * Example:
   * ```typescript
   * // When component is destroyed or should stop receiving messages
   * Message.unsubscribe("COLLISION", this.handleCollision.bind(this));
   * ```
   *
   * Note: Safe to call even if handler wasn't subscribed
   */
  public static unsubscribe(code: string, handler: IMessageHandler): void {
    MessageBus.removeSubscription(code, handler);
  }
}
