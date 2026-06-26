// Constants
const woodWaste = 10; // 10mm waste between pieces
const cutCost = 10; // Cost per cut in RF
const teakCost = 10; // Cost per meter of teak in RF
let sheets = []; // Array to store sheets and their pieces
let currentUnit = 'mm'; // Default unit
let pieceIdCounter = 0; // Counter for generating unique piece IDs

// Shop and wood data structure
let shops = [
  {
    id: 1,
    name: "Wood Pro",
    woodTypes: [
      {
        id: 1,
        name: "Standard Plywood",
        dimensions: { width: 2440, height: 1220 }, // mm
        thickness: 18,
        price: 750, // MVR
        description: "8 feet x 4 feet x 18mm"
      }
    ]
  },
  {
    id: 2,
    name: "Home & Hardware",
    woodTypes: [
      {
        id: 2,
        name: "Blockboard Semi Glossy White",
        dimensions: { width: 2440, height: 1220 }, // mm
        thickness: 18,
        price: 675, // MVR
        description: "1220 X 2440 X 18MM"
      }
    ]
  }
];

let selectedShop = null;
let selectedWood = null;

// Current sheet dimensions (based on selected wood)
let sheetWidth = 2440;
let sheetHeight = 1220;
let sheetCost = 750;

// Display dimensions (pixels) - will be calculated dynamically
let displayWidth = 800; // px (default, will be updated based on container)
let displayHeight = 400; // px (default, will be updated based on container)

// Calculate scaling factors dynamically
function updateDisplayScale() {
  const sheetContainer = document.getElementById('sheet-container');
  if (sheetContainer) {
    const containerWidth = sheetContainer.clientWidth;
    displayWidth = Math.min(containerWidth - 4, 800); // Reduced padding to 4px
    displayHeight = displayWidth / 2; // Maintain 2:1 aspect ratio
    
    console.log('Container width:', containerWidth, 'Display width:', displayWidth, 'Display height:', displayHeight);
  } else {
    // Fallback if container doesn't exist yet
    displayWidth = 800;
    displayHeight = 400;
    console.log('Container not found, using fallback');
  }
  
  const scaleX = displayWidth / sheetWidth;
  const scaleY = displayHeight / sheetHeight;
  const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio
  console.log('Scale:', scale, 'ScaleX:', scaleX, 'ScaleY:', scaleY);
  return scale;
}

let uniformScale = updateDisplayScale();

// Unit conversion event listener
document.getElementById('unitSelector').addEventListener('change', function(e) {
  currentUnit = e.target.value;
  updateDisplayUnits();
});

// Window resize listener to update scale
window.addEventListener('resize', function() {
  uniformScale = updateDisplayScale();
  if (sheets.length > 0) {
    renderSheets();
  }
});

// Shop and Wood Selection Functions
function populateShopSelector() {
  const shopSelector = document.getElementById('shopSelector');
  shopSelector.innerHTML = '<option value="">-- Select Shop --</option>';
  
  shops.forEach(shop => {
    const option = document.createElement('option');
    option.value = shop.id;
    option.textContent = shop.name;
    shopSelector.appendChild(option);
  });
}

function populateWoodSelector(shopId) {
  const woodSelector = document.getElementById('woodSelector');
  woodSelector.innerHTML = '<option value="">-- Select Wood Type --</option>';
  woodSelector.disabled = true;
  
  const shop = shops.find(s => s.id === parseInt(shopId));
  if (shop) {
    shop.woodTypes.forEach(wood => {
      const option = document.createElement('option');
      option.value = wood.id;
      option.textContent = `${wood.name} - ${wood.price} MVR`;
      woodSelector.appendChild(option);
    });
    woodSelector.disabled = false;
  }
  
  // Hide wood details
  document.getElementById('woodDetails').style.display = 'none';
}

function selectWood(woodId) {
  const woodSelector = document.getElementById('woodSelector');
  const woodDetails = document.getElementById('woodDetails');
  
  if (!woodId) {
    selectedWood = null;
    woodDetails.style.display = 'none';
    return;
  }
  
  // Find the selected wood type
  for (const shop of shops) {
    const wood = shop.woodTypes.find(w => w.id === parseInt(woodId));
    if (wood) {
      selectedWood = wood;
      selectedShop = shop;
      
      // Update sheet dimensions and cost
      sheetWidth = wood.dimensions.width;
      sheetHeight = wood.dimensions.height;
      sheetCost = wood.price;
      
      // Display wood details
      document.getElementById('woodDimensions').textContent = 
        `${wood.dimensions.width}mm × ${wood.dimensions.height}mm (${wood.description})`;
      document.getElementById('woodThickness').textContent = wood.thickness;
      document.getElementById('woodPrice').textContent = wood.price;
      
      woodDetails.style.display = 'block';
      
      // Clear existing sheets since dimensions changed
      if (sheets.length > 0) {
        if (confirm('Changing wood type will clear existing pieces. Continue?')) {
          sheets = [];
          pieceIdCounter = 0;
          renderSheets();
          renderPiecesList();
          renderSheetDetails();
          generateQuotation();
        } else {
          // Revert selection
          woodSelector.value = '';
          selectedWood = null;
          woodDetails.style.display = 'none';
        }
      }
      break;
    }
  }
}

