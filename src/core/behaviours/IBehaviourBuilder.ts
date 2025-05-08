import type { IBehaviour } from "./IBehaviour";

/**
 * IBehaviourBuilder - Interface for behaviour builder implementations
 *
 * Required Methods:
 * - buildFromJson: Constructs behaviour from JSON data
 */
export interface IBehaviourBuilder {
  /** Type identifier for this builder */
  readonly type: string;

  /**
   * Constructs behaviour instance from JSON
   * @param json Configuration data
   * @returns New behaviour instance
   */
  buildFromJson(json: any): IBehaviour;
}
