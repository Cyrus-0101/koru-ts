import { Spritecomponent } from "../assets/components/spriteComponent";
import type { Shader } from "../gl/shaders";
import { Sprite } from "../graphics/sprite";
import { SimObject } from "./simObject";
import { Zone } from "./zone";

/**
 * TestZone - Example zone for development and testing
 *
 * Features:
 * - Single sprite rendering
 * - Basic positioning
 * - Inheritance demonstration
 *
 * Usage:
 * ```typescript
 * const testId = ZoneManager.createZone("test", "Test Zone");
 * ZoneManager.changeZone(testId);
 * ```
 *
 * Note: This is a temporary class for testing purposes
 * Should be replaced with actual game zones
 */
export class TestZone extends Zone {
  /**
   * Parent object for testing hierarchy
   * Used to demonstrate parent-child relationships
   */
  private _parentObject!: SimObject;

  /**
   * Child object for testing hierarchy
   * Used to demonstrate transform inheritance
   */
  private _testObject!: SimObject;

  /**
   * Sprite component for parent object
   * Renders parent sprite texture
   */
  private _parentSprite!: Spritecomponent;

  /**
   * Sprite component for child object
   * Renders child sprite texture
   */
  private _testSprite!: Spritecomponent;

  /**
   * Loads test resources
   * - Creates test sprite
   * - Sets initial position
   * - Calls parent load
   */
  public load(): void {
    this._parentObject = new SimObject(0, "parentObject");

    this._parentObject.transform.position.x = 300;
    this._parentObject.transform.position.y = 300;

    this._parentSprite = new Spritecomponent("test", "crate");
    this._parentObject.addComponent(this._parentSprite);

    this._testObject = new SimObject(1, "testObject");

    this._testSprite = new Spritecomponent("test", "crate");

    this._testObject.addComponent(this._testSprite);

    this._testObject.transform.position.x = 120;
    this._testObject.transform.position.y = 120;

    this._parentObject.addChild(this._testObject);

    this.scene.addObject(this._parentObject);

    // Load parent resources
    super.load();
  }

  /**
   * Updates test objects
   * Applies continuous rotation to demonstrate transform hierarchy
   * @param time Current engine time
   */
  public update(time: number) {
    // Rotate parent object
    this._parentObject.transform.rotation.z += 0.01;

    // Rotate child object (compounds with parent rotation)
    this._testObject.transform.rotation.z += 0.01;

    // Update parent class
    super.update(time);
  }
}
