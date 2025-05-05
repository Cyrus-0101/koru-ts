/**
 * Basic vertex shader
 * Transforms vertices using projection and model matrices
 */
export const vertexShaderSource = `
attribute vec3 a_position;

attribute vec2 a_texCoord;

uniform mat4 u_projection;

uniform mat4 u_model;

varying vec2 v_texCoord;

void main() {
    gl_Position = u_projection * u_model * vec4(a_position, 1.0);
    v_texCoord = a_texCoord;
}`;
