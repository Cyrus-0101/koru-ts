import { gl } from "../gl/gl";
import { AttributeInfo, GLBuffer } from "../gl/glBuffer";
import type { Shader } from "../gl/shaders";
import { Matrix4x4 } from "../math/matrix4x4";
import { Vector3 } from "../math/vector3";
import { Material } from "./material";
import { MaterialManager } from "./materialManager";

/**
 * Sprite - 2D textured quad renderer with material support
 *
 * Features:
 * - Material-based rendering
 * - Vertex buffer management
 * - Position transformation
 * - UV coordinate mapping
 * - Reference-counted textures
 *
 * Memory Layout (per vertex):
 * - Position: vec3 (x, y, z) offset: 0
 * - TexCoord: vec2 (u, v)    offset: 3
 *
 * Shader Requirements:
 * Uniforms:
 * - u_model: Model transformation matrix - mat4       // Model transformation
 * - u_tint: Color tint (vec4)            - vec4       // Material Color Tint
 * - u_diffuse: Texture sampler           - sampler2D  // Texture Unit 0
 *
 * Attributes:
 * - a_position: vec3  // location 0
 * - a_texCoord: vec2  // location 1
 */
export class Sprite {
  /** Unique identifier for this sprite instance */
  private _name: string;

  /** Width in pixels/units */
  private _width: number;

  /** Height in pixels/units */
  private _height: number;

  /** GPU vertex buffer containing positions and UVs */
  private _buffer!: GLBuffer;

  /** Position in world space */
  public position: Vector3 = new Vector3();

  /** Reference to material for rendering */
  private _material: Material | undefined;

  /** Identifier for material lookup */
  private _materialName: string | undefined;

  /**
   * Creates a new sprite instance
   * @param name Unique identifier for this sprite
   * @param materialName The name of the material to use with the sprite
   * @param width Width in pixels/units (default: 100)
   * @param height Height in pixels/units (default: 100)
   */
  public constructor(
    name: string,
    materialName: string,
    width: number = 100,
    height: number = 100
  ) {
    this._name = name;
    this._width = width;
    this._height = height;

    this._materialName = materialName;

    this._material = MaterialManager.getMaterial(this._materialName);
  }

  /**
   * Initializes sprite geometry and GPU resources
   * - Creates vertex buffer with interleaved data
   * - Sets up attribute pointers for shader
   * - Uploads quad geometry with UVs
   * - Configures winding order for face culling
   */
  public load(): void {
    // Create a new buffer object in GPU memory with 3 components per vertex (x,y,z)
    this._buffer = new GLBuffer(5);

    // Configure vertex position attribute for the shader
    let positionAttribute = new AttributeInfo();

    // Get location of a_position attribute from shader program
    positionAttribute.location = 0;

    // Set offset to 0 (start of vertex data)
    positionAttribute.offset = 0;

    // Each position has 3 components (x, y, z)
    positionAttribute.size = 3;

    // Register attribute with buffer for automatic setup during binding
    this._buffer.addAttributeLocation(positionAttribute);

    let texCoordAttributes = new AttributeInfo();

    texCoordAttributes.location = 1;

    texCoordAttributes.offset = 3;

    // Each position has 3 components (U, V or x, y)
    texCoordAttributes.size = 2;

    // Register attribute with buffer for automatic setup during binding
    this._buffer.addAttributeLocation(texCoordAttributes);

    // Define quad vertices using two triangles
    // Counter-clockwise winding order for proper face culling
    let vertices = [
      // First triangle (bottom-left, top-left, top-right - x,y,z)  (U, V)
      0.0,
      0.0,
      0.0, // Vertex 1: bottom-left
      0.0,
      0.0,
      0.0,
      this._height,
      0.0, // Vertex 2: top-left
      0.0,
      1.0,
      this._width,
      this._height,
      0.0, // Vertex 3: top-right
      1.0,
      1.0,

      // Second triangle (top-right, bottom-right, bottom-left)
      this._width,
      this._height,
      0.0, // Vertex 4: top-right
      1.0,
      1.0,
      this._width,
      0.0,
      0.0, // Vertex 5: bottom-right
      1.0,
      0.0,
      0.0,
      0.0,
      0.0, // Vertex 6: bottom-left
      0.0,
      0.0,
    ];

    // Upload vertex data to GPU memory
    this._buffer.pushBackData(vertices);

    this._buffer.upload();

    // Unbind buffer to prevent accidental modifications
    this._buffer.unbind();
  }

  /**
   * Gets the sprite's unique identifier
   * @returns The sprite's name
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Cleans up sprite resources
   * - Destroys vertex buffer in GPU Memory
   * - Releases material reference
   * - Clears material references
   *
   * Should be called when sprite is no longer needed
   */
  public destroy(): void {
    this._buffer.destroy();
    MaterialManager.releaseMaterial(this._materialName!);

    this._material = undefined;
    this._materialName = undefined;
  }

  /**
   * Updates routines on sprite state
   * Called each frame by the game engine
   *
   * @param time Current game time in milliseconds
   *
   * TODO: Add animation and movement updates
   */
  public update(time: number): void {}

  /**
   * Renders sprite using provided shader
   *
   * Pipeline:
   * 1. Update model matrix with position
   * 2. Set material color tint
   * 3. Bind diffuse texture to unit 0
   * 4. Configure texture sampler
   * 5. Draw vertex buffer
   *
   * @param shader Shader to use for rendering
   */
  public draw(shader: Shader): void {
    // Update model matrix with current position
    let modelLocation = shader.getUniformLocation("u_model");
    gl.uniformMatrix4fv(
      // Translate Z
      modelLocation,
      false,
      new Float32Array(Matrix4x4.translation(this.position).data)
    );

    // Set color tint (currently orange)
    let colorLocation = shader.getUniformLocation("u_tint");

    gl.uniform4fv(
      colorLocation,
      this._material?.tint?.toFloat32Array() ?? new Float32Array([1, 0.5, 0, 1])
    ); // Default to orange if no material/tint

    if (this._material?.diffuseTexture !== undefined) {
      // Activate and bind texture for this sprite
      this._material.diffuseTexture.activateAndBind(0);

      // u_diffuse in fragment shader samples from this unit
      let diffuseLocation = shader.getUniformLocation("u_diffuse");
      gl.uniform1i(diffuseLocation, 0);
    }

    // Bind buffer
    this._buffer.bind();

    // Draw quad
    this._buffer.draw();
  }
}
