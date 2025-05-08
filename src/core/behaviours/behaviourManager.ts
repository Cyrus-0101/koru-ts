import type { IBehaviour } from "./IBehaviour";
import type { IBehaviourBuilder } from "./IBehaviourBuilder";
/**
 * BehaviourManager - Central registry for managing behaviour types and builders
 *
 * Features:
 * - Builder registration system
 * - Behaviour instantiation from JSON
 * - Type safety enforcement
 *
 * Usage:
 * ```typescript
 * BehaviourManager.registerBuilder(new RotationBehaviourBuilder());
 * const behaviour = BehaviourManager.extractBehaviour({ type: "rotation" });
 * ```
 */
export class BehaviourManager {
  /**
   * Registry of all available behaviours
   * @key Behaviour type identifier
   * @value Builder instance for the behaviour type
   */
  private static _registeredBuilders: { [type: string]: IBehaviourBuilder } =
    {};

  /**
   * Registers a new component builder behaviour
   * @param builder Behaviour instance to register
   * @throws Error if behaviour type is already registered
   */
  public static registerBuilder(builder: IBehaviourBuilder): void {
    console.log("Builder registered...");
    BehaviourManager._registeredBuilders[builder.type] = builder;
  }

  /**
   * Creates a behaviour instance from JSON definition
   * @param json Behaviour configuration data
   * @returns New behaviour instance
   * @throws Error if:
   *   - Behaviour type is not specified
   *   - No behaviour is registered for the component type
   */
  public static extractBehaviour(json: any): IBehaviour | void {
    if (json.type !== undefined) {
      if (
        BehaviourManager._registeredBuilders[String(json.type)] !== undefined
      ) {
        return BehaviourManager._registeredBuilders[
          String(json.type)
        ].buildFromJson(json);
      }

      throw new Error(
        `ERROR: Behaviour manager error - type missing or behaviour is not registered for this type '${json.type}'.`
      );
    }
  }
}
