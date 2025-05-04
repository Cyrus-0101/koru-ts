import type { IMessageHandler } from "./IMessageHandler";
import type { Message } from "./message";

/**
 * MessageSubscriptionNode - Links messages to their handlers
 *
 * Purpose:
 * - Associates messages with their handlers in the message queue
 * - Enables message processing and delivery
 * - Maintains message-handler relationships
 *
 * Used in:
 * - MessageBus queuing system
 * - Priority-based message processing
 * - Message delivery tracking
 */
export class MessageSubscriptionNode {
  /** Message to be delivered */
  public message: Message;

  /** Handler that will process the message */
  public handler: IMessageHandler;

  /**
   * Creates a new subscription node
   * @param message The message to be processed
   * @param handler The handler that will receive the message
   */
  public constructor(message: Message, handler: IMessageHandler) {
    this.message = message;
    this.handler = handler;
  }
}
