import { AssetManager } from "./assets/assetManager";
import { AnimatedSpriteComponentBuilder } from "./assets/components/animatedSpriteComponent";
import { ComponentManager } from "./assets/components/componentManager";
import { SpriteComponentBuilder } from "./assets/components/spriteComponent";
import { AudioManager } from "./audio/audioManager";
import { BehaviourManager } from "./behaviours/behaviourManager";
import { KeyboardMovementBehaviourBuilder } from "./behaviours/keyboardMovementBehaviour";
import { RotationBehaviourBuilder } from "./behaviours/rotationBehaviour";
import { gl, GLUtilities } from "./gl/gl";
import { BasicShader } from "./gl/shaders/basicShader";
import { Color } from "./graphics/color";
import { Material } from "./graphics/material";
import { MaterialManager } from "./graphics/materialManager";
import { InputManager, MouseContext } from "./input/inputManager";
import { Matrix4x4 } from "./math/matrix4x4";
import type { IMessageHandler } from "./message/IMessageHandler";
import { Message } from "./message/message";
import { MessageBus } from "./message/messageBus";
import { ZoneManager } from "./world/zoneManager";

/**
 * Core game engine class implementing the main game loop and systems management
 *
 * Responsibilities:
 * - Initialization and management of all engine subsystems
 * - Game loop execution and timing
 * - Resource management and loading
 * - Rendering pipeline setup
 * - Window and input handling
 */
export class KoruTSEngine implements IMessageHandler {
  /** Counter for tracking frame updates and performance monitoring */
  private _count: number = 0;

  /** Canvas element where WebGL context is created and rendering occurs */
  private _canvas!: HTMLCanvasElement;

  /** Basic shader for 2D sprite rendering */
  private _basicShader!: BasicShader;

  private _previousTime: number = 0;

  /**
   * Orthographic projection matrix
   * Maps game world to screen coordinates
   */
  private _projection!: Matrix4x4;

  /**
   * Creates a new engine instance
   * Note: Actual initialization happens in start()
   */
  public constructor() {}

  /**
   * Initializes engine systems and starts game loop
   *
   * Process:
   * 1. Sets up WebGL context and canvas
   * 2. Initializes asset management
   * 3. Creates and configures shader programs
   * 4. Registers default materials
   * 5. Sets up projection matrix
   * 6. Sets up sprite
   * 7. Starts render loop
   */
  public start(): void {
    // Initialize WebGL context and get canvas reference
    this._canvas = GLUtilities.initialize();

    // Initialize AssetManager
    AssetManager.initialize();

    InputManager.initialize();

    // Initialize ZoneManager
    ZoneManager.initialize();

    // Register Builders
    ComponentManager.registerBuilder(new SpriteComponentBuilder());
    ComponentManager.registerBuilder(new AnimatedSpriteComponentBuilder());

    // Register Behaviours
    BehaviourManager.registerBuilder(new RotationBehaviourBuilder());
    BehaviourManager.registerBuilder(new KeyboardMovementBehaviourBuilder());

    Message.subscribe("MOUSE_UP", this);

    // Set default background color to black (R=0, G=0, B=0, A=1)
    gl.clearColor(0, 0, 0.3, 1);

    // Make background blend - remove background
    gl.enable(gl.BLEND);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Load and activate shader programs for rendering
    this._basicShader = new BasicShader();
    this._basicShader.use();

    // Register material managers
    MaterialManager.registerMaterial(
      new Material("crate", "assets/textures/crate.jpg", Color.white())
    );

    MaterialManager.registerMaterial(
      new Material("duck", "assets/textures/duck.png", Color.white())
    );

    // Register audio managers
    AudioManager.loadSoundFile("flap", "assets/sounds/flap.mp3", false);

    // Configure orthographic projection for 2D rendering
    this._projection = Matrix4x4.orthographic(
      0,
      this._canvas.width,
      this._canvas.height,
      0,
      -100.0,
      100.0
    );

    // TEMPORARY: TO-DO: Change this to read from a game config later
    ZoneManager.changeZone(0);

    // Configure initial viewport and canvas size
    this.resize();

    // Start the main game loop
    this.loop();
  }

  public onMessage(message: Message): void {
    if (message.code === "MOUSE_UP") {
      let context = message.context as MouseContext;
      document.title = `Mouse Position: [${context.position.x}, ${context.position.y}]`;

      AudioManager.playSound("flap");
    }
  }

  /**
   * Main game loop
   * Executes every frame (targeted 60fps)
   *
   * Process:
   * 1. Update message system
   * 2. Update active zone
   * 3. Clear previous frame
   * 4. Update projection uniforms
   * 5. Render current zone
   * 6. Schedule next frame
   */
  private loop(): void {
    this.update();

    this.render();
  }

  private update(): void {
    let delta = performance.now() - this._previousTime;
    // Update message system
    MessageBus.update(delta);

    // Update active zone
    ZoneManager.update(delta);

    this._previousTime = performance.now();
  }

  private render(): void {
    // Clear the color buffer to remove previous frame
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Render active zone
    ZoneManager.render(this._basicShader);

    // Set projection matrix uniform before rendering
    let projectionPosition =
      this._basicShader.getUniformLocation("u_projection");

    gl.uniformMatrix4fv(
      projectionPosition,
      false,
      new Float32Array(this._projection.data)
    );

    // Schedule next frame using requestAnimationFrame
    // bind(this) ensures correct 'this' context in the callback
    requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * Handles window resize events
   *
   * Updates:
   * - Canvas dimensions
   * - WebGL viewport
   * - Projection matrix
   *
   * Note: Called automatically on window resize
   */
  public resize(): void {
    if (this._canvas !== undefined) {
      this._canvas.width = window.innerWidth;
      this._canvas.height = window.innerHeight;

      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      this._projection = Matrix4x4.orthographic(
        0,
        this._canvas.width,
        this._canvas.height,
        0,
        -100.0,
        100.0
      );
    }
  }
}
