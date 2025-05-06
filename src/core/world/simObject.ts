import type { Shader } from "../gl/shaders";
import { Matrix4x4 } from "../math/matrix4x4";
import { Transform } from "../math/transform";
import type { Scene } from "./scene";

/**
 * SimObject - Base class for all game objects in the simulation
 *
 * Features:
 * - Hierarchical scene graph
 * - Local and world space transformations
 * - Parent-child relationships
 * - Object lookup by name
 * - Load/Update/Render lifecycle
 *
 * Usage:
 * ```typescript
 * const parent = new SimObject(1, "parent");
 * const child = new SimObject(2, "child");
 * parent.addChild(child);
 * ```
 */
export class SimObject {
  /** Unique identifier for this object */
  private _id: number;

  /** Child objects in the scene hierarchy */
  private _children: SimObject[] = [];

  /** Parent object reference */
  private _parent!: SimObject;

  /** Tracks if object resources are loaded */
  private _isLoaded: boolean = false;

  /** Reference to containing scene */
  private _scene: Scene | undefined;

  /** Local space transformation matrix */
  private _localMatrix: Matrix4x4 = Matrix4x4.identity();

  /** World space transformation matrix */
  private _worldMatrix: Matrix4x4 = Matrix4x4.identity();

  /** Display name for object lookup */
  public name: string;

  /** Transform component for position/rotation/scale */
  public transform: Transform = new Transform();

  /**
   * Creates a new simulation object
   *
   * @param id Unique identifier for object lookup
   * @param name Display name for debugging and search
   * @param scene Optional scene reference for root objects
   *
   * Note: Scene parameter should only be used by Scene class
   * when creating root object. Regular objects get their scene
   * reference through the onAdded() method.
   */
  public constructor(id: number, name: string, scene?: Scene) {
    this._id = id;
    this.name = name;
    this._scene = scene;
  }

  /** Gets unique identifier */
  public get id(): number {
    return this._id;
  }

  /** Gets parent object reference */
  public get parent(): SimObject {
    return this._parent;
  }

  /** Gets world space transformation */
  public get worldMatrix(): Matrix4x4 {
    return this._worldMatrix;
  }

  /** Checks if resources are loaded */
  public get isLoaded(): boolean {
    return this._isLoaded;
  }

  /**
   * Adds a child object to the hierarchy
   * Sets up parent reference and updates transforms
   * @param child Object to add as child
   */
  public addChild(child: SimObject): void {
    child._parent = this;
    this._children.push(child);
    child.onAdded(this._scene!);
  }

  /**
   * Removes a child object from the hierarchy
   * Cleans up parent reference
   * @param child Object to remove
   */
  public removeChild(child: SimObject): void {
    let index = this._children.indexOf(child);
    if (index !== -1) {
      this._children.splice(index, 1);
    }
  }

  /**
   * Recursively searches for object by name
   * @param name Name to search for
   * @returns Found object or undefined
   */
  public getObjectByName(name: string): SimObject | undefined {
    if (this.name === name) {
      return this;
    }

    for (let child of this._children) {
      let result = child.getObjectByName(name);

      if (result !== undefined) {
        return result;
      }

      return undefined;
    }
  }

  /**
   * Loads object resources
   * Called when object enters the scene
   */
  public load(): void {
    this._isLoaded = true;

    for (let c of this._children) {
      c.load();
    }
  }

  /**
   * Updates object state
   * Called each frame before rendering
   * @param time Current engine time
   */
  public update(time: number): void {
    for (let c of this._children) {
      c.update(time);
    }
  }

  /**
   * Renders object using provided shader
   * Called each frame after update
   * @param shader Shader to use for rendering
   */
  public render(shader: Shader): void {
    for (let c of this._children) {
      c.render(shader);
    }
  }

  /**
   * Called when object is added to a scene
   * Sets up scene reference and initializes resources
   *
   * @param scene Scene this object was added to
   * @protected Virtual method for derived classes
   */
  protected onAdded(scene: Scene): void {
    this._scene = scene;
  }
}
