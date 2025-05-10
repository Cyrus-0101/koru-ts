import type { IComponent } from "./IComponent";
import type { IComponentBuilder } from "./IComponentBuilder";

/**
 * ComponentManager - Central registry for managing game component types
 *
 * Features:
 * - Component builder registration system
 * - Runtime component instantiation
 * - Type-safe component creation
 * - Error handling for missing components
 *
 * Usage:
 * ```typescript
 * // Register a component builder
 * ComponentManager.registerBuilder(new SpriteComponentBuilder());
 *
 * // Create component from JSON
 * const component = ComponentManager.extractComponent({
 *   type: "sprite",
 *   material: "player"
 * });
 * ```
 */
export class ComponentManager {
  /**
   * Registry of all available component builders
   * @key Component type identifier
   * @value Builder instance for the component type
   */
  private static _registeredBuilders: { [type: string]: IComponentBuilder } =
    {};

  /**
   * Registers a new component builder
   * @param builder Builder instance to register
   * @throws Error if builder type is already registered
   */
  public static registerBuilder(builder: IComponentBuilder): void {
    ComponentManager._registeredBuilders[builder.type] = builder;
  }

  /**
   * Creates a component instance from JSON definition
   * @param json Component configuration data
   * @returns New component instance
   * @throws Error if:
   *   - Component type is not specified
   *   - No builder is registered for the component type
   */
  public static extractComponent(json: any): IComponent | void {
    if (json.type !== undefined) {
      if (
        ComponentManager._registeredBuilders[String(json.type)] !== undefined
      ) {
        return ComponentManager._registeredBuilders[
          String(json.type)
        ].buildFromJson(json);
      }
    }

    throw new Error(
      `ERROR: Component manager error - type missing or builder is not registered for this type '${json.type}'.`
    );
  }
}
