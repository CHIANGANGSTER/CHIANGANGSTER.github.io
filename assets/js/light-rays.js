(function () {
  if (window.__kbLightRays) return;
  window.__kbLightRays = true;

  (function initLightRays() {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:1;pointer-events:none;overflow:hidden;';
    document.body.appendChild(wrap);

    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    wrap.appendChild(canvas);

    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    var vert = [
      'attribute vec2 a_pos;',
      'void main(){gl_Position=vec4(a_pos,0.,1.);}',
    ].join('\n');

    var frag = [
      'precision highp float;',
      'uniform float iTime;',
      'uniform vec2 iRes;',
      'uniform vec2 rayPos;',
      'uniform vec2 rayDir;',
      'uniform vec2 mousePos;',
      'uniform float mouseInfluence;',
      'uniform float lightSpread;',
      'uniform float rayLength;',
      'uniform float fadeDistance;',
      'uniform float raysSpeed;',

      'float rayStrength(vec2 src,vec2 refDir,vec2 coord,float sA,float sB,float spd){',
      '  vec2 d=coord-src;',
      '  float cosA=dot(normalize(d),refDir);',
      '  float spread=pow(max(cosA,0.),1./max(lightSpread,0.001));',
      '  float dist=length(d);',
      '  float maxD=iRes.x*rayLength;',
      '  float lenFall=clamp((maxD-dist)/maxD,0.,1.);',
      '  float fadeFall=clamp((iRes.x*fadeDistance-dist)/(iRes.x*fadeDistance),0.5,1.);',
      '  float base=clamp(',
      '    (0.45+0.15*sin(cosA*sA+iTime*spd))+(0.3+0.2*cos(-cosA*sB+iTime*spd)),',
      '    0.,1.);',
      '  return base*lenFall*fadeFall*spread;',
      '}',

      'void main(){',
      '  vec2 coord=vec2(gl_FragCoord.x,iRes.y-gl_FragCoord.y);',
      '  vec2 dir=rayDir;',
      '  if(mouseInfluence>0.){',
      '    vec2 mp=mousePos*iRes;',
      '    dir=normalize(mix(rayDir,normalize(mp-rayPos),mouseInfluence));',
      '  }',
      '  float r1=rayStrength(rayPos,dir,coord,36.2214,21.1135,1.5*raysSpeed);',
      '  float r2=rayStrength(rayPos,dir,coord,22.3991,18.0234,1.1*raysSpeed);',
      '  float v=r1*0.5+r2*0.4;',
      '  float bright=1.-(coord.y/iRes.y);',
      '  float tone=0.55+bright*0.45;',
      '  float r=v*tone;',
      '  float g=v*tone;',
      '  float b=v*tone;',
      '  gl_FragColor=vec4(r,g,b,v*0.7);',
      '}',
    ].join('\n');

    function compile(type, src) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      return shader;
    }

    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var uTime = gl.getUniformLocation(prog, 'iTime');
    var uRes = gl.getUniformLocation(prog, 'iRes');
    var uRayPos = gl.getUniformLocation(prog, 'rayPos');
    var uRayDir = gl.getUniformLocation(prog, 'rayDir');
    var uMouse = gl.getUniformLocation(prog, 'mousePos');
    var uMouseInf = gl.getUniformLocation(prog, 'mouseInfluence');
    var uSpread = gl.getUniformLocation(prog, 'lightSpread');
    var uLength = gl.getUniformLocation(prog, 'rayLength');
    var uFade = gl.getUniformLocation(prog, 'fadeDistance');
    var uSpeed = gl.getUniformLocation(prog, 'raysSpeed');

    gl.uniform1f(uMouseInf, 0.1);
    gl.uniform1f(uSpread, 0.5);
    gl.uniform1f(uLength, 3.0);
    gl.uniform1f(uFade, 1.0);
    gl.uniform1f(uSpeed, 1.0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    var mouse = { x: 0.5, y: 0.5 };
    var smoothMouse = { x: 0.5, y: 0.5 };
    window.addEventListener('mousemove', function (event) {
      mouse.x = event.clientX / window.innerWidth;
      mouse.y = event.clientY / window.innerHeight;
    });

    function resize() {
      var dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uRayPos, canvas.width * 0.5, -canvas.height * 0.2);
      gl.uniform2f(uRayDir, 0.0, 1.0);
    }

    resize();
    window.addEventListener('resize', resize);

    var start = performance.now();
    (function loop() {
      var t = (performance.now() - start) * 0.001;
      smoothMouse.x += (mouse.x - smoothMouse.x) * 0.08;
      smoothMouse.y += (mouse.y - smoothMouse.y) * 0.08;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, smoothMouse.x, 1.0 - smoothMouse.y);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(loop);
    })();
  })();
})();
