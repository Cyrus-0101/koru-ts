import { Shader } from "../shaders";
import { fragmentShaderSource } from "./basic.frag";
import { vertexShaderSource } from "./basic.vert";

/**
 * BasicShader - Default shader implementation for 2D rendering
 *
 * Features:
 * - Basic vertex transformation
 * - Texture coordinate handling
 * - Color tinting support
 *
 * Uniforms:
 * - u_projection: Projection matrix
 * - u_model: Model transformation matrix
 * - u_tint: Color tint (vec4)
 *
 * Attributes:
 * - a_position: Vertex position (vec3)
 * - a_texCoord: Texture coordinates (vec2)
 */
export class BasicShader extends Shader {
  public constructor() {
    super("basic");

    this.load(this.getVertexSource(), this.getFragmentSource());
  }

  private getVertexSource(): string {
    return vertexShaderSource;
  }

  private getFragmentSource(): string {
    return fragmentShaderSource;
  }
}
