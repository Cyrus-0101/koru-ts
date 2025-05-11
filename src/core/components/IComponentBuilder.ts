import type { IComponent } from "./IComponent";
/**
 * IComponentBuilder - Factory interface for creating components from JSON
 *
 * Implemented by builder classes that construct specific component types
 * from JSON configuration data.
 *
 * @example
 * class SpriteBuilder implements IComponentBuilder {
 *   readonly type = "sprite";
 *   buildFromJson(json) { ... }
 * }
 */
export interface IComponentBuilder {
  /**
   * The component type identifier
   * Must match the 'type' field in JSON definitions
   */
  readonly type: string;

  /**
   * Constructs a component instance from JSON data
   * @param json The configuration data for the component
   * @returns A new component instance
   */
  buildFromJson(json: any): IComponent;
}
