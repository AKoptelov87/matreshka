function addZeros(str, max) {
    str = str.toString();
    return str.length < max ? addZeros("0" + str, max) : str;
}

function generator(genPrefix, genNumber, genCount) {
    genPrefix = genPrefix.value;
    genNumber = genNumber.value;
    genCount = genCount.value;
    let date = new Date().toISOString().slice(0, 10);
    let fileBody = '';
    for (let i = 0; i < genCount; i++) {
        fileBody += `${genPrefix}${genNumber}${addZeros(i, 4)} 89701${genNumber}${addZeros(i, 4)} 101 102 103 104 105 106 107 108 109\n`;
    }
    saveFile(`sims${date}-${genCount}.txt`, fileBody);
}

function saveFile(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:attachment/text,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

addEventListener('submit', function () {
    let $simPrefix = document.getElementById("simPrefix");
    let $simNumber = document.getElementById("simNumber");
    let $simCount = document.getElementById("simCount");
    generator($simPrefix, $simNumber, $simCount);
});