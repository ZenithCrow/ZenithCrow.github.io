import * as ascii from '/script/ascii-art.js';

const query = new URL(document.location.toString()).searchParams;
const asciiId = query.get('id');
const pre = document.querySelector('pre.ascii-art');

if (asciiId)
    pre.id = asciiId;

await ascii.attach('fixed');
