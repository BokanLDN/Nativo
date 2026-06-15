/* ── Shared shader sources ─────────────────────────────────── */
const vert = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const frag = `
  precision mediump float;
  uniform float  uTime;
  uniform vec2   uResolution;

  vec3 c1 = vec3(1.000, 0.851, 0.922); // #ffd9eb
  vec3 c2 = vec3(0.859, 0.729, 0.584); // #dbba95
  vec3 c3 = vec3(0.882, 0.804, 0.761); // #e1cdc2

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),                 hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p *= 2.0; a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution;

    float angle = 50.0 * 3.14159265 / 180.0;
    float cosA = cos(angle), sinA = sin(angle);
    vec2 ruv = vec2(
      uv.x * cosA - uv.y * sinA,
      uv.x * sinA + uv.y * cosA
    );

    float t  = uTime * 0.2;
    float n1 = fbm(ruv * 5.5 + vec2(t * 0.40, t * 0.15));
    float n2 = fbm(ruv * 3.5 - vec2(t * 0.20, t * 0.35));
    float n3 = fbm(ruv * 4.0 + vec2(t * 0.10, t * 0.50));

    n1 = clamp(n1 * 7.1 * 0.25, 0.0, 1.0);
    n2 = clamp(n2 * 7.1 * 0.20, 0.0, 1.0);

    vec3 col = mix(c1, c2, n1);
    col      = mix(col, c3, n2 * 0.75);
    col      = mix(col, c1, n3 * 0.25);

    col *= 1.2;
    col  = clamp(col, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ── Init one canvas ───────────────────────────────────────── */
function initGradient(canvas) {
  const gl = canvas.getContext("webgl");
  if (!gl) return;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vert));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const pos = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const uTime       = gl.getUniformLocation(program, "uTime");
  const uResolution = gl.getUniformLocation(program, "uResolution");

  function resize() {
    const w = canvas.clientWidth  * window.devicePixelRatio;
    const h = canvas.clientHeight * window.devicePixelRatio;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  let start = null;
  function render(ts) {
    if (!start) start = ts;
    resize();
    gl.uniform1f(uTime, (ts - start) / 1000);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

/* ── Boot on every .gradient-canvas ───────────────────────── */
document.querySelectorAll(".gradient-canvas").forEach(initGradient);
