const resourceMap = {
    'cro': '/assets/gallery/ascii/cro.txt',
    'cat': '/assets/gallery/ascii/cat.txt',
};

class AsciiArt {
    mode;
    flexColumnBreakpoint = 1250;
    prevWindowWidth = null;

    loadedAsciiArt = new Map();

    constructor(mode = 'breakpoint') {
        this.mode = mode;
    }

    fit() {
        for (const [id, asciiArt] of this.loadedAsciiArt.entries()) {
            const elem = document.getElementById(id);
            if (!elem)
                continue;

            if (this.mode != 'fixed') {
                const width = parseFloat(getComputedStyle(document.querySelector('main')).width);
                const prev = this.prevWindowWidth;
                this.prevWindowWidth = width;
                const isFlex = this.mode == 'breakpoint' ? prev <= this.flexColumnBreakpoint : true;
                // prevent recomputing ascii art size when in flex column mode and only height changed (mobile adress bar) 
                if (prev != null && isFlex && width == prev)
                    continue;
            }

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
            if (widthRatio == 0)
                widthRatio = heightRatio;
            if (heightRatio == 0)
                heightRatio = widthRatio;

            const minRatio = Math.min(widthRatio, heightRatio);

            elem.style.fontSize = Math.floor(asciiArt.fontSize * minRatio) + "px";
            elem.textContent = asciiArt.text;
        }
    }

    async load(resourceMap) {
        const test = document.getElementById('font-size-test');
        if (!test)
            return;

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

export function attach(mode = 'breakpoint') {
    const asciiArt = new AsciiArt(mode);
    window.addEventListener('load', async () => {
        await asciiArt.load(resourceMap);
        asciiArt.fit();
    });
    window.addEventListener('resize', () => asciiArt.fit());
}
