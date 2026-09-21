#!/usr/bin/env python3
"""Headless runtime tests for the brachistochrone Physics sheet."""
import os, sys

for cand in ('/opt/pw-browsers',):
    if os.path.isdir(cand) and not os.environ.get('PLAYWRIGHT_BROWSERS_PATH'):
        os.environ['PLAYWRIGHT_BROWSERS_PATH'] = cand

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print('SKIP: playwright not installed — run the manual click-path checklist instead')
    sys.exit(3)

EXPECTED_NOISE = ('net::ERR', 'Failed to load resource', 'THREE is not defined',
                  'katex', 'ERR_INTERNET_DISCONNECTED', 'Refused to load')

CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'


def run(path):
    url = 'file://' + os.path.abspath(path)
    fails, errors = [], []
    launch_kw = {'headless': True}
    if os.path.exists(CHROME):
        launch_kw['executable_path'] = CHROME
    with sync_playwright() as p:
        b = p.chromium.launch(**launch_kw)
        pg = b.new_page()
        pg.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto(url, wait_until='load')
        pg.wait_for_timeout(900)
        pg.evaluate("""(()=>{var ov=document.getElementById('welcome-overlay');
            if(ov) ov.classList.add('hidden');})()""")

        def check(name, cond):
            print(('PASS ' if cond else 'FAIL ') + name)
            if not cond:
                fails.append(name)

        layer_errors = [e for e in errors
                        if not any(k.lower() in e.lower() for k in EXPECTED_NOISE)]
        check('1. no layer console errors' + ('' if not layer_errors else f' -> {layer_errors[:2]}'),
              not layer_errors)

        check('2a. __openPhysics is a function',
              pg.evaluate("typeof window.__openPhysics") == 'function')
        pg.evaluate("window.__paused=null; var sp=Shell.setPlaying; Shell.setPlaying=function(v){window.__paused=v; sp(v);}")
        pg.evaluate("window.__openPhysics()")
        check('2b. backdrop opens',
              pg.evaluate("document.getElementById('phys-backdrop').classList.contains('open')"))
        check('2c. sim paused on open', pg.evaluate("window.__paused") is False)
        pg.keyboard.press('Escape')
        check('2d. Esc closes',
              not pg.evaluate("document.getElementById('phys-backdrop').classList.contains('open')"))
        pg.evaluate("window.__openPhysics()")
        pg.evaluate("document.getElementById('phys-close').click()")
        check('2e. close button closes',
              not pg.evaluate("document.getElementById('phys-backdrop').classList.contains('open')"))

        pg.evaluate("window.__openPhysics()")
        check('3a. 9 SVGs in the article',
              pg.evaluate("document.querySelectorAll('#phys-art svg').length") == 9)
        dupes = pg.evaluate("""(()=>{const ids=[...document.querySelectorAll('#phys-art [id]')].map(e=>e.id);
              return ids.filter((v,i)=>ids.indexOf(v)!==i);})()""")
        check('3b. unique svg/element ids in article', dupes == [])

        # g = 4.00 → T_cyc = θ_F √(R/g) at default posts ≈ 1.086 s
        pg.evaluate("var g=document.getElementById('grav'); g.value='4'; g.dispatchEvent(new Event('input',{bubbles:true}))")
        tcyc = pg.evaluate("document.getElementById('phys-tcyc').textContent")
        worked = pg.evaluate("document.getElementById('phys-worked').textContent")
        check('4a. live T_cyc from current g (1.086 s)', '1.086' in tcyc)
        check('4b. beats-the-chord phrase', 'beats the chord' in tcyc)
        check('4c. worked run uses current values', 'g = 4.00' in worked and 'your settings' in worked)
        check('4d. worked T_cyc recomputed (1.086)', '1.086' in worked)

        pg.evaluate("var m=document.getElementById('phys-dx'); m.value='3'; m.dispatchEvent(new Event('input',{bubbles:true}))")
        check('5a. mini slider drives sep',
              abs(float(pg.evaluate("document.getElementById('sep').value")) - 3.0) < 1e-9)
        sub = pg.evaluate("document.getElementById('phys-sub').textContent")
        check('5b. far post dips below the finish', 'dips below the finish' in sub)

        pg.evaluate("window.__physicsHooks={scene:function(c){window.__cap=c;}}")
        pg.evaluate("document.querySelector('[data-show=\"defaults\"]').click()")
        cap = pg.evaluate("window.__cap")
        check('6a. replay sends live dx (3)', cap and abs(cap['dx'] - 3.0) < 1e-9)
        check('6b. replay sends live g (4)', cap and abs(cap['g'] - 4.0) < 1e-9)
        check('6c. replay launches and plays', cap and cap['launch'] and cap['playing'])
        check('6d. modal closed after see-it',
              not pg.evaluate("document.getElementById('phys-backdrop').classList.contains('open')"))

        pg.evaluate("document.documentElement.setAttribute('data-theme','light')")
        pg.wait_for_timeout(120)
        check('7a. html light -> body.light-theme',
              pg.evaluate("document.body.classList.contains('light-theme')"))
        pg.evaluate("document.documentElement.setAttribute('data-theme','dark')")
        pg.wait_for_timeout(120)
        check('7b. html dark -> body class removed',
              not pg.evaluate("document.body.classList.contains('light-theme')"))

        pg.evaluate("""window.__openPhysics();
            window.__blob=null;
            URL.createObjectURL=function(b){window.__blob=b; return 'blob:test';};
            HTMLAnchorElement.prototype.click=function(){};
            document.getElementById('phys-download').click();""")
        pg.wait_for_timeout(400)
        sheet = pg.evaluate("window.__blob ? window.__blob.text() : null")
        check('8a. sheet blob produced', bool(sheet))
        if sheet:
            check('8b. sheet titled The Physics', '<h1>The Physics' in sheet)
            check('8c. snapshot carries CURRENT values', '3.00' in sheet and '4.00' in sheet)
            check('8d. sheet has 9 SVGs', sheet.count('<svg') == 9)
            check('8e. sheet has 3 self-test questions', sheet.count('<details') == 3)
            check('8f. sheet has theme toggle + print', 'id="theme"' in sheet and 'id="printer"' in sheet)
            check('8g. no unfilled tokens in sheet', '{{' not in sheet)
        b.close()

    print()
    if fails:
        print(f'FAILED {len(fails)} test(s)')
        sys.exit(1)
    print('ALL RUNTIME TESTS PASSED')


if __name__ == '__main__':
    run(sys.argv[1])
