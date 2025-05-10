/**
 * IComponentData - Interface for component configuration data
 *
 * - Used for serializing/deserializing component properties.
 * - ComponentData objects act as intermediate containers between
 * - JSON definitions and live component instances.
 *
 * @example
 * class SpriteData implements IComponentData {
 *   name = "";
 *   materialName = "";
 *   setFromJson(json) { ... }
 * }
 */
export interface IComponentData {
  /** Unique identifier for the component */
  name: string;

  /**
   * Initializes the data object from JSON
   * @param json The source configuration data
   */
  setFromJson(json: any): void;
}