// Event listeners for shop and wood selection
document.getElementById('shopSelector').addEventListener('change', function(e) {
  selectedShop = shops.find(s => s.id === parseInt(e.target.value)) || null;
  populateWoodSelector(e.target.value);
  document.getElementById('woodSelector').value = '';
});

document.getElementById('woodSelector').addEventListener('change', function(e) {
  selectWood(e.target.value);
});

// Initialize shop selector
populateShopSelector();

// Add Shop Modal Functions
function openAddShopModal() {
  document.getElementById('addShopModal').style.display = 'flex';
}

function closeAddShopModal() {
  document.getElementById('addShopModal').style.display = 'none';
  // Clear form
  document.getElementById('newShopName').value = '';
  document.getElementById('newWoodName').value = '';
  document.getElementById('newWoodWidth').value = '2440';
  document.getElementById('newWoodHeight').value = '1220';
  document.getElementById('newWoodThickness').value = '18';
  document.getElementById('newWoodPrice').value = '';
  document.getElementById('newWoodDescription').value = '';
}

function saveNewShop() {
  const shopName = document.getElementById('newShopName').value.trim();
  const woodName = document.getElementById('newWoodName').value.trim();
  const woodWidth = parseInt(document.getElementById('newWoodWidth').value);
  const woodHeight = parseInt(document.getElementById('newWoodHeight').value);
  const woodThickness = parseInt(document.getElementById('newWoodThickness').value);
  const woodPrice = parseFloat(document.getElementById('newWoodPrice').value);
  const woodDescription = document.getElementById('newWoodDescription').value.trim();

  // Validation
  if (!shopName) {
    alert('Please enter a shop name');
    return;
  }
  if (!woodName) {
    alert('Please enter a wood type name');
    return;
  }
  if (!woodWidth || !woodHeight || !woodThickness || !woodPrice) {
    alert('Please fill in all wood specifications');
    return;
  }

  // Create new shop with wood type
  const newShop = {
    id: shops.length + 1,
    name: shopName,
    woodTypes: [
      {
        id: shops.length * 10 + 1,
        name: woodName,
        dimensions: { width: woodWidth, height: woodHeight },
        thickness: woodThickness,
        price: woodPrice,
        description: woodDescription || `${woodWidth}mm × ${woodHeight}mm × ${woodThickness}mm`
      }
    ]
  };

  shops.push(newShop);
  
  // Save to localStorage
  localStorage.setItem('maaWadiShops', JSON.stringify(shops));
  
  // Update UI
  populateShopSelector();
  closeAddShopModal();
  
  alert('Shop added successfully!');
}

// Event listeners for modal
document.getElementById('addShopBtn').addEventListener('click', openAddShopModal);
document.getElementById('closeShopModal').addEventListener('click', closeAddShopModal);
document.getElementById('cancelAddShop').addEventListener('click', closeAddShopModal);
document.getElementById('saveShop').addEventListener('click', saveNewShop);

// Close modal when clicking outside
document.getElementById('addShopModal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeAddShopModal();
  }
});

// Load shops from localStorage on startup
function loadShopsFromStorage() {
  const savedShops = localStorage.getItem('maaWadiShops');
  if (savedShops) {
    try {
      shops = JSON.parse(savedShops);
      populateShopSelector();
    } catch (e) {
      console.error('Error loading shops from storage:', e);
    }
  }
}

loadShopsFromStorage();

document.getElementById('piece-form').addEventListener('submit', function (e) {
  e.preventDefault();

  // Get user input and convert to mm
  const length = UnitConverter.toMM(parseFloat(document.getElementById('length').value), currentUnit);
  const width = UnitConverter.toMM(parseFloat(document.getElementById('width').value), currentUnit);
  const quantity = parseInt(document.getElementById('quantity').value);
  const teakSides = Array.from(document.querySelectorAll('input[name="teak"]:checked')).map(input => input.value);

  // Validate input (allow exact sheet-size pieces; waste is only spacing between pieces)
  const canFitEmptySheet =
    (length <= sheetWidth && width <= sheetHeight) ||
    (width <= sheetWidth && length <= sheetHeight);

  if (!canFitEmptySheet) {
    const maxLength = UnitConverter.fromMM(sheetWidth, currentUnit);
    const maxWidth = UnitConverter.fromMM(sheetHeight, currentUnit);
    alert(`Piece dimensions cannot exceed sheet size (${maxLength}${currentUnit} x ${maxWidth}${currentUnit})`);
    return;
  }

  // Add pieces to sheets
  for (let i = 0; i < quantity; i++) {
    const added = addPieceToSheet(length, width, teakSides);
    if (!added) {
      alert('This piece could not be placed on a sheet.');
      break;
    }
  }

  // Clear input fields
  clearInputFields();

  // Render sheets and details
  renderSheets();
  renderPiecesList();
  renderSheetDetails();
  generateQuotation();
});

function clearInputFields() {
  document.getElementById('length').value = '';
  document.getElementById('width').value = '';
  document.getElementById('quantity').value = '1';
  document.querySelectorAll('input[name="teak"]').forEach(input => (input.checked = false));
}

function addPieceToSheet(length, width, teakSides) {
  let added = false;

  // Try to add the piece to an existing sheet
  for (const sheet of sheets) {
    const didFit = tryFitPiece(sheet, length, width, teakSides);
    if (didFit) {
      added = true;
      break;
    }
  }

  // If no sheet can fit the piece, create a new sheet
  if (!added) {
    const newSheet = {
      width: sheetWidth,
      height: sheetHeight,
      pieces: [],
    };

    const didFit = tryFitPiece(newSheet, length, width, teakSides);
    if (!didFit) {
      return false;
    }

    sheets.push(newSheet);
  }

  return true;
}

