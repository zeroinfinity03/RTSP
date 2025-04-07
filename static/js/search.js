document.addEventListener('DOMContentLoaded', function() {
    const symbolSelect = document.getElementById('symbol-select');
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search for a company...';
    searchInput.className = 'form-control mb-2';
    
    // Insert search input before the select element
    symbolSelect.parentNode.insertBefore(searchInput, symbolSelect);

    // Store all original options
    const allOptions = Array.from(symbolSelect.options);

    searchInput.addEventListener('input', async function(e) {
        const query = e.target.value;
        if (query.length >= 1) {
            const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
            const filteredSymbols = await response.json();
            
            // Clear current options
            symbolSelect.innerHTML = '';
            
            // Add filtered options
            filteredSymbols.forEach(symbol => {
                const option = document.createElement('option');
                option.value = symbol;
                option.textContent = symbol;
                symbolSelect.appendChild(option);
            });
        } else {
            // Restore all options if search is cleared
            symbolSelect.innerHTML = '';
            allOptions.forEach(option => symbolSelect.appendChild(option.cloneNode(true)));
        }
    });
});
