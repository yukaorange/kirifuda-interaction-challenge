precision mediump float;

uniform float uAlpha;
uniform float uAspect;
uniform float uTextureAspect;

#include "./utils/optimizeUv.glsl"

uniform sampler2D uTexture;
uniform float uProgress;
uniform bool uMain;

varying vec2 vUv;

void main() {

  vec2 uv = optimizationTextureUv(vUv, uAspect, uTextureAspect);

  uv = vUv;

  vec3 color = texture2D(uTexture, uv).rgb;

  if(uMain) {
    color *= vec3(1.0);
  } else {
    color *= vec3(uProgress);
  }

  gl_FragColor = vec4(color, 1.0);
}
