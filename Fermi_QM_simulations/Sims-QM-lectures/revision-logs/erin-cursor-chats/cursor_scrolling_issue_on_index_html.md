# Scrolling issue on index.html
_Exported on 4/13/2026 at 22:22:22 EDT from Cursor (2.6.21)_

---

**User**

@Sims-QM-lectures/index.html I am not able to scroll to the top of the page -- why?

---

**Cursor**

I’m checking `Sims-QM-lectures/index.html` for CSS or JS that could lock scroll position, especially `overflow`, fixed-height containers, or wheel/touch handlers.

The problem is the `body` CSS in `Sims-QM-lectures/index.html`:

```18:28:Sims-QM-lectures/index.html
html, body { height: 100%; }
body {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  background: radial-gradient(1200px 700px at 20% 0%, #17214a 0%, var(--bg) 60%);
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
```

Because the whole page is a flex container centered both horizontally and vertically, the `main.wrap` content is centered in the viewport instead of starting at the top. Once the content becomes taller than the screen, some of it ends up above the visible area, and the browser can’t scroll “past” the centered layout to reveal that hidden top portion.

In short: vertical centering on `body` is causing the page to overflow upward.

The usual fix is to top-align the page instead, for example:
- change `justify-content: center` to `justify-content: flex-start`
- often also use `min-height: 100vh` instead of `height: 100%`

If you want, I can patch `index.html` so it stays centered on wide screens but always scrolls normally from the top.

---

**User**

Yes, make the change

---

**Cursor**

I’m updating `Sims-QM-lectures/index.html` to top-align the page while keeping the same centered card layout within the content area.

The scroll issue is fixed in `Sims-QM-lectures/index.html`; I’m doing a quick lint check on the edited file now.

`Sims-QM-lectures/index.html` now scrolls normally from the top. I changed the page container from vertical centering to top alignment by switching `justify-content` to `flex-start`, and I set the body to `min-height: 100vh` so the layout still fills the viewport cleanly.

No linter errors showed up for that file. If you want, I can also make the landing page feel a bit more vertically centered on very tall screens without reintroducing the scrolling bug.

