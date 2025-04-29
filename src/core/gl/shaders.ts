import { gl } from "./gl";

/**
 * Shader class handles the compilation and management of WebGL shader programs
 * Shaders are small programs that run on the GPU and determine how objects are rendered
 *
 * Two main types of shaders:
 * 1. Vertex Shader: Processes vertex data (positions, normals, etc.)
 *    - Transforms 3D coordinates into 2D screen coordinates
 *    - Handles vertex-level calculations (position, lighting, etc.)
 *
 * 2. Fragment Shader (Pixel Shader): Processes pixel-level data
 *    - Determines the final color of each pixel
 *    - Handles texturing, lighting calculations, and effects
 */
export class Shader {
  /** Name identifier for the shader program */
  private _name: string;

  /** WebGL program object that combines vertex and fragment shaders */
  private _program!: WebGLProgram;

  /**
   * Creates a new shader program
   * @param name Identifier for the shader program
   * @param vertexSource GLSL source code for the vertex shader
   * @param fragmentSource GLSL source code for the fragment shader
   */
  public constructor(
    name: string,
    vertexSource: string,
    fragmentSource: string
  ) {
    this._name = name;
    // Compile both vertex and fragment shaders
    let vertexShader = this.loadShader(vertexSource, gl.VERTEX_SHADER);
    let fragmentShader = this.loadShader(fragmentSource, gl.FRAGMENT_SHADER);

    // Create and link the shader program
    this.createProgram(vertexShader, fragmentShader);
  }

  /**
   * Gets the name of the shader program
   * @returns The shader program's identifier
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Activates this shader program for rendering
   * Makes this shader the active program in the WebGL context
   */
  public use(): void {
    gl.useProgram(this._program);
  }

  /**
   * Loads and compiles a shader from source code
   * @param source GLSL source code for the shader
   * @param shaderType Type of shader (vertex or fragment)
   * @returns Compiled WebGL shader object
   * @throws Error if shader creation or compilation fails
   */
  private loadShader(source: string, shaderType: number): WebGLShader {
    // Create a new shader object
    let shader = gl.createShader(shaderType);
    if (!shader) {
      throw new Error("Unable to create shader");
    }

    // Set the shader source code and compile it
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Check for compilation errors
    let error = gl.getShaderInfoLog(shader);
    if (error !== "") {
      throw new Error("Error compiling shader: " + this._name + ": " + error);
    }

    return shader;
  }

  /**
   * Creates and links a WebGL program from compiled shaders
   * @param vertexShader Compiled vertex shader
   * @param fragmentShader Compiled fragment shader
   * @throws Error if program linking fails
   */
  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): void {
    // Create a new WebGL program
    this._program = gl.createProgram();

    // Attach both shaders to the program
    gl.attachShader(this._program, vertexShader);
    gl.attachShader(this._program, fragmentShader);

    // Link the program
    gl.linkProgram(this._program);

    // Check for linking errors
    let error = gl.getProgramInfoLog(this._program);
    if (error !== "") {
      throw new Error("Error linking shader: " + this._name + ": " + error);
    }
  }
}
