document.querySelectorAll('.three-dots').forEach(s => {
    let leftAlign = getComputedStyle(s).textAlign !== 'right';
    let direction = leftAlign ? 1 : -1;
    let dotState = leftAlign ? 0 : 2;
    s.textContent = '.'.repeat(dotState + 1);

    setInterval(() => {
        dotState = (dotState + direction + 3) % 3;
        s.textContent = '.'.repeat(dotState + 1);
    }, 600);
});
