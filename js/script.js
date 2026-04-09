// Calculator with JSON File Storage
let calculationHistory = [];
let currentFile = 'history.json';

// Load history from JSON file on startup
document.addEventListener('DOMContentLoaded', function() {
    loadHistoryFromJSON();
});

// Display functions
function appendToDisplay(input) {
    const display = document.getElementById("display");
    if (display.value === "0" && input !== '.') {
        display.value = input;
    } else {
        display.value += input;
    }
}

function clearDisplay() {
    document.getElementById("display").value = "";
}

function calculate() {
    const display = document.getElementById("display");
    let expression = display.value;
    
    if (expression === '') {
        showError('Please enter a calculation');
        return;
    }
    
    // Remove any invalid characters that might have been saved
    expression = expression.replace(/[^0-9+\-*/%.()]/g, '');
    
    // FIRST: Check for division by zero BEFORE evaluating
    if (expression.includes('/0')) {
        showError('❌ Cannot divide by zero!');
        display.value = '';
        return;
    }
    
    // Check for other validation errors
    const validationError = validateExpression(expression);
    if (validationError) {
        showError(validationError);
        display.value = '';
        return;
    }
    
    try {
        const result = evaluateExpression(expression);
        
        // Check if result is valid
        if (isNaN(result) || !isFinite(result)) {
            showError('Calculation produced an invalid result');
            display.value = '';
            return;
        }
        
        // Round to avoid floating point issues
        const roundedResult = Math.round(result * 1000000) / 1000000;
        display.value = roundedResult;
        
        // Save to history and JSON
        addToHistory(expression, roundedResult);
        saveHistoryToJSON();
        
        // Show success message
        showSuccess('✓ Calculation complete!');
        
    } catch(e) {
        showError('Invalid expression. Please check your input.');
        display.value = '';
    }
}

// Validate expression before evaluation
function validateExpression(expr) {
    // Check for empty expression
    if (expr.length === 0) {
        return 'Please enter a calculation';
    }
    
    // Check for division by zero
    if (expr.includes('/0')) {
        return '❌ Cannot divide by zero!';
    }
    
    // Check for double operators (like //, **, etc.)
    if (/[+\-*/]{2,}/.test(expr)) {
        return '❌ Multiple operators in a row';
    }
    
    // Check if expression ends with operator
    if (/[+\-*/]$/.test(expr)) {
        return '❌ Expression cannot end with an operator';
    }
    
    // Check if expression starts with operator (except minus for negative numbers)
    if (/^[+\-*/]/.test(expr) && expr.length > 1 && expr[0] !== '-') {
        return '❌ Expression cannot start with an operator';
    }
    
    // Check for invalid characters
    if (/[^0-9+\-*/%.()]/.test(expr)) {
        return '❌ Contains invalid characters';
    }
    
    // Check for unmatched parentheses
    let parenthesesCount = 0;
    for (let char of expr) {
        if (char === '(') parenthesesCount++;
        if (char === ')') parenthesesCount--;
        if (parenthesesCount < 0) {
            return '❌ Unmatched closing parenthesis';
        }
    }
    if (parenthesesCount !== 0) {
        return '❌ Unmatched opening parenthesis';
    }
    
    return null; // No errors
}

// Safe expression evaluator
function evaluateExpression(expr) {
    // Remove spaces
    const safeExpr = expr.replace(/\s/g, '');
    
    // Double-check for division by zero before evaluation
    if (safeExpr.includes('/0')) {
        throw new Error('Division by zero');
    }
    
    try {
        // Use Function instead of eval for better security
        const result = new Function('return ' + safeExpr)();
        
        // Check for Infinity or -Infinity (division by zero result)
        if (result === Infinity || result === -Infinity || isNaN(result)) {
            throw new Error('Division by zero or invalid operation');
        }
        
        return result;
    } catch(e) {
        throw e;
    }
}

// Add calculation to history
function addToHistory(expression, result) {
    const historyItem = {
        id: Date.now(),
        expression: expression,
        result: result,
        timestamp: new Date().toLocaleString(),
        date: new Date().toISOString()
    };
    
    calculationHistory.unshift(historyItem);
    
    // Keep only last 20 calculations
    if (calculationHistory.length > 20) {
        calculationHistory.pop();
    }
    
    updateHistoryDisplay();
}

// Update the history display
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    if (calculationHistory.length === 0) {
        historyList.innerHTML = '<div class="empty-history">No calculations yet</div>';
        return;
    }
    
    let html = '';
    calculationHistory.forEach((item) => {
        // Skip invalid entries
        if (!item.expression || !item.result) return;
        if (item.expression.includes('//') || item.expression.includes('* *')) return;
        
        html += `
            <div class="history-item" onclick="loadCalculation(${item.id})">
                <span class="history-expression">${escapeHTML(item.expression)} = </span>
                <span class="history-result">${escapeHTML(item.result)}</span>
                <span class="history-date">${escapeHTML(item.timestamp)}</span>
            </div>
        `;
    });
    
    if (html === '') {
        historyList.innerHTML = '<div class="empty-history">No valid calculations yet</div>';
    } else {
        historyList.innerHTML = html;
    }
}

// Load a calculation from history
function loadCalculation(id) {
    const item = calculationHistory.find(h => h.id === id);
    if (item && item.expression) {
        document.getElementById("display").value = item.expression;
        showSuccess('Loaded: ' + item.expression);
    }
}

// Error message function
function showError(message) {
    const existing = document.querySelector('.calculator-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'calculator-notification error';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f56565;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        font-family: Arial, sans-serif;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Success message function
function showSuccess(message) {
    const existing = document.querySelector('.calculator-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'calculator-notification success';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #48bb78;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        font-family: Arial, sans-serif;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 2000);
}

// SAVE to JSON file
async function saveHistoryToJSON() {
    // Clean history before saving - remove invalid entries
    const cleanHistory = calculationHistory.filter(item => {
        return item.expression && 
               !item.expression.includes('//') && 
               !item.expression.includes('* *') &&
               /^[0-9+\-*/%.()]+$/.test(item.expression);
    });
    
    const jsonData = {
        filename: currentFile,
        lastUpdated: new Date().toISOString(),
        totalCalculations: cleanHistory.length,
        calculations: cleanHistory
    };
    
    try {
        const response = await fetch('php/save_history.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: currentFile,
                data: jsonData
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            localStorage.setItem('calculatorHistory', JSON.stringify(cleanHistory));
        }
    } catch (error) {
        localStorage.setItem('calculatorHistory', JSON.stringify(cleanHistory));
    }
}

// LOAD from JSON file
async function loadHistoryFromJSON() {
    try {
        const response = await fetch(`php/load_history.php?file=${currentFile}`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.calculations) {
            // Filter out invalid entries when loading
            calculationHistory = result.data.calculations.filter(item => {
                return item.expression && 
                       !item.expression.includes('//') && 
                       !item.expression.includes('* *') &&
                       /^[0-9+\-*/%.()]+$/.test(item.expression);
            });
            updateHistoryDisplay();
        } else {
            const localHistory = localStorage.getItem('calculatorHistory');
            if (localHistory) {
                calculationHistory = JSON.parse(localHistory);
                updateHistoryDisplay();
            }
        }
    } catch (error) {
        const localHistory = localStorage.getItem('calculatorHistory');
        if (localHistory) {
            calculationHistory = JSON.parse(localHistory);
            updateHistoryDisplay();
        }
    }
}

// Helper function to escape HTML
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// Make functions globally available
window.appendToDisplay = appendToDisplay;
window.clearDisplay = clearDisplay;
window.calculate = calculate;
window.loadCalculation = loadCalculation;