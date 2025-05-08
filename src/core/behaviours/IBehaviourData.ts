/**
 * IBehaviourData - Interface for behaviour configuration data
 *
 * Required Methods:
 * - setFromJson: Loads configuration from JSON
 */
export interface IBehaviourData {
  /** Behaviour name identifier */
  name: string;

  /**
   * Loads configuration from JSON
   * @param json Source configuration data
   */
  setFromJson(json: any): void;
}
