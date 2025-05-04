import type { Message } from "./message";

/**
 * IMessageHandler - Interface for message handling components
 *
 * Responsibilities:
 * - Process incoming messages
 * - Update component state based on messages
 * ```
 */
export interface IMessageHandler {
  /**
   * Processes an incoming message
   * @param message The message to handle
   */
  onMessage(message: Message): void;
}
