// Global WebGL rendering context that will be used across the engine
export let gl: WebGLRenderingContext;

/**
 * Utility class providing WebGL initialization and helper functions
 */
export class GLUtilities {
  /**
   * Initializes WebGL context and sets up the canvas
   * @param elementId Optional ID of existing canvas element
   * @returns The initialized canvas element
   * @throws Error if canvas element cannot be found or WebGL context cannot be initialized
   */
  public static initialize(elementId?: string): HTMLCanvasElement {
    let canvas: HTMLCanvasElement;

    // If elementId is provided, try to get existing canvas, otherwise create new one
    if (elementId !== undefined) {
      canvas = document.getElementById(elementId) as HTMLCanvasElement;

      if (canvas === undefined) {
        throw new Error("Cannot find a canvas element named: " + elementId);
      }
    } else {
      canvas = document.createElement("canvas") as HTMLCanvasElement;
      document.body.appendChild(canvas);
    }

    // Get WebGL context, null check is necessary as getContext can return null
    const context = canvas.getContext("webgl");

    if (context === null) {
      throw new Error("Unable to initialize WebGL!");
    }

    gl = context;

    return canvas;
  }
}