function tryFitPiece(sheet, length, width, teakSides) {
  // Try original orientation
  if (canFit(sheet, length, width)) {
    placePiece(sheet, length, width, false, teakSides);
    return true;
  }

  // Try rotated orientation
  if (canFit(sheet, width, length)) {
    placePiece(sheet, width, length, true, teakSides);
    return true;
  }

  return false;
}

function canFit(sheet, pieceWidth, pieceHeight) {
  // Check if piece fits in sheet dimensions (waste is NOT applied to sheet edges)
  if (pieceWidth > sheet.width || pieceHeight > sheet.height) {
    return false;
  }

  // Check for overlapping with existing pieces (waste is spacing between pieces)
  for (let y = 0; y <= sheet.height - pieceHeight; y++) {
    for (let x = 0; x <= sheet.width - pieceWidth; x++) {
      if (!isOverlapping(sheet, x, y, pieceWidth, pieceHeight)) {
        return true;
      }
    }
  }
  return false;
}

function isOverlapping(sheet, x, y, pieceWidth, pieceHeight) {
  for (const piece of sheet.pieces) {
    if (
      x < piece.x + piece.width + woodWaste &&
      x + pieceWidth + woodWaste > piece.x &&
      y < piece.y + piece.height + woodWaste &&
      y + pieceHeight + woodWaste > piece.y
    ) {
      return true;
    }
  }
  return false;
}

function placePiece(sheet, pieceWidth, pieceHeight, isRotated, teakSides) {
  for (let y = 0; y <= sheet.height - pieceHeight; y++) {
    for (let x = 0; x <= sheet.width - pieceWidth; x++) {
      if (!isOverlapping(sheet, x, y, pieceWidth, pieceHeight)) {
        sheet.pieces.push({
          id: pieceIdCounter++,
          x,
          y,
          width: pieceWidth,
          height: pieceHeight,
          isRotated,
          teakSides: teakSides || [],
        });
        return;
      }
    }
  }
}

function renderSheets() {
  // Update scale based on current container width
  uniformScale = updateDisplayScale();
  
  const sheetContainer = document.getElementById('sheet-container');
  sheetContainer.innerHTML = '';

  if (sheets.length === 0) {
    sheetContainer.innerHTML = '<p>No sheets created yet. Add pieces to begin.</p>';
    return;
  }

  sheets.forEach((sheet, index) => {
    const sheetDiv = document.createElement('div');
    sheetDiv.className = 'sheet';
    
    // Set explicit dimensions based on calculated scale
    sheetDiv.style.width = `${displayWidth}px`;
    sheetDiv.style.height = `${displayHeight}px`;
    
    // Update background grid size based on display dimensions
    const gridWidthX = displayWidth / 24.4;
    const gridHeightY = displayHeight / 12.2;
    sheetDiv.style.backgroundSize = `${gridWidthX}px ${gridHeightY}px`;
    
    // Add sheet title with converted units
    const titleDiv = document.createElement('div');
    titleDiv.className = 'sheet-title';
    const sheetWidthConverted = UnitConverter.fromMM(sheetWidth, currentUnit);
    const sheetHeightConverted = UnitConverter.fromMM(sheetHeight, currentUnit);
    titleDiv.textContent = `Sheet ${index + 1} (${sheetWidthConverted}${currentUnit} × ${sheetHeightConverted}${currentUnit})`;
    sheetDiv.appendChild(titleDiv);

    // Add leftover full-height slices (green)
    const leftoverSlices = calculateLeftoverSlices(sheet);
    leftoverSlices.forEach((slice) => {
      const sliceDiv = document.createElement('div');
      sliceDiv.className = 'leftover-slice';
      
      const sliceDisplayWidth = slice.width * uniformScale;
      const sliceDisplayHeight = slice.height * uniformScale;
      const sliceDisplayX = slice.x * uniformScale;
      const sliceDisplayY = slice.y * uniformScale;
      
      sliceDiv.style.width = `${sliceDisplayWidth}px`;
      sliceDiv.style.height = `${sliceDisplayHeight}px`;
      sliceDiv.style.left = `${sliceDisplayX}px`;
      sliceDiv.style.top = `${sliceDisplayY}px`;
      
      const labelDiv = document.createElement('div');
      labelDiv.className = 'slice-label';
      const sliceWidthConverted = UnitConverter.fromMM(slice.width, currentUnit);
      const sliceHeightConverted = UnitConverter.fromMM(slice.height, currentUnit);
      labelDiv.textContent = `${sliceWidthConverted} × ${sliceHeightConverted}${currentUnit}`;
      sliceDiv.appendChild(labelDiv);
      
      sheetDiv.appendChild(sliceDiv);
    });

    // Add pieces
    sheet.pieces.forEach((piece) => {
      // Add green cut indicator (full length)
      const cutDiv = document.createElement('div');
      cutDiv.className = 'cut-indicator';
      
      // Calculate display dimensions and position
      const pieceDisplayWidth = piece.width * uniformScale;
      const pieceDisplayHeight = piece.height * uniformScale;
      const pieceDisplayX = piece.x * uniformScale;
      const pieceDisplayY = piece.y * uniformScale;
      
      cutDiv.style.width = `${pieceDisplayWidth}px`;
      cutDiv.style.height = `${pieceDisplayHeight}px`;
      cutDiv.style.left = `${pieceDisplayX}px`;
      cutDiv.style.top = `${pieceDisplayY}px`;
      
      sheetDiv.appendChild(cutDiv);
      
      // Add piece
      const pieceDiv = document.createElement('div');
      pieceDiv.className = 'piece';
      
      pieceDiv.style.width = `${pieceDisplayWidth}px`;
      pieceDiv.style.height = `${pieceDisplayHeight}px`;
      pieceDiv.style.left = `${pieceDisplayX}px`;
      pieceDiv.style.top = `${pieceDisplayY}px`;
      
      // Add piece label with converted units
      const labelDiv = document.createElement('div');
      labelDiv.className = 'piece-label';
      const pieceWidthConverted = UnitConverter.fromMM(piece.width, currentUnit);
      const pieceHeightConverted = UnitConverter.fromMM(piece.height, currentUnit);
      labelDiv.textContent = `${pieceWidthConverted} × ${pieceHeightConverted}${currentUnit}`;
      
      if (piece.isRotated) {
        labelDiv.textContent += ' (Rotated)';
      }
      if (piece.teakSides.length > 0) {
        labelDiv.textContent += ` | Teak: ${piece.teakSides.join(', ')}`;
      }
      pieceDiv.appendChild(labelDiv);
      
      sheetDiv.appendChild(pieceDiv);
    });

    sheetContainer.appendChild(sheetDiv);
  });
}

