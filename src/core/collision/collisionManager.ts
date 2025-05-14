import type { CollisionComponent } from "../components/collisionComponent";
import { Message } from "../message/message";

export class CollisionData {
  public a: CollisionComponent;
  public b: CollisionComponent;
  public time: number;

  public constructor(
    time: number,
    a: CollisionComponent,
    b: CollisionComponent
  ) {
    this.time = time;
    this.a = a;
    this.b = b;
  }
}

/**
 * CollisionManager - Central controller for game collisions
 *
 * Implements the singleton pattern to manage:
 * - Collision registration/removal system
 * - Update Collision Entry and Exit intersections
 *
 * @example
 * ```typescript
    let col = new CollisionData(
      CollisionManager._totalTime,
      comp,
      other
    );

    // Collision Entry

    comp.onCollisionEntry(other);
    other.onCollisionEntry(comp);
    
    CollisionManager._collisionData.push(col);

    ...

    // Collision Exit
    while (removeData.length !== 0) {
      let data = removeData.shift()!;
      let index = CollisionManager._collisionData.indexOf(data);
      CollisionManager._collisionData.splice(index, 1);

      data.a.onCollisionExit(data.b);
      data.b.onCollisionExit(data.a);
    }
 * ```
 */
export class CollisionManager {
  private static _collisionComponents: CollisionComponent[] = [];
  private static _collisionData: CollisionData[] = [];
  private static _totalTime: number = 0;

  private constructor() {}

  public static registerCollisionComponent(
    component: CollisionComponent
  ): void {
    CollisionManager._collisionComponents.push(component);
  }

  public static unRegisterCollisionComponent(
    component: CollisionComponent
  ): void {
    let index = CollisionManager._collisionComponents.indexOf(component);

    if (index !== -1) {
      CollisionManager._collisionComponents.slice(index, 1);
    }
  }

  public static clear(): void {
    CollisionManager._collisionComponents.length = 0;
  }

  // TO-DO: Implement optimal method - SubPar - Need to implement sort and sleep method later
  public static update(time: number): void {
    CollisionManager._totalTime += time;

    for (let c = 0; c < CollisionManager._collisionComponents.length; ++c) {
      let comp = CollisionManager._collisionComponents[c];

      for (
        let ob = 0;
        ob < CollisionManager._collisionComponents.length;
        ++ob
      ) {
        let other = CollisionManager._collisionComponents[ob];

        // Do not check against collisions with self
        if (comp === other) {
          continue;
        }

        // If both shapes are static, stop detection.
        if (comp.isStatic && other.isStatic) {
          continue;
        }

        if (comp.shape.intersects(other.shape)) {
          // Collision Detetcted!
          let exists: boolean = false;

          for (let d = 0; d < CollisionManager._collisionData.length; ++d) {
            let data = CollisionManager._collisionData[d];

            if (
              (data.a === comp && data.b === other) ||
              (data.a === other && data.b === comp)
            ) {
              // Existing data needs to be updated
              comp.onCollisionUpdate(other);
              other.onCollisionUpdate(comp);

              data.time = CollisionManager._totalTime;
              exists = true;

              break;
            }
          }

          if (!exists) {
            // Create new collision
            let col = new CollisionData(
              CollisionManager._totalTime,
              comp,
              other
            );

            comp.onCollisionEntry(other);
            other.onCollisionEntry(comp);

            Message.sendPriority("COLLISION_ENTRY: " + comp.name, this, col);
            Message.sendPriority("COLLISION_ENTRY: " + other.name, this, col);

            this._collisionData.push(col);
          }
        }
      }
    }

    /**
     * Detetct collisions that happened but were never updated
     * Create list to push data after an update
     * Maybe reverse loop to avoid overhead
     * Removing old collision data
     *
     */
    let removeData: CollisionData[] = [];

    for (let d = 0; d < CollisionManager._collisionData.length; ++d) {
      let data = CollisionManager._collisionData[d];

      if (data.time !== CollisionManager._totalTime) {
        // Old Coliision Data
        removeData.push(data);
      }
    }

    while (removeData.length !== 0) {
      let data = removeData.shift()!;
      let index = CollisionManager._collisionData.indexOf(data);

      CollisionManager._collisionData.splice(index, 1);

      data.a.onCollisionExit(data.b);
      data.b.onCollisionExit(data.a);

      Message.sendPriority("COLLISION_EXIT: " + data.a.name, this, data);
      Message.sendPriority("COLLISION_EXIT: " + data.b.name, this, data);
    }
  }
}
