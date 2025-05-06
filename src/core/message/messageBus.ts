import type { IMessageHandler } from "./IMessageHandler";
import { Message, MessagePriority } from "./message";
import { MessageSubscriptionNode } from "./messageSubscriptionNode";

/**
 * MessageBus - Central message distribution system
 *
 * Responsibilities:
 * - Message handler registration and removal
 * - Priority-based message distribution
 * - Message queuing for NORMAL priority
 * - Immediate dispatch for HIGH priority
 *
 * Design Pattern: Pub/Sub (Publisher/Subscriber)
 * - Publishers: Any component that posts messages
 * - Subscribers: Components implementing IMessageHandler
 * - Topics: Message codes (e.g., "COLLISION", "ASSET_LOADED")
 */
export class MessageBus {
  /** Maps message codes to their subscribed handlers */
  private static _subscription: { [code: string]: IMessageHandler[] } = {};

  /** Limits messages processed per update for performance */
  private static _normalQueueMessagePerUpdate: number = 10;

  /** Queue for NORMAL priority messages */
  private static _normalMessageQueue: MessageSubscriptionNode[] = [];

  /** Prevents instantiation - all methods are static */
  private constructor() {}

  /**
   * Registers a handler for a specific message code
   * @param code Message code to identifier (e.g., "COLLISION")
   * @param handler Component that processes the message
   * @throws Warning if attempting duplicate subscription
   */
  public static addSubscription(code: string, handler: IMessageHandler): void {
    if (MessageBus._subscription[code] === undefined) {
      MessageBus._subscription[code] = [];
    }

    if (MessageBus._subscription[code].indexOf(handler) !== -1) {
      console.warn(
        "WARN: Attempting to add a duplicate handler to code: " +
          code +
          " . Subscription not added"
      );
    } else {
      MessageBus._subscription[code].push(handler);
    }
  }

  /**
   * Unregisters a handler's subscription.
   * @param code Message type to unsubscribe from
   * @param handler Handler to remove
   * @throws Warning if code or handler not found
   */
  public static removeSubscription(
    code: string,
    handler: IMessageHandler
  ): void {
    if (MessageBus._subscription[code] === undefined) {
      console.warn(
        "WARN: Cannot unsubscribe handler from code: " +
          code +
          " . Code is not subscribed to."
      );
      return;
    }

    let nodeIndex = MessageBus._subscription[code].indexOf(handler);

    if (nodeIndex !== -1) {
      MessageBus._subscription[code].splice(nodeIndex, 1);
    }
  }

  /**
   * Distributes a message to subscribed handlers
   * - HIGH priority: Processed immediately
   * - NORMAL priority: Added to queue for next update
   * @param message Message to distribute
   */
  public static post(message: Message): void {
    console.log("Message posted: ", message);

    let handlers = MessageBus._subscription[message.code];

    if (handlers === undefined) {
      return;
    }

    for (let h of handlers) {
      if (message.priority === MessagePriority.HIGH) {
        h.onMessage(message);
      } else {
        MessageBus._normalMessageQueue.push(
          new MessageSubscriptionNode(message, h)
        );
      }
    }
  }

  /**
   * Processes queued NORMAL priority messages
   * - Called each frame during engine update
   * - Processes up to _normalQueueMessagePerUpdate messages
   *
   * @param time Current engine time
   */
  public static update(time: number): void {
    if (MessageBus._normalMessageQueue.length === 0) {
      return;
    }

    let messageLimit = Math.min(
      MessageBus._normalQueueMessagePerUpdate,
      MessageBus._normalMessageQueue.length
    );

    for (let i = 0; i < messageLimit; ++i) {
      let node = MessageBus._normalMessageQueue.shift();
      node?.handler.onMessage(node.message);
    }
  }
}