function calculateLeftoverSlices(sheet) {
  const slices = [];
  
  // Create a grid representation of the sheet
  const gridSize = 10; // 10mm grid for precision
  const gridWidth = Math.ceil(sheet.width / gridSize);
  const gridHeight = Math.ceil(sheet.height / gridSize);
  const occupied = new Array(gridWidth).fill(null).map(() => new Array(gridHeight).fill(false));
  
  // Mark occupied cells by pieces (with waste gap)
  sheet.pieces.forEach(piece => {
    const startX = Math.floor(piece.x / gridSize);
    const startY = Math.floor(piece.y / gridSize);
    const endX = Math.ceil((piece.x + piece.width + woodWaste) / gridSize);
    const endY = Math.ceil((piece.y + piece.height + woodWaste) / gridSize);
    
    for (let x = Math.max(0, startX); x < Math.min(gridWidth, endX); x++) {
      for (let y = Math.max(0, startY); y < Math.min(gridHeight, endY); y++) {
        occupied[x][y] = true;
      }
    }
  });
  
  // First, find full-height vertical strips (full length)
  const fullHeightStrips = [];
  for (let x = 0; x < gridWidth; x++) {
    let stripStart = null;
    let stripEnd = null;
    let isFullHeight = true;
    
    for (let y = 0; y < gridHeight; y++) {
      if (!occupied[x][y]) {
        if (stripStart === null) {
          stripStart = y;
        }
        stripEnd = y;
      } else {
        // If there's any occupied cell in this column, it's not full height
        isFullHeight = false;
        if (stripStart !== null) {
          const height = (stripEnd - stripStart + 1) * gridSize;
          if (height >= 100) {
            slices.push({
              x: x * gridSize,
              y: stripStart * gridSize,
              width: gridSize,
              height: height,
              isFullHeight: false
            });
          }
          stripStart = null;
          stripEnd = null;
        }
      }
    }
    
    // Check if this is a full-height strip
    if (stripStart !== null && isFullHeight && stripStart === 0 && stripEnd === gridHeight - 1) {
      fullHeightStrips.push({
        x: x * gridSize,
        y: 0,
        width: gridSize,
        height: sheetHeight,
        isFullHeight: true
      });
    } else if (stripStart !== null) {
      const height = (stripEnd - stripStart + 1) * gridSize;
      if (height >= 100) {
        slices.push({
          x: x * gridSize,
          y: stripStart * gridSize,
          width: gridSize,
          height: height,
          isFullHeight: false
        });
      }
    }
  }
  
  // Merge adjacent full-height strips into wider slices
  const mergedFullHeight = [];
  if (fullHeightStrips.length > 0) {
    let currentStrip = { ...fullHeightStrips[0] };
    
    for (let i = 1; i < fullHeightStrips.length; i++) {
      const nextStrip = fullHeightStrips[i];
      
      // Check if strips are adjacent horizontally
      if (currentStrip.x + currentStrip.width === nextStrip.x) {
        // Merge
        currentStrip.width += nextStrip.width;
      } else {
        mergedFullHeight.push(currentStrip);
        currentStrip = { ...nextStrip };
      }
    }
    mergedFullHeight.push(currentStrip);
  }
  
  // Merge other vertical strips into wider slices
  const mergedOtherSlices = [];
  if (slices.length > 0) {
    let currentSlice = { ...slices[0] };
    
    for (let i = 1; i < slices.length; i++) {
      const nextSlice = slices[i];
      
      // Check if slices are adjacent vertically and have same height
      if (Math.abs(currentSlice.y - nextSlice.y) < gridSize && 
          Math.abs(currentSlice.height - nextSlice.height) < gridSize &&
          currentSlice.x + currentSlice.width >= nextSlice.x - gridSize) {
        // Merge
        currentSlice.width = Math.max(currentSlice.width, nextSlice.x + nextSlice.width - currentSlice.x);
      } else {
        mergedOtherSlices.push(currentSlice);
        currentSlice = { ...nextSlice };
      }
    }
    mergedOtherSlices.push(currentSlice);
  }
  
  // Combine: full-height strips first, then other slices
  const allSlices = [...mergedFullHeight, ...mergedOtherSlices];
  
  // Filter to show significant slices
  return allSlices.filter(slice => {
    const isSignificantWidth = slice.width >= 50; // At least 50mm wide
    const isSignificantHeight = slice.height >= 100; // At least 100mm tall
    return isSignificantWidth && isSignificantHeight;
  });
}

