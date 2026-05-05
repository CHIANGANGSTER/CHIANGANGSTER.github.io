# Chair Spin Logic Backup - 2026-04-29

This file preserves the current local chair rotation contract so future edits can restore the behavior without re-reading the remote repository.

Remote reference requested by user:
- `https://github.com/CHIANGANGSTER/CHIANGANGSTER.github.io/tree/master`

Network note:
- The local sandbox could not fetch `https://raw.githubusercontent.com/CHIANGANGSTER/CHIANGANGSTER.github.io/master/index.html` during this session.
- Two escalated fetch attempts timed out in approval review.
- The backup below is therefore the current local rotation logic and the intended restore contract.

## Spinner Contract

`Spinner` owns accumulated chair rotation:

```js
this.spin = { x: 0, y: 0 };
this.velocity = { x: 0.005, y: 0.005 };
this.pointerDown = false;
this.pointer = { x: 0, y: 0 };
this.mouse = { x: 0, y: 0, mx: 0, my: 0, ww: window.innerWidth, wh: window.innerHeight };
this.coeff = isMobile ? 0.0015 : 0.0005;
this.smoothScroll = window.scrollY;
this.scrollSpeed = 0;
```

Pointer drag adds to velocity:

```js
this.velocity.x += (cx - this.pointer.x) * this.coeff;
this.velocity.y += (cy - this.pointer.y) * this.coeff;
```

Per-frame update damps velocity, eases mouse wobble, then accumulates spin:

```js
this.velocity.x *= 0.95;
this.velocity.y *= 0.95;
this.mouse.mx = _lerp(this.mouse.mx, this.velocity.x, 0.1);
this.mouse.my = _lerp(this.mouse.my, this.velocity.y, 0.1);
this.spin.x += this.velocity.x + Math.sign(this.velocity.x) * this.coeff * (1 - Number(this.pointerDown));
this.spin.y += this.velocity.y + Math.sign(this.velocity.y) * this.coeff * (1 - Number(this.pointerDown));
this.spin.y += this.scrollSpeed * 0.002;
this.spin.x += this.scrollSpeed * 0.002;
```

## Render Contract

After intro is complete, the app applies the accumulated spinner values directly:

```js
this.outerContainer.rotation.z = this.spinner.mouse.mx;
this.outerContainer.rotation.x = this.spinner.mouse.mx;
this.outerContainer.rotation.y = this.spinner.mouse.my;
this.innerMesh.rotation.x = this.spinner.spin.y;
this.innerMesh.rotation.y = this.spinner.spin.x;
```

## Intro Handoff

During intro, liquid velocity is forced to zero to avoid click jitter:

```js
this.postMaterial.uniforms.u_a_vel.value = 0;
```

When intro finishes, normalize the visible intro angle before interpolating into the hero pose. This avoids the bug where a long idle on the intro screen produces a huge accumulated `rotation.y`, then clicking causes the chair to spin many circles while interpolating back to the hero target.

```js
const TAU = Math.PI * 2;
function normalizeAngle(angle) {
  return ((angle + Math.PI) % TAU + TAU) % TAU - Math.PI;
}
function nearestAngleToTarget(angle, target) {
  return target + normalizeAngle(angle - target);
}
```

The important rule is that normal hero state should return to the original Spinner inertia model, while the enter zoom hands the current visible angle into `spinner.spin` before normal control resumes.

```js
this.spin.x += this.velocity.x + Math.sign(this.velocity.x) * this.coeff * (1 - Number(this.pointerDown));
this.spin.y += this.velocity.y + Math.sign(this.velocity.y) * this.coeff * (1 - Number(this.pointerDown));
this.spin.y += this.scrollSpeed * 0.002;
this.spin.x += this.scrollSpeed * 0.002;
```

During the enter zoom, keep the same visual angle as the intro state and interpolate to the current `spinner.spin.x` target:

```js
this.innerMesh.rotation.y = _lerp(fromInnerY, this.spinner.spin.x, p);
```

When the enter zoom finishes, write the current visible angle into Spinner so the original inertia model resumes without a jump:

```js
this.spinner.spin.x = this.innerMesh.rotation.y;
this.spinner.spin.y = this.innerMesh.rotation.x;
this.spinner.velocity.x = isMobile ? 0.0015 : 0.0025;
this.spinner.velocity.y = isMobile ? 0.0012 : 0.002;
```
