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
 * ZoneManager - Central controller for game zones/levels
 *
 * Implements the singleton pattern to manage:
 * - Zone lifecycle (loading, activation, unloading)
 * - Zone transitions
 * - Active zone state
 * - Zone resource management
 *
 * @implements IMessageHandler For handling asset load notifications
 *
 * @example
 * // Initialize the manager
 * ZoneManager.initialize();
 *
 * // Load and activate a zone
 * ZoneManager.changeZone(1);
 *
 * // In game loop:
 * ZoneManager.update(deltaTime);
 * ZoneManager.render(mainShader);
 */
export class ZoneManager implements IMessageHandler {
  /** Next available zone ID counter */
  private static _globalZoneID: number = -1;

  /** Registry of zone IDs to their asset paths */
  private static _registeredZones: { [id: number]: string } = {};

  /** Currently active zone instance */
  private static _activeZone: Zone | undefined;

  /** Singleton instance for message handling */
  private static _inst: ZoneManager;

  private constructor() {} // Enforce singleton pattern

  /**
   * Initializes the ZoneManager system
   * - Creates singleton instance
   * - Registers default test zone
   */
  public static initialize(): void {
    ZoneManager._inst = new ZoneManager();

    // TEMPORARY
    ZoneManager._registeredZones[0] = "assets/zones/testZone.json"; // Default test zone
  }

  /**
   * Transitions to a new active zone
   * - Handles cleanup of current zone
   * - Loads new zone assets if needed
   * - Manages zone activation lifecycle
   *
   * @param id The ID of the zone to activate
   * @throws Error if zone ID doesn't exist
   */
  public static changeZone(id: number): void {
    // Clean up current zone
    if (ZoneManager._activeZone) {
      ZoneManager._activeZone.onDeactivated();
      ZoneManager._activeZone.unLoad();
      ZoneManager._activeZone = undefined;
    }

    // Validate and load new zone
    const zoneAssetPath = ZoneManager._registeredZones[id];
    if (!zoneAssetPath) {
      throw new Error(`ERROR: Zone ID '${id}' not registered`);
    }

    if (AssetManager.isAssetLoaded(zoneAssetPath)) {
      ZoneManager.loadZone(AssetManager.getAsset(zoneAssetPath)!);
    } else {
      Message.subscribe(
        `${MESSAGE_ASSET_LOADER_ASSET_LOADED}${zoneAssetPath}`,
        ZoneManager._inst
      );
      AssetManager.loadAsset(zoneAssetPath);
    }
  }

  /**
   * Updates the active zone's game state
   * @param time Delta time in milliseconds since last update
   */
  public static update(time: number): void {
    ZoneManager._activeZone?.update(time);
  }

  /**
   * Renders the active zone
   * @param shader The shader program to use for rendering
   */
  public static render(shader: Shader): void {
    ZoneManager._activeZone?.render(shader);
  }

  /**
   * Handles asset load completion messages
   * @param message The incoming message with load data
   */
  public onMessage(message: Message): void {
    if (message.code.includes(MESSAGE_ASSET_LOADER_ASSET_LOADED)) {
      ZoneManager.loadZone(message.context as JsonAsset);
    }
  }

  /**
   * Instantiates and activates a zone from loaded asset data
   * @param asset The JSON asset containing zone configuration
   * @throws Error if required zone data is missing
   */
  private static loadZone(asset: JsonAsset): void {
    const { id, name, description } = this.validateZoneData(asset.data);

    ZoneManager._activeZone = new Zone(id, name, description ?? "");
    ZoneManager._activeZone.initialize(asset.data);
    ZoneManager._activeZone.onActivated();
    ZoneManager._activeZone.load();
  }

  /**
   * Validates and extracts required zone data from JSON
   * @param zoneData The raw zone configuration data
   * @returns Validated zone parameters
   * @throws Error if required fields are missing
   */
  private static validateZoneData(zoneData: any): {
    id: number;
    name: string;
    description?: string;
  } {
    if (zoneData.id === undefined) throw new Error("ERROR: Missing zone ID");
    if (zoneData.name === undefined)
      throw new Error("ERROR: Missing zone name");

    return {
      id: Number(zoneData.id),
      name: String(zoneData.name),
      description: zoneData.description
        ? String(zoneData.description)
        : undefined,
    };
  }
}