function removePiece(pieceId) {
  // Find and remove the piece
  for (const sheet of sheets) {
    const pieceIndex = sheet.pieces.findIndex(p => p.id === pieceId);
    if (pieceIndex !== -1) {
      sheet.pieces.splice(pieceIndex, 1);
      break;
    }
  }
  
  // Remove empty sheets
  sheets = sheets.filter(sheet => sheet.pieces.length > 0);
  
  // Re-arrange remaining pieces
  rearrangePieces();
  
  // Re-render
  renderSheets();
  renderPiecesList();
  renderSheetDetails();
  generateQuotation();
}

function rearrangePieces() {
  // Collect all pieces
  const allPieces = [];
  sheets.forEach(sheet => {
    sheet.pieces.forEach(piece => {
      allPieces.push({
        width: piece.width,
        height: piece.height,
        teakSides: piece.teakSides
      });
    });
  });
  
  // Sort pieces by height (taller first) to maximize full-height usage
  allPieces.sort((a, b) => b.height - a.height);
  
  // Clear all sheets
  sheets = [];
  pieceIdCounter = 0;
  
  // Re-add all pieces with optimized placement
  allPieces.forEach(piece => {
    addPieceToSheetOptimized(piece.width, piece.height, piece.teakSides);
  });
}

function addPieceToSheetOptimized(length, width, teakSides) {
  let added = false;

  // Try to add the piece to an existing sheet, prioritizing full-height placement
  for (const sheet of sheets) {
    const didFit = tryFitPieceOptimized(sheet, length, width, teakSides);
    if (didFit) {
      added = true;
      break;
    }
  }

  // If no sheet can fit the piece, create a new sheet
  if (!added) {
    const newSheet = {
      width: sheetWidth,
      height: sheetHeight,
      pieces: [],
    };

    const didFit = tryFitPieceOptimized(newSheet, length, width, teakSides);
    if (!didFit) {
      return false;
    }

    sheets.push(newSheet);
  }

  return true;
}

function tryFitPieceOptimized(sheet, length, width, teakSides) {
  // Try full-height placement first (if piece height is close to sheet height)
  const isFullHeight = Math.abs(length - sheetHeight) < 50 || Math.abs(width - sheetHeight) < 50;
  
  if (isFullHeight) {
    // Try to place at the rightmost edge to create clean vertical cuts
    if (canFit(sheet, length, width)) {
      if (placePieceAtEdge(sheet, length, width, false, teakSides)) return true;
    }
    if (canFit(sheet, width, length)) {
      if (placePieceAtEdge(sheet, width, length, true, teakSides)) return true;
    }
  }
  
  // Try original orientation
  if (canFit(sheet, length, width)) {
    placePiece(sheet, length, width, false, teakSides);
    return true;
  }

  // Try rotated orientation
  if (canFit(sheet, width, length)) {
    placePiece(sheet, width, length, true, teakSides);
    return true;
  }

  return false;
}

function placePieceAtEdge(sheet, pieceWidth, pieceHeight, isRotated, teakSides) {
  // Try to place at the rightmost edge to create clean vertical strips
  const targetX = sheet.width - pieceWidth;
  
  for (let y = 0; y <= sheet.height - pieceHeight; y++) {
    if (!isOverlapping(sheet, targetX, y, pieceWidth, pieceHeight)) {
      sheet.pieces.push({
        id: pieceIdCounter++,
        x: targetX,
        y,
        width: pieceWidth,
        height: pieceHeight,
        isRotated,
        teakSides: teakSides || [],
      });
      return true;
    }
  }
  
  // If right edge doesn't work, try left edge
  for (let y = 0; y <= sheet.height - pieceHeight; y++) {
    if (!isOverlapping(sheet, 0, y, pieceWidth, pieceHeight)) {
      sheet.pieces.push({
        id: pieceIdCounter++,
        x: 0,
        y,
        width: pieceWidth,
        height: pieceHeight,
        isRotated,
        teakSides: teakSides || [],
      });
      return true;
    }
  }
  
  return false;
}

