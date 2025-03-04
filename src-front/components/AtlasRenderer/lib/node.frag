uniform vec3 uColor;
in vec2 vUv;

float sdEquilateralTriangle(in vec2 p, in float r) {
    const float k = sqrt(3.0f);
    p.x = abs(p.x);
    p -= vec2(0.5f, 0.5f * k) * max(p.x + k * p.y, 0.0f);
    p.x = p.x - clamp(p.x, -r, r);
    p.y = -p.y - r * (1.0f / k);
    return length(p) * sign(p.y);
}

// shader applies anti-aliasing using the smoothstep() for this to work the shadermaterial needs to have transparency (transparent prop -> r3f) enabled
void main() {
    vec2 uv = vUv * 2.0f - 1.0f;
    uv.y += 0.25f; // Shift downward to center
    float d = sdEquilateralTriangle(uv, 1.0f);
    float width = fwidth(d);
    float alpha = 1.0f - smoothstep(0.0f, width, d);
    if(alpha <= 0.0f)
        discard;
    pc_fragColor = vec4(uColor, alpha);
}
