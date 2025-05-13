import type { SimObject } from "../world/simObject";

/**
 * IBehaviour - Interface defining core behaviour functionality
 *
 * Required Methods:
 * - setOwner: Assigns owning game object
 * - update: Processes behaviour logic
 * - apply: Activates behaviour effects
 */
export interface IBehaviour {
  /** Unique name identifier */
  name: string;

  /**
   * Sets the owning game object
   * @param owner SimObject that owns this behaviour
   */
  setOwner(owner: SimObject): void;

  /**
   * Avoids race conditions
   * Helps us wait until update is ready
   */
  updateReady(): void;

  /**
   * Updates behaviour state
   * @param time Current engine time in milliseconds
   */
  update(time: number): void;

  /**
   * Applies behaviour effects
   * @param userData Optional customization data
   */
  apply(userData: any): void;
}
