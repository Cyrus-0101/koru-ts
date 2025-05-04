import type { IMessageHandler } from "./IMessageHandler";
import { Message, MessagePriority } from "./message";
import { MessageSubscriptionNode } from "./messageSubscriptionNode";

/**
 * MessageBus - Central message distribution system
 *
 * Responsibilities:
 * - Register message handlers
 * - Distribute messages to handlers
 * - Manage message priorities
 * - Handle message queuing
 *
 * Design Pattern: Pub/Sub (Publisher/Subscriber)
 * Provides decoupled communication between game components
 */
export class MessageBus {
  /** Handlers mapped by message code */
  private static _subscription: { [code: string]: IMessageHandler[] } = {};

  /** Maximum normal priority messages processed per update */
  private static _normalQueueMessagePerUpdate: number = 10;

  /** Queue for normal priority messages */
  private static _normalMessageQueue: MessageSubscriptionNode[] = [];

  /** Private constructor prevents instantiation */
  private constructor() {}

  /**
   * Registers a handler for a specific message code
   * @param code Message type to subscribe to
   * @param handler Component that will handle the message
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
   * Unregisters a handler from a message code
   * @param code Message type to unsubscribe from
   * @param handler Handler to remove
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
   * Posts a message for distribution
   * - HIGH priority: Processed immediately
   * - NORMAL priority: Queued for next update
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
   * Processes queued normal priority messages
   * Called each frame by game engine
   * @param time Current game time
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
