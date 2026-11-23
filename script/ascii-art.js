import * as asciiResources from '/script/ascii-resources.js';

const fontSizeTest = 'font-size-test';

// <div style="position: absolute; width: 0; height: 0; overflow: hidden;">
//     <pre id="font-size-test" class="ascii-art" style="position: absolute"></pre>
// </div>
function createTestFontElem() {
    const div = document.createElement('div');
    div.style = 'position: absolute; width: 0; height: 0; overflow: hidden;';
    const pre = document.createElement('pre');
    div.appendChild(pre);
    pre.id = fontSizeTest;
    pre.className = 'ascii-art';
    pre.style = 'position: absolute';

    document.body.appendChild(div);
}

class AsciiArt {
    mode;
    flexColumnBreakpoint = 1250;
    prevWindowWidth = null;

    loadedAsciiArt = new Map();

    constructor(mode = 'breakpoint') {
        this.mode = mode;
    }

    fit() {
        if (this.mode !== 'fixed') {
            const width = parseFloat(getComputedStyle(document.querySelector('main')).width);
            const prev = this.prevWindowWidth;
            this.prevWindowWidth = width;
            const isFlex = this.mode === 'breakpoint' ? prev <= this.flexColumnBreakpoint : true;
            // prevent recomputing ascii art size when in flex column mode and only height changed (mobile adress bar) 
            if (prev != null && isFlex && width === prev)
                return;
        }

        for (const [id, asciiArt] of this.loadedAsciiArt.entries()) {
            const elem = document.getElementById(id);
            if (!elem)
                continue;

            elem.style.width = '100%';
            elem.style.height = '100%';
            elem.textContent = null;

            const parentRect = elem.getBoundingClientRect();
            const parentWidth = parentRect.width;
            const parentHeight = parentRect.height;

            elem.style.width = 'initial';
            elem.style.height = 'initial';

            let widthRatio = parentWidth / asciiArt.width;
            let heightRatio = parentHeight / asciiArt.height;
            if (widthRatio === 0)
                widthRatio = heightRatio;
            if (heightRatio === 0 || this.mode === 'flexColumn') // TODO: add flex in breakpoint mode
                heightRatio = widthRatio;

            const minRatio = Math.min(widthRatio, heightRatio);

            elem.style.fontSize = Math.floor(asciiArt.fontSize * minRatio) + "px";
            elem.textContent = asciiArt.text;
        }
    }

    async load(resourceMap) {
        let test = document.getElementById('font-size-test');
        if (!test) {
            createTestFontElem();
            test = document.getElementById('font-size-test');
        }

        const testFontSize = parseFloat(getComputedStyle(test).fontSize);

        for (const [id, url] of Object.entries(resourceMap)) {
            if (this.loadedAsciiArt.has(id))
                continue;

            const elem = document.getElementById(id);
            if (!elem)
                continue;

            const asciiText = await fetch(url).then(res => res.text());

            test.textContent = asciiText;
            const asciiRect = test.getBoundingClientRect();
            const asciiWidth = asciiRect.width;
            const asciiHeight = asciiRect.height;
            test.textContent = null;

            const asciiObj = {
                text: asciiText,
                fontSize: testFontSize,
                width: asciiWidth,
                height: asciiHeight,
            };

            this.loadedAsciiArt.set(id, asciiObj);
        }
    }
}

export async function attach(mode = 'breakpoint') {
    const asciiArt = new AsciiArt(mode);

    if (document.readyState === 'complete') {
        await asciiArt.load(asciiResources.map);
        asciiArt.fit();
    } else {
        window.addEventListener('load', async () => {
            await asciiArt.load(asciiResources.map);
            asciiArt.fit();
        });
    }

    window.addEventListener('resize', () => asciiArt.fit());
}
