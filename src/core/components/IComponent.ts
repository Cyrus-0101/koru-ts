import type { Shader } from "../gl/shaders";
import type { SimObject } from "../world/simObject";

/**
 * IComponent - Core interface for all game object components
 *
 * Defines the base contract that all game components must implement.
 * Components are reusable behaviours that can be attached to game objects.
 *
 * Core Responsibilities:
 * - Lifecycle management (load/update/render)
 * - Owner object association
 * - Unique identification
 *
 * @example
 * class HealthComponent implements IComponent {
 *   name = "health";
 *   // ... implement interface methods
 * }
 */
export interface IComponent {
  /** Unique identifier for this component instance */
  name: string;

  /** The game object that owns this component */
  readonly owner: SimObject;

  /**
   * Assigns this component to a game object
   * @param owner The SimObject that will own this component
   */
  setOwner(owner: SimObject): void;

  /**
   * Loads any required resources for the component
   * Called when the owner object is loaded
   */
  load(): void;

  /**
   * Avoids race conditions
   * Helps us wait until update is ready
   */
  updateReady(): void;

  /**
   * Updates component state each frame
   * @param time The current game time in milliseconds
   */
  update(time: number): void;

  /**
   * Renders the component using the provided shader
   * @param shader The shader program to use for rendering
   */
  render(shader: Shader): void;
}
