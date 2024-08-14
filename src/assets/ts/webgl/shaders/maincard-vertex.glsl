precision mediump float;

uniform float uProgress;
uniform vec2 uViewPortSize;

varying vec2 vUv;

float PI = 3.14159265359;

void main() {
  vUv = uv;

  vec3 pos = position;

  vec4 newPos = modelMatrix * vec4(pos, 1.0);

  newPos.z += (sin(newPos.y / uViewPortSize.y * PI + PI / 2.) * sin(newPos.x / uViewPortSize.x * PI + PI / 2.)) * uProgress * 1.5;

  gl_Position = projectionMatrix * viewMatrix * newPos;
}
