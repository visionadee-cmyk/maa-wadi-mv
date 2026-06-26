const UnitConverter = {
  // Conversion factors to mm
  factors: {
    mm: 1,
    cm: 10,
    m: 1000,
    in: 25.4
  },

  // Convert to mm
  toMM: function(value, fromUnit) {
    return value * this.factors[fromUnit];
  },

  // Convert from mm
  fromMM: function(value, toUnit) {
    return value / this.factors[toUnit];
  },

  // Format display value
  formatValue: function(value, unit) {
    switch(unit) {
      case 'mm':
        return Math.round(value);
      case 'cm':
      case 'm':
      case 'in':
        return value.toFixed(2);
      default:
        return value;
    }
  }
};

// Handle unit changes
document.getElementById('unitSelector').addEventListener('change', function(e) {
  const newUnit = e.target.value;
  updateDisplayUnits(newUnit);
});

function updateDisplayUnits(unit) {
  // Update unit labels
  document.querySelectorAll('.unit-label').forEach(label => {
    label.textContent = `(${unit})`;
  });

  // Update input placeholders
  const lengthInput = document.getElementById('length');
  const widthInput = document.getElementById('width');
  
  const maxLength = UnitConverter.fromMM(2440, unit);
  const maxWidth = UnitConverter.fromMM(1220, unit);
  
  lengthInput.placeholder = `Max ${UnitConverter.formatValue(maxLength, unit)}`;
  widthInput.placeholder = `Max ${UnitConverter.formatValue(maxWidth, unit)}`;

  // Update existing measurements in the UI
  updateSheetDisplay(unit);
  updateQuotationDisplay(unit);
}

function updateSheetDisplay(unit) {
  const pieces = document.querySelectorAll('.piece-label');
  pieces.forEach(piece => {
    const dimensions = piece.textContent.split('×')[0].trim();
    const mmValue = parseFloat(dimensions);
    const convertedValue = UnitConverter.fromMM(mmValue, unit);
    piece.textContent = piece.textContent.replace(
      dimensions, 
      UnitConverter.formatValue(convertedValue, unit)
    );
  });
}

function updateQuotationDisplay(unit) {
  // Update sheet dimensions in quotation
  const quotationTable = document.querySelector('#quotation table');
  if (quotationTable) {
    const sheetDimensions = quotationTable.querySelector('tbody tr:first-child td:first-child');
    if (sheetDimensions) {
      const width = UnitConverter.fromMM(2440, unit);
      const height = UnitConverter.fromMM(1220, unit);
      sheetDimensions.textContent = 
        `Plywood Sheets (${UnitConverter.formatValue(width, unit)}${unit} × ${UnitConverter.formatValue(height, unit)}${unit})`;
    }
  }
}