function renderPiecesList() {
  const tableBody = document.getElementById('pieces-table-body');
  tableBody.innerHTML = '';
  
  if (sheets.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5">No pieces added yet.</td></tr>';
    return;
  }
  
  sheets.forEach((sheet, sheetIndex) => {
    sheet.pieces.forEach((piece, pieceIndex) => {
      const row = document.createElement('tr');
      
      const pieceWidthConverted = UnitConverter.fromMM(piece.width, currentUnit);
      const pieceHeightConverted = UnitConverter.fromMM(piece.height, currentUnit);
      
      row.innerHTML = `
        <td>#${piece.id}</td>
        <td>${pieceWidthConverted} × ${pieceHeightConverted}${currentUnit}</td>
        <td>Sheet ${sheetIndex + 1}</td>
        <td>${piece.teakSides.length > 0 ? piece.teakSides.join(', ') : 'None'}</td>
        <td>
          <button class="btn-remove" onclick="removePiece(${piece.id})">
            <i class="fas fa-trash"></i> Remove
          </button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  });
}

function renderSheetDetails() {
  const tableBody = document.getElementById('sheet-table-body');
  tableBody.innerHTML = '';

  sheets.forEach((sheet, index) => {
    const remainingArea = (sheet.width * sheet.height) - sheet.pieces.reduce((acc, piece) => acc + (piece.width * piece.height), 0);
    const remainingLength = UnitConverter.fromMM(sheet.width - Math.max(...sheet.pieces.map(piece => piece.x + piece.width)), currentUnit);
    const remainingWidth = UnitConverter.fromMM(sheet.height - Math.max(...sheet.pieces.map(piece => piece.y + piece.height)), currentUnit);
    const numberOfCuts = sheet.pieces.length - 1;
    const teakMeters = sheet.pieces.reduce((acc, piece) => acc + calculateTeakMeters(piece), 0);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>Sheet ${index + 1}</td>
      <td>${(remainingArea / 1e6).toFixed(2)} m²</td>
      <td>${remainingLength.toFixed(2)} ${currentUnit}</td>
      <td>${remainingWidth.toFixed(2)} ${currentUnit}</td>
      <td>${numberOfCuts}</td>
      <td>${teakMeters.toFixed(2)} m</td>
    `;
    tableBody.appendChild(row);
  });
}

function calculateTeakMeters(piece) {
  let meters = 0;
  if (piece.teakSides.includes('top') || piece.teakSides.includes('bottom')) {
    meters += piece.width / 1000;
  }
  if (piece.teakSides.includes('left') || piece.teakSides.includes('right')) {
    meters += piece.height / 1000;
  }
  return meters;
}

function generateQuotation() {
  const quotationDiv = document.getElementById('quotation');
  
  if (sheets.length === 0) {
    quotationDiv.innerHTML = '<p>No quotation available. Add pieces to generate.</p>';
    return;
  }

  const totalSheets = sheets.length;
  const totalCuts = sheets.reduce((acc, sheet) => acc + (sheet.pieces.length - 1), 0);
  const totalTeakMeters = sheets.reduce((acc, sheet) => acc + sheet.pieces.reduce((acc, piece) => acc + calculateTeakMeters(piece), 0), 0);

  const sheetTotal = totalSheets * sheetCost;
  const cutsTotal = totalCuts * cutCost;
  const teakTotal = totalTeakMeters * teakCost;
  const grandTotal = sheetTotal + cutsTotal + teakTotal;

  const sheetWidthConverted = UnitConverter.fromMM(sheetWidth, currentUnit);
  const sheetHeightConverted = UnitConverter.fromMM(sheetHeight, currentUnit);
  const currency = selectedWood ? 'MVR' : 'RF';
  const woodName = selectedWood ? selectedWood.name : 'Plywood';
  const shopName = selectedShop ? selectedShop.name : 'Default';

  quotationDiv.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Quantity</th>
          <th>Unit Price (${currency})</th>
          <th>Total (${currency})</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${woodName} Sheets (${sheetWidthConverted}${currentUnit} × ${sheetHeightConverted}${currentUnit}) - ${shopName}</td>
          <td>${totalSheets}</td>
          <td>${sheetCost.toFixed(2)}</td>
          <td>${sheetTotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Cuts (@${UnitConverter.fromMM(woodWaste, currentUnit)}${currentUnit} blade width)</td>
          <td>${totalCuts}</td>
          <td>${cutCost.toFixed(2)}</td>
          <td>${cutsTotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Teak Edging</td>
          <td>${totalTeakMeters.toFixed(2)} m</td>
          <td>${teakCost.toFixed(2)}</td>
          <td>${teakTotal.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3"><strong>Grand Total</strong></td>
          <td><strong>${grandTotal.toFixed(2)} ${currency}</strong></td>
        </tr>
      </tbody>
    </table>
  `;
}

function buildShareText() {
  if (sheets.length === 0) return 'No quotation available.';

  const totalSheets = sheets.length;
  const totalCuts = sheets.reduce((acc, sheet) => acc + (sheet.pieces.length - 1), 0);
  const totalTeakMeters = sheets.reduce(
    (acc, sheet) => acc + sheet.pieces.reduce((acc2, piece) => acc2 + calculateTeakMeters(piece), 0),
    0
  );

  const sheetTotal = totalSheets * sheetCost;
  const cutsTotal = totalCuts * cutCost;
  const teakTotal = totalTeakMeters * teakCost;
  const grandTotal = sheetTotal + cutsTotal + teakTotal;

  const sheetWidthConverted = UnitConverter.fromMM(sheetWidth, currentUnit);
  const sheetHeightConverted = UnitConverter.fromMM(sheetHeight, currentUnit);

  return [
    'Maa Wadi Mv - Quotation',
    `Sheets: ${totalSheets} (size ${sheetWidthConverted}${currentUnit} × ${sheetHeightConverted}${currentUnit})`,
    `Cuts: ${totalCuts}`,
    `Teak edging: ${totalTeakMeters.toFixed(2)} m`,
    `Grand total: ${grandTotal.toFixed(2)} RF`
  ].join('\n');
}

function setupActionButtons() {
  const printBtn = document.getElementById('printQuotation');
  const exportBtn = document.getElementById('exportPDF');
  const shareBtn = document.getElementById('shareQuotation');

  if (printBtn) {
    printBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.print();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const sheetContainer = document.getElementById('sheet-container');
      const sheetEls = sheetContainer ? Array.from(sheetContainer.querySelectorAll('.sheet')) : [];
      if (sheetEls.length === 0) {
        alert('No sheets to export. Add pieces first.');
        return;
      }

      if (!window.html2canvas || !window.jspdf || !window.jspdf.jsPDF) {
        alert('PDF export libraries are not loaded. Please refresh the page.');
        return;
      }

      try {
        const pdf = new window.jspdf.jsPDF({
          orientation: 'l',
          unit: 'mm',
          format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 8;
        const usableWidth = pageWidth - margin * 2;
        const usableHeight = pageHeight - margin * 2;

        for (let i = 0; i < sheetEls.length; i++) {
          const sheetEl = sheetEls[i];

          const canvas = await window.html2canvas(sheetEl, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            scrollX: 0,
            scrollY: -window.scrollY
          });

          const imgData = canvas.toDataURL('image/png');
          const imgProps = pdf.getImageProperties(imgData);
          const scale = Math.min(usableWidth / imgProps.width, usableHeight / imgProps.height);
          const imgWidth = imgProps.width * scale;
          const imgHeight = imgProps.height * scale;

          if (i > 0) pdf.addPage();
          const x = margin + (usableWidth - imgWidth) / 2;
          const y = margin + (usableHeight - imgHeight) / 2;
          pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        }

        pdf.save('wood-sheets.pdf');
      } catch (err) {
        console.error(err);
        alert('Failed to export PDF.');
      }
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const text = buildShareText();

      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Maa Wadi Mv Quotation',
            text
          });
          return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
          alert('Quotation copied to clipboard.');
          return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Quotation copied to clipboard.');
      } catch (err) {
        console.error(err);
        alert('Sharing failed.');
      }
    });
  }
}

function parseCsvLine(line, delimiter = ',') {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if ((ch === delimiter || ch === '\t') && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += ch;
  }

  result.push(current);
  return result;
}

function normalizeHeaderName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function detectUnitFromHeader(headerCell) {
  const raw = String(headerCell || '').toLowerCase();
  const match = raw.match(/\(([^)]+)\)/);
  if (!match) return null;

  const unit = match[1].trim();
  if (unit === 'mm' || unit === 'millimeter' || unit === 'millimeters') return 'mm';
  if (unit === 'cm' || unit === 'centimeter' || unit === 'centimeters') return 'cm';
  if (unit === 'm' || unit === 'meter' || unit === 'meters') return 'm';
  if (unit === 'in' || unit === 'inch' || unit === 'inches') return 'in';
  return null;
}

function convertToMM(value, unit) {
  const num = Number(value);
  if (!Number.isFinite(num)) return NaN;
  if (!unit || unit === 'mm') return num;
  if (unit === 'cm') return num * 10;
  if (unit === 'm') return num * 1000;
  if (unit === 'in') return num * 25.4;
  return num;
}

function parsePiecesFromCsvText(csvText, options) {
  const opts = options || { woodOnly: false };
  const lines = String(csvText || '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  console.log('CSV lines:', lines);

  if (lines.length < 2) {
    return { pieces: [], errors: ['CSV has no data rows.'], stats: { skippedNonWoodRows: 0, skippedInvalidRows: 0 } };
  }

  // Auto-detect delimiter (comma or tab)
  const firstLine = lines[0];
  const tabSplit = firstLine.split('\t');
  const commaSplit = firstLine.split(',');
  const semicolonSplit = firstLine.split(';');
  
  // Choose delimiter that produces most columns (minimum 2)
  let delimiter = ',';
  let maxCols = commaSplit.length;
  
  if (tabSplit.length > maxCols && tabSplit.length >= 2) {
    delimiter = '\t';
    maxCols = tabSplit.length;
  }
  if (semicolonSplit.length > maxCols && semicolonSplit.length >= 2) {
    delimiter = ';';
    maxCols = semicolonSplit.length;
  }
  
  console.log('First line:', JSON.stringify(firstLine));
  console.log('Tab split:', tabSplit.length, 'Comma split:', commaSplit.length, 'Semicolon split:', semicolonSplit.length);
  console.log('Detected delimiter:', delimiter === '\t' ? 'TAB' : delimiter === ';' ? 'SEMICOLON' : 'COMMA');

  const headerCellsRaw = parseCsvLine(lines[0], delimiter);
  const header = headerCellsRaw.map(normalizeHeaderName);

  console.log('CSV header raw:', headerCellsRaw);
  console.log('CSV header normalized:', header);

  const idxQty = header.findIndex(h => h === 'qty' || h === 'quantity');
  const idxLength = header.findIndex(h => h.startsWith('length'));
  const idxWidth = header.findIndex(h => h.startsWith('width'));
  const idxMaterial = header.findIndex(h => h === 'material');

  const lengthUnit = idxLength >= 0 ? (detectUnitFromHeader(headerCellsRaw[idxLength]) || 'mm') : 'mm';
  const widthUnit = idxWidth >= 0 ? (detectUnitFromHeader(headerCellsRaw[idxWidth]) || 'mm') : 'mm';

  console.log('Detected units:', { lengthUnit, widthUnit });
  console.log('Column indices:', { idxQty, idxLength, idxWidth, idxMaterial });

  const errors = [];
  if (idxQty === -1) errors.push('Missing column: Qty');
  if (idxLength === -1) errors.push('Missing column: Length (mm)');
  if (idxWidth === -1) errors.push('Missing column: Width (mm)');
  if (opts.woodOnly && idxMaterial === -1) errors.push('Missing column: Material (needed for Wood-only import)');
  if (errors.length) return { pieces: [], errors, stats: { skippedNonWoodRows: 0, skippedInvalidRows: 0 } };

  const pieces = [];
  const stats = { skippedNonWoodRows: 0, skippedInvalidRows: 0 };

  for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
    const cols = parseCsvLine(lines[rowIndex], delimiter);
    console.log(`Row ${rowIndex} cols:`, cols);

    if (opts.woodOnly) {
      const mat = String(cols[idxMaterial] || '').trim().toLowerCase();
      if (mat && !mat.includes('wood')) {
        stats.skippedNonWoodRows++;
        console.log('Skipping non-wood row:', mat);
        continue;
      }
    }

    const qty = parseInt((cols[idxQty] || '').trim(), 10);
    const length = convertToMM(parseFloat((cols[idxLength] || '').trim()), lengthUnit);
    const width = convertToMM(parseFloat((cols[idxWidth] || '').trim()), widthUnit);

    console.log(`Parsed row ${rowIndex}:`, { qty, length, width });

    if (!Number.isFinite(qty) || qty <= 0) {
      stats.skippedInvalidRows++;
      console.log('Skipping invalid qty:', qty);
      continue;
    }
    if (!Number.isFinite(length) || !Number.isFinite(width) || length <= 0 || width <= 0) {
      stats.skippedInvalidRows++;
      console.log('Skipping invalid dimensions:', { length, width });
      continue;
    }

    pieces.push({ qty, length, width });
  }

  if (pieces.length === 0) {
    return { pieces: [], errors: ['No valid rows found. Expected numeric Qty, Length, Width.'], stats };
  }

  return { pieces, errors: [], stats };
}

function renderCsvStatus(message, isError) {
  const statusDiv = document.getElementById('csvImportStatus');
  if (!statusDiv) return;
  statusDiv.textContent = message;
  statusDiv.style.color = isError ? '#b00020' : '#1b5e20';
}

function setupCsvImport() {
  const fileInput = document.getElementById('csvFileInput');
  const importBtn = document.getElementById('importCsvBtn');
  const replaceCheckbox = document.getElementById('csvReplaceExisting');
  const woodOnlyCheckbox = document.getElementById('csvWoodOnly');

  if (!fileInput || !importBtn) {
    console.error('CSV import elements not found', { fileInput, importBtn });
    return;
  }

  importBtn.addEventListener('click', () => {
    console.log('CSV import button clicked');
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      console.warn('No file selected');
      renderCsvStatus('Please choose a CSV file first.', true);
      return;
    }

    console.log('File selected:', file.name, file.size, file.type);
    const reader = new FileReader();
    reader.onerror = (e) => {
      console.error('FileReader error', e);
      renderCsvStatus('Failed to read file.', true);
    };
    reader.onload = () => {
      console.log('FileReader loaded, length:', reader.result.length);
      const woodOnly = !!(woodOnlyCheckbox && woodOnlyCheckbox.checked);
      const { pieces, errors, stats } = parsePiecesFromCsvText(reader.result, { woodOnly });
      console.log('Parsed CSV:', { pieces, errors, stats });
      if (errors.length) {
        renderCsvStatus(errors.join(' | '), true);
        return;
      }

      if (replaceCheckbox && replaceCheckbox.checked) {
        sheets = [];
      }

      let addedCount = 0;
      let skippedCount = 0;
      let invalidCount = 0;
      let unfitCount = 0;

      for (const item of pieces) {
        for (let i = 0; i < item.qty; i++) {
          if (item.length > sheetWidth || item.width > sheetHeight) {
            skippedCount++;
            continue;
          }
          if (!Number.isFinite(item.length) || !Number.isFinite(item.width) || item.length <= 0 || item.width <= 0) {
            invalidCount++;
            continue;
          }
          const didAdd = addPieceToSheet(item.length, item.width, []);
          if (!didAdd) {
            unfitCount++;
            continue;
          }
          addedCount++;
        }
      }

      renderSheets();
      renderPiecesList();
      renderSheetDetails();
      generateQuotation();

      const parts = [`Imported ${addedCount} piece(s).`];
      if (skippedCount) parts.push(`Skipped ${skippedCount} oversized piece(s).`);
      if (invalidCount) parts.push(`Skipped ${invalidCount} invalid piece(s).`);
      if (unfitCount) parts.push(`Skipped ${unfitCount} piece(s) that cannot fit (blade gap).`);
      if (stats && stats.skippedNonWoodRows) parts.push(`Skipped ${stats.skippedNonWoodRows} non-wood row(s).`);
      if (stats && stats.skippedInvalidRows && stats.skippedInvalidRows !== invalidCount) {
        parts.push(`Skipped ${stats.skippedInvalidRows} invalid row(s).`);
      }
      renderCsvStatus(parts.join(' '), false);
    };

    reader.readAsText(file);
  });
}

// Initialize with empty state
renderSheets();
renderPiecesList();
renderSheetDetails();
generateQuotation();
setupActionButtons();
setupCsvImport();