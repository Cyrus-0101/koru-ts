import type { Shader } from "../gl/shaders";
import { TestZone } from "./TestZone";
import { Zone } from "./zone";

/**
 * ZoneManager - Singleton manager for game zones/levels
 *
 * Features:
 * - Zone creation and management
 * - Unique zone ID generation
 * - Single active zone tracking
 * - Zone state management
 * - Zone transitions
 *
 * Usage:
 * ```typescript
 * // Create and change to new zone
 * const forestId = ZoneManager.createZone("Forest", "A dense forest area");
 * ZoneManager.changeZone(forestId);
 *
 * // Update and render active zone
 * ZoneManager.update(time);
 * ZoneManager.render(shader);
 * ```
 */
export class ZoneManager {
  /** Global counter for generating unique zone IDs */
  private static _globalZoneID: number = -1;

  /** Map of zone IDs to zone instances */
  private static _zones: { [id: number]: Zone } = {};

  /** Currently active zone */
  private static _activeZone: Zone | undefined;

  /** Prevents instantiation - all methods are static */
  private constructor() {}

  /**
   * Creates a new zone and assigns unique ID
   * @param name Display name for the zone
   * @param description Zone description text
   * @returns Assigned zone ID for future reference
   */
  public static createZone(name: string, description: string): number {
    ZoneManager._globalZoneID++;

    let zone = new Zone(ZoneManager._globalZoneID, name, description);

    ZoneManager._zones[ZoneManager._globalZoneID] = zone;

    return ZoneManager._globalZoneID;
  }

  // TO-DO: Temporary class until file loading is supported
  public static createTestZone(): number {
    ZoneManager._globalZoneID++;

    let zone = new TestZone(
      ZoneManager._globalZoneID,
      "test",
      "A simple test zone"
    );

    ZoneManager._zones[ZoneManager._globalZoneID] = zone;

    return ZoneManager._globalZoneID;
  }

  /**
   * Changes active zone with proper lifecycle handling
   * - Deactivates current zone if one exists
   * - Activates new zone if found
   * - Maintains undefined if zone not found
   *
   * @param id ID of zone to activate
   */
  public static changeZone(id: number): void {
    if (ZoneManager._activeZone !== undefined) {
      ZoneManager._activeZone.onDeactivated();
      ZoneManager._activeZone.unLoad();
    }

    if (ZoneManager._zones[id] !== undefined) {
      ZoneManager._activeZone = ZoneManager._zones[id];
      ZoneManager._activeZone.onActivated();
      ZoneManager._activeZone.load();
    }
  }

  /**
   * Updates currently active zone if one exists
   * Called each frame during game loop
   *
   * @param time Current engine time in milliseconds
   */
  public static update(time: number): void {
    if (ZoneManager._activeZone !== undefined) {
      ZoneManager._activeZone.update(time);
    }
  }

  /**
   * Renders currently active zone if one exists
   * Called each frame after update
   *
   * @param shader Shader to use for rendering pass
   */
  public static render(shader: Shader): void {
    if (ZoneManager._activeZone !== undefined) {
      ZoneManager._activeZone.render(shader);
    }
  }
}
