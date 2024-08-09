vec2 optimizationTextureUv(vec2 uv, float polygonAspect, float textureAspect) {
  vec2 ratio = vec2(min(polygonAspect / textureAspect, 1.0), (min((1.0 / polygonAspect) / (1.0 / textureAspect), 1.0)));

  return vec2(((uv.x - 0.5) * ratio.x + 0.5), ((uv.y - 0.5) * ratio.y + 0.5));
}
