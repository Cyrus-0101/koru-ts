import {
  AssetManager,
  MESSAGE_ASSET_LOADER_ASSET_LOADED,
} from "../assets/assetManager";
import type { JsonAsset } from "../assets/jsonAssetLoader";
import type { Shader } from "../gl/shaders";
import type { IMessageHandler } from "../message/IMessageHandler";
import { Message } from "../message/message";
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
export class ZoneManager implements IMessageHandler {
  /** Map of zone IDs to zone instances */
  // private static _zones: { [id: number]: Zone } = {};

  private static _registeredZones: { [id: number]: string } = {};

  /** Currently active zone */
  private static _activeZone: Zone | undefined;

  private static _inst: ZoneManager;

  /** Prevents instantiation - all methods are static */
  private constructor() {}

  public static initialize(): void {
    ZoneManager._inst = new ZoneManager();

    // Temporary.
    ZoneManager._registeredZones[0] = "assets/zones/testZone.json";
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

      ZoneManager._activeZone = undefined;
    }

    if (ZoneManager._registeredZones[id] !== undefined) {
      if (AssetManager.isAssetLoaded(ZoneManager._registeredZones[id])) {
        let asset = AssetManager.getAsset(ZoneManager._registeredZones[id]);

        if (asset !== undefined) {
          ZoneManager.loadZone(asset);
        }
      } else {
        Message.subscribe(
          MESSAGE_ASSET_LOADER_ASSET_LOADED + ZoneManager._registeredZones[id],
          ZoneManager._inst
        );

        AssetManager.loadAsset(ZoneManager._registeredZones[id]);
      }
    } else {
      throw new Error(`Zone ID: '${id.toString()}' does not exist.`);
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

  /**
   * Message handler for asset loading events
   * Processes zone asset load completion
   *
   * @param message Message containing loaded asset data
   * @implements {IMessageHandler}
   */
  public onMessage(message: Message): void {
    if (message.code.indexOf(MESSAGE_ASSET_LOADER_ASSET_LOADED) !== -1) {
      let asset = message.context as JsonAsset;

      ZoneManager.loadZone(asset);
    }
  }

  /**
   * Creates and initializes a new zone from loaded JSON asset data
   *
   * Performs zone lifecycle:
   * - Creates zone instance
   * - Initializes from JSON
   * - Activates zone
   * - Loads resources
   *
   * @param asset JsonAsset containing zone configuration data
   * @throws Error if required zone properties are missing
   *
   * @example
   * ZoneManager.loadZone({
   *   data: {
   *     id: 1,
   *     name: "Forest Zone",
   *     description: "A dense forest area"
   *   }
   * });
   */
  private static loadZone(asset: JsonAsset): void {
    // Create zone based on JSON data
    let zoneData = asset.data;

    let zoneId: number;
    let zoneName: string;
    let zoneDescription: string;

    if (zoneData.id === undefined) {
      throw new Error("Zone file format exception: Zone ID not present.");
    } else {
      zoneId = Number(zoneData.id);
    }

    if (zoneData.name === undefined) {
      throw new Error("Zone file format exception: Zone name not present.");
    } else {
      zoneName = String(zoneData.name);
    }

    if (zoneData.description !== undefined) {
      zoneDescription = String(zoneData.description);
    } else {
      zoneDescription = "";
    }

    ZoneManager._activeZone = new Zone(zoneId, zoneName, zoneDescription);
    ZoneManager._activeZone.initialize(zoneData);
    ZoneManager._activeZone.onActivated();
    ZoneManager._activeZone.load();
  }
}
