import { ComponentManager } from "../components/componentManager";
import { BehaviourManager } from "../behaviours/behaviourManager";
import type { Shader } from "../gl/shaders";
import { Scene } from "./scene";
import { SimObject } from "./simObject";

export enum ZoneState {
  /** Initial state before load */
  UNINITIALIZED,
  /** Resources are being loaded */
  LOADING,
  /** Normal gameplay state */
  UPDATING,
}

/**
 * Zone - Represents a discrete game area/level with state management
 *
 * Features:
 * - Scene management
 * - State machine (Uninitialized -> Loading -> Updating)
 * - Resource loading
 * - Update/render pipeline
 * - Level metadata
 *
 * Usage:
 * ```typescript
 * const level1 = new Zone(1, "Forest", "A dense forest area");
 * level1.load();  // Transitions to LOADING then UPDATING
 * // In game loop:
 * level1.update(time);  // Only processes when in UPDATING state
 * level1.render(shader);  // Only renders when in UPDATING state
 * ```
 */
export class Zone {
  /** Unique identifier for this zone */
  private _id: number;

  /** Display name of the zone */
  private _name: string;

  /** Zone description for UI/loading screens */
  private _description: string;

  /** Scene containing all zone objects */
  private _scene: Scene;

  /**State Machine */
  private _state: ZoneState = ZoneState.UNINITIALIZED;

  private _globalID: number = -1;

  /**
   * Creates a new game zone
   * @param id Unique identifier
   * @param name Display name
   * @param description Zone description
   */
  public constructor(id: number, name: string, description: string) {
    this._id = id;
    this._name = name;
    this._description = description;
    this._scene = new Scene();
  }

  /** Gets zone identifier */
  public get id(): number {
    return this._id;
  }

  /** Gets zone display name */
  public get name(): string {
    return this._name;
  }

  /** Gets zone description */
  public get description(): string {
    return this._description;
  }

  /** Gets zone's scene graph */
  public get scene(): Scene {
    return this._scene;
  }

  /**
   * Initializes zone from JSON data
   * Creates scene hierarchy and objects from serialized data
   * Must be called before zone can be loaded
   *
   * @param zoneData JSON data containing zone configuration
   * @throws Error if required 'objects' property is missing
   *
   * @example
   * zone.initialize({
   *   objects: [
   *     {
   *       name: "Root",
   *       transform: { x: 0, y: 0, z: 0 },
   *       children: []
   *     }
   *   ]
   * });
   */
  public initialize(zoneData: any): void {
    if (zoneData.objects === undefined) {
      throw new Error(
        "ERROR: Zone initialization error: 'objects' not present"
      );
    }

    for (let ob in zoneData.objects) {
      let obj = zoneData.objects[ob];

      this.loadSimObject(obj, this._scene.root);
    }
  }

  /**
   * Loads zone resources and transitions states
   * State flow: UNINITIALIZED -> LOADING -> UPDATING
   * Initializes scene and all contained objects
   */
  public load(): void {
    this._state = ZoneState.LOADING;

    this._scene.load();

    this._scene.root.updateReady();

    this._state = ZoneState.UPDATING;
  }

  /**
   * Unloads zone resources and transitions states
   * Uninitializes scene and all contained objects
   */
  public unLoad(): void {}

  /**
   * Updates zone state if in UPDATING state
   * Skips update if in other states
   * @param time Current engine time in milliseconds
   */
  public update(time: number): void {
    if (this._state === ZoneState.UPDATING) {
      this._scene.update(time);
    }
  }

  /**
   * Renders zone contents if in UPDATING state
   * Skips rendering if in other states
   * @param shader Shader to use for rendering
   */
  public render(shader: Shader): void {
    if (this._state === ZoneState.UPDATING) {
      this._scene.render(shader);
    }
  }

  /**
   * Zone state transitions events
   * Called when zone activation state changes
   */
  public onActivated(): void {}

  /**
   * Zone state transitions events
   * Called when zone is deactivated
   * Cleanup resources and state
   */
  public onDeactivated(): void {}

  /**
   * Recursively loads SimObject and its children from JSON data
   * @param dataSection JSON data containing object properties and children
   * @param parent Parent SimObject to attach to
   *
   * Properties loaded:
   * - name: Object name
   * - transform: Position/rotation/scale
   * - children: Child objects
   *
   * @example
   * this.loadSimObject({
   *   name: "Player",
   *   transform: { x: 0, y: 0, z: 0 },
   *   children: []
   * }, parentObject);
   */
  private loadSimObject(dataSection: any, parent: SimObject): void {
    let name!: string;

    if (dataSection.name !== undefined) {
      name = String(dataSection.name);
    }

    this._globalID++;

    // 1. Create new node (SimObject)
    let simObject = new SimObject(this._globalID, name, this._scene);

    // 2. Process node properties (transform, components)
    if (dataSection.transform !== undefined) {
      simObject.transform.setFromJson(dataSection.transform);
    }

    if (dataSection.components !== undefined) {
      // Process all components
      for (let c in dataSection.components) {
        let data = dataSection.components[c];
        let component = ComponentManager.extractComponent(data)!;

        simObject.addComponent(component);
      }
    }

    if (dataSection.behaviors !== undefined) {
      console.warn(
        "WARN: 'behaviors' found in JSON (American spelling). Did you mean 'behaviours'?"
      );
    }

    if (dataSection.behaviours !== undefined) {
      // Process all behaviours
      for (let b in dataSection.behaviours) {
        let data = dataSection.behaviours[b];
        let behaviour = BehaviourManager.extractBehaviour(data)!;

        simObject.addBehavour(behaviour);
      }
    }

    // 3. Recursively process children (depth-first)
    if (dataSection.children !== undefined) {
      for (let ob in dataSection.children) {
        let obj = dataSection.children[ob];
        this.loadSimObject(obj, simObject);
      }
    }

    if (parent !== undefined) {
      // 4. Attach to parent (completes the tree connection)
      parent.addChild(simObject);
    }
  }
}
