import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textBox, callout } from '../../canvas/label.js';
import { makeCtx } from './mockctx.mjs';

test('textBox draws text and returns the box', () => {
  const ctx = makeCtx();
  const box = textBox(ctx, 'hello', 100, 50, { color: '#fff' });
  assert.equal(ctx.count('fillText'), 1);
  assert.equal(box.x, 100 - 3);         // default anchor nw, pad 3
  assert.equal(box.y, 50 - 3);
  assert.equal(box.w, 5 * 7 + 6);       // mock: 7 px per char + 2×pad
});

test('textBox anchors: ne right-aligns, s centers above, c centers both', () => {
  const ctx = makeCtx();
  const tw = 5 * 7;
  const ne = textBox(ctx, 'hello', 200, 50, { anchor: 'ne' });
  assert.equal(ne.x + ne.w, 200 + 3, 'right edge at x');
  const s = textBox(ctx, 'hello', 200, 50, { anchor: 's', font: '12px x' });
  assert.equal(s.y + s.h, 50 + 3, 'bottom edge at y');
  assert.equal(s.x, 200 - tw / 2 - 3, 'centered horizontally');
  const c = textBox(ctx, 'hello', 200, 50, { anchor: 'c', font: '12px x' });
  assert.equal(c.x, 200 - tw / 2 - 3);
  assert.equal(c.y, 50 - 6 - 3);
});

test('textBox clamps to canvas bounds', () => {
  const ctx = makeCtx(800, 600);
  const right = textBox(ctx, 'edge label', 795, 50);
  assert.ok(right.x + right.w <= 800, 'clamped inside right edge');
  const top = textBox(ctx, 'edge label', 100, -40, { anchor: 's' });
  assert.ok(top.y >= 0, 'clamped inside top edge');
});

test('textBox bg and halo are opt-in', () => {
  const plain = makeCtx();
  textBox(plain, 'x', 10, 10);
  assert.equal(plain.count('fillRect'), 0);
  assert.equal(plain.count('strokeText'), 0);
  const fancy = makeCtx();
  textBox(fancy, 'x', 10, 10, { bg: true, halo: true });
  assert.equal(fancy.count('fillRect'), 1, 'background box');
  assert.equal(fancy.count('strokeText'), 1, 'halo outline');
});

test('callout places the label beyond the tip, along the leader direction', () => {
  const ctx = makeCtx();
  const up = callout(ctx, 'F', [100, 200], [100, 100], { font: '12px x' });
  assert.ok(up.y + up.h <= 100, 'upward leader → label above the tip');
  const right = callout(ctx, 'F', [100, 100], [200, 100], { font: '12px x' });
  assert.ok(right.x >= 200, 'rightward leader → label right of the tip');
});

test('callout degenerate (anchor == tip) defaults upward; leader opt-in', () => {
  const ctx = makeCtx();
  const box = callout(ctx, 'F', [100, 100], [100, 100], { font: '12px x' });
  assert.ok(box.y + box.h <= 100, 'defaults to above');
  assert.equal(ctx.count('moveTo'), 0, 'no leader line by default');
  const ctx2 = makeCtx();
  callout(ctx2, 'F', [100, 200], [100, 100], { leader: true });
  assert.equal(ctx2.count('stroke'), 1, 'leader line drawn');
});
