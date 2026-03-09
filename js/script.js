//CALC 
const display = document.getElementById("display"); 

function appendToDisplay(input) {
    display.value += input;
}

function clearDisplay() {
    display.value = "";
    clearDownload();
}

function calculate(){
    const expr = display.value;
    if(expr === '') return;
    try {
        display.value = eval(expr);
    } catch(e) {
        alert('Invalid expression');
        display.value = '';
    }
    clearDownload();
}

// helpers for formatting and download
function createDownload(content, filename) {
    const container = document.getElementById('downloadLink');
    container.innerHTML = '';
    const a = document.createElement('a');
    const blob = new Blob([content], { type: 'text/plain' });
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.textContent = 'Download ' + filename;
    container.appendChild(a);
}

function clearDownload(){
    const container = document.getElementById('downloadLink');
    container.innerHTML = '';
}

// formatXML() uses client-side value only
function formatXML(){
    const val = display.value;
    if(val === "") return;
    display.value = `<result>${val}</result>`;
}

// formatJSON() uses client-side value only
function formatJSON(){
    const val = display.value;
    if(val === "") return;
    const num = Number(val);
    const result = isNaN(num) ? `"${val}"` : num;
    display.value = `{"result": ${result}}`;
}

// formatPHP() uses client-side value only
function formatPHP(){
    const val = display.value;
    if(val === "") return;
    display.value = `<?php echo ${val}; ?>`;
}

