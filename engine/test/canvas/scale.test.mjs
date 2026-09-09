import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeView } from '../../canvas/scale.js';

const near = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

test('makeView stretch fills the padded rect and flips y', () => {
  const v = makeView({
    world: { x0: 0, y0: 0, x1: 10, y1: 10 },
    screen: { w: 1000, h: 500, pad: 0 },
    aspect: 'stretch',
  });
  assert.deepEqual(v.toPx(0, 0), [0, 500]);     // world origin → bottom-left
  assert.deepEqual(v.toPx(10, 10), [1000, 0]);  // top-right
  assert.ok(near(v.pxPerUnit, 100));
  assert.ok(near(v.pxPerUnitY, 50));
});

test('makeView lock uses one uniform scale and centers the plot', () => {
  const v = makeView({
    world: { x0: 0, y0: 0, x1: 10, y1: 10 },
    screen: { w: 1000, h: 500, pad: 0 },
    aspect: 'lock',
  });
  assert.ok(near(v.pxPerUnit, 50));
  assert.ok(near(v.pxPerUnitY, 50), 'aspect lock: same px/unit on both axes');
  const [xL] = v.toPx(0, 0);
  const [xR] = v.toPx(10, 0);
  assert.ok(near(xL, 250), 'centered horizontally');
  assert.ok(near(xR, 750));
  const [, yB] = v.toPx(0, 0);
  const [, yT] = v.toPx(0, 10);
  assert.ok(near(yB, 500));
  assert.ok(near(yT, 0));
});

test('makeView honors pad as number and as {l,r,t,b}', () => {
  const v = makeView({
    world: { x0: 0, y0: 0, x1: 10, y1: 5 },
    screen: { w: 820, h: 420, pad: 10 },
  });
  assert.deepEqual(v.toPx(0, 0).map(Math.round), [10, 410]);
  assert.deepEqual(v.toPx(10, 5).map(Math.round), [810, 10]);

  const v2 = makeView({
    world: { x0: 0, y0: 0, x1: 1, y1: 1 },
    screen: { w: 100, h: 100, pad: { l: 40, r: 10, t: 20, b: 30 } },
    aspect: 'stretch',
  });
  assert.deepEqual(v2.toPx(0, 1), [40, 20]);
  assert.deepEqual(v2.toPx(1, 0), [90, 70]);
});

test('toWorld inverts toPx (round-trip, both aspects)', () => {
  for (const aspect of ['lock', 'stretch']) {
    const v = makeView({
      world: { x0: -3.6, y0: -0.6, x1: 3.6, y1: 5.8 },
      screen: { w: 640, h: 420, pad: { l: 46, r: 16, t: 16, b: 34 } },
      aspect,
    });
    for (const [x, y] of [[-3.6, -0.6], [0, 0], [1.25, 4.5], [3.6, 5.8], [-2, 3.3]]) {
      const [px, py] = v.toPx(x, y);
      const [x2, y2] = v.toWorld(px, py);
      assert.ok(near(x2, x), `${aspect}: x round-trip at ${x}`);
      assert.ok(near(y2, y), `${aspect}: y round-trip at ${y}`);
    }
  }
});

test('y-flip: larger world y maps to smaller screen y', () => {
  const v = makeView({
    world: { x0: 0, y0: 0, x1: 1, y1: 1 },
    screen: { w: 100, h: 100, pad: 0 },
  });
  const [, pyLow] = v.toPx(0.5, 0.2);
  const [, pyHigh] = v.toPx(0.5, 0.8);
  assert.ok(pyHigh < pyLow);
});

test('view exposes world, screen, aspect, and the underlying scales', () => {
  const v = makeView({
    world: { x0: 0, y0: 0, x1: 2, y1: 4 },
    screen: { w: 200, h: 200, pad: 5 },
    aspect: 'stretch',
  });
  assert.deepEqual(v.world, { x0: 0, y0: 0, x1: 2, y1: 4 });
  assert.deepEqual(v.screen.pad, { l: 5, r: 5, t: 5, b: 5 });
  assert.equal(v.aspect, 'stretch');
  assert.ok(near(v.x.invert(v.x(1.3)), 1.3));
  assert.ok(near(v.y.invert(v.y(3.1)), 3.1));
});
