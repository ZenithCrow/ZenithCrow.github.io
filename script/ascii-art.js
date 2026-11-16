const resourceMap = {
    'cro': '/assets/gallery/ascii/cro.txt',
    'cat': '/assets/gallery/ascii/cat.txt',
};

const flexColumnBreakpoint = 1250;
let prevWindowWidth = null;

const loadedAsciiArt = new Map();

function fitAsciiArt(loadedAsciiArtMap) {
    for (const [id, asciiArt] of loadedAsciiArtMap.entries()) {
        const elem = document.getElementById(id);
        if (!elem)
            continue;

        const width = parseFloat(getComputedStyle(document.querySelector('main')).width);
        const prev = prevWindowWidth;
        prevWindowWidth = width;
        // prevent recomputing ascii art size when in flex column mode and only height changed (mobile adress bar) 
        if (prev != null && prev <= flexColumnBreakpoint && width == prev)
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
        if (widthRatio == 0)
            widthRatio = heightRatio;
        if (heightRatio == 0)
            heightRatio = widthRatio;

        const minRatio = Math.min(widthRatio, heightRatio);

        elem.style.fontSize = Math.floor(asciiArt.fontSize * minRatio) + "px";
        elem.textContent = asciiArt.text;
    }
}

async function loadAsciiArt(resourceMap, loadedAsciiArtMap) {
    const test = document.getElementById('font-size-test');
    if (!test)
        return;

    const testFontSize = parseFloat(getComputedStyle(test).fontSize);

    for (const [id, url] of Object.entries(resourceMap)) {
        if (loadedAsciiArtMap.has(id))
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

        loadedAsciiArtMap.set(id, asciiObj);
    }
}

window.addEventListener('load', async () => {
    await loadAsciiArt(resourceMap, loadedAsciiArt);
    fitAsciiArt(loadedAsciiArt);
});
window.addEventListener('resize', () => fitAsciiArt(loadedAsciiArt));
