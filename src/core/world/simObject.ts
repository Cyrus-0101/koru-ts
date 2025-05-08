import type { IComponent } from "../assets/components/IComponent";
import type { IBehaviour } from "../behaviours/IBehaviour";
import type { Shader } from "../gl/shaders";
import { Matrix4x4 } from "../math/matrix4x4";
import { Transform } from "../math/transform";
import type { Scene } from "./scene";

/**
 * SimObject - Base class for all game objects in the simulation
 *
 * Features:
 * - Component-based architecture
 * - Hierarchical scene graph
 * - Local and world space transformations
 * - Parent-child relationships
 * - Object lookup by name
 *
 * Usage:
 * ```typescript
 * const player = new SimObject(1, "player");
 * const renderComponent = new SpriteComponent("render", "playerSprite");
 * player.addComponent(renderComponent);
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

  /** List of attached components */
  private _components: IComponent[] = [];

  /** Local space transformation matrix */
  private _localMatrix: Matrix4x4 = Matrix4x4.identity();

  /** World space transformation matrix */
  private _worldMatrix: Matrix4x4 = Matrix4x4.identity();

  /** Display name for object lookup */
  public name: string;

  /** Transform component for position/rotation/scale */
  public transform: Transform = new Transform();

  private _behaviours: IBehaviour[] = [];

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
   * Adds component to object
   * Sets up component owner reference
   * @param component Component to attach
   */
  public addComponent(component: IComponent): void {
    this._components.push(component);
    component.setOwner(this);
  }

  public addBehavour(behaviour: IBehaviour): void {
    this._behaviours.push(behaviour);
    behaviour.setOwner(this);
  }

  /**
   * Loads object resources
   * - Loads all attached components
   * - Recursively loads child objects
   */
  public load(): void {
    this._isLoaded = true;

    // Load components first
    for (let c of this._components) {
      c.load();
    }

    // Then load children
    for (let c of this._children) {
      c.load();
    }
  }

  /**
   * Updates object state
   * Order:
   * 1. Update local transform
   * 2. Update world matrix
   * 3. Update components
   * 4. Update children
   *
   * @param time Current engine time
   */
  public update(time: number): void {
    // SubOptimal must refactor - Should only be done when tranform changes
    this._localMatrix = this.transform.getTransformationMatrix();

    this.updateWorldMatrix(
      this._parent !== undefined ? this._parent.worldMatrix : undefined
    );

    // Update components
    for (let c of this._components) {
      c.update(time);
    }

    // Update components
    for (let b of this._behaviours) {
      b.update(time);
    }

    // Update children
    for (let c of this._children) {
      c.update(time);
    }
  }

  /**
   * Renders object hierarchy
   * - Renders all components
   * - Recursively renders children
   *
   * @param shader Shader to use for rendering
   */
  public render(shader: Shader): void {
    for (let c of this._components) {
      c.render(shader);
    }

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

  /**
   * Updates world transformation matrix based on parent
   *
   * Process:
   * 1. If parent exists:
   *    - Multiply parent's world matrix with local matrix
   *    - Result combines all transformations in hierarchy
   * 2. If no parent (root object):
   *    - World matrix equals local matrix
   *    - No parent transformations to apply
   *
   * Called during:
   * - Object transformation changes
   * - Parent transformation changes
   * - Scene graph restructuring
   *
   * @param parentWorldMatrix Parent's world transformation matrix
   */ private updateWorldMatrix(
    parentWorldMatrix: Matrix4x4 | undefined
  ): void {
    if (parentWorldMatrix !== undefined) {
      // Combine parent and local transformations
      this._worldMatrix = Matrix4x4.multiply(
        parentWorldMatrix,
        this._localMatrix
      );
    } else {
      // Root object - world equals local
      this._worldMatrix.copyFrom(this._localMatrix);
    }
  }
}
