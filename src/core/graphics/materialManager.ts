import type { Material } from "./material";

/**
 * MaterialReferenceNode - Tracks material usage and reference count
 *
 * Used for:
 * - Managing material lifetime
 * - Reference counting
 * - Automatic cleanup
 */
class MaterialReferenceNode {
  /** The actual material being referenced */
  public material: Material;

  /** Number of active references to this material */
  public referenceCount: number = 1;

  /**
   * Creates a new reference node
   * @param material The material to track
   */
  public constructor(material: Material) {
    this.material = material;
  }
}

/**
 * MaterialManager - Singleton manager for material resources
 *
 * Features:
 * - Material caching and reuse
 * - Reference counting
 * - Automatic resource cleanup
 * - Memory management
 *
 * Design Pattern: Singleton
 * - All methods are static to ensure single point of material management
 */
export class MaterialManager {
  /** Maps material names to reference nodes */
  private static _materials: { [name: string]: MaterialReferenceNode } = {};

  /** Private constructor prevents instantiation */
  private constructor() {}

  /**
   * Registers a new material for management
   * Creates reference node if material doesn't exist
   * @param material Material to register
   */
  public static registerMaterial(material: Material): void {
    if (MaterialManager._materials[material.name] === undefined) {
      MaterialManager._materials[material.name] = new MaterialReferenceNode(
        material
      );
    }
  }

  /**
   * Gets a material by name and increments its reference count
   * @param materialName Name of material to retrieve
   * @returns The requested material or undefined if not found
   */
  public static getMaterial(materialName: string): Material | undefined {
    if (MaterialManager._materials[materialName] === undefined) {
      return undefined;
    } else {
      MaterialManager._materials[materialName].referenceCount++;
      return MaterialManager._materials[materialName].material;
    }
  }

  /**
   * Releases a reference to a material
   * Destroys material when reference count reaches 0
   *
   * @param materialName Name of material to release
   * @throws Warning if material not found
   */
  public static releaseMaterial(materialName: string): void {
    if (MaterialManager._materials[materialName] === undefined) {
      console.warn(
        `WARN: Cannot release a material which has not been registered, '${materialName}'.`
      );
    } else {
      MaterialManager._materials[materialName].referenceCount--;
      if (MaterialManager._materials[materialName].referenceCount < 1) {
        MaterialManager._materials[materialName].material.destroy();

        delete MaterialManager._materials[materialName];
      }
    }
  }
}
