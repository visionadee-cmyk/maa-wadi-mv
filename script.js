// Constants
const woodWaste = 10; // 10mm waste between pieces
const cutCost = 10; // Cost per cut in RF
const teakCost = 10; // Cost per meter of teak in RF
let sheets = []; // Array to store sheets and their pieces
let pieces = []; // Array to store all pieces
let currentUnit = 'mm'; // Default unit
let pieceIdCounter = 0; // Counter for generating unique piece IDs

// Customer information
let customerName = '';
let customerPhone = '';
let customerAddress = '';
let customerNotes = '';

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
          generateCostComparison();
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

// Firebase Integration
let firebaseInitialized = false;
let blenderSyncEnabled = false;
let piecesRef = null;
let storageRef = null;

// 3D Viewer
let scene, camera, renderer, controls;
let viewerInitialized = false;

function initializeFirebase() {
  if (firebaseInitialized) {
    console.log('Firebase already initialized');
    return;
  }

  const firebaseConfig = {
    apiKey: "AIzaSyDvIMuG6FIQWSMbN2rt4x_AUwAJAsIql24",
    authDomain: "maa-wadi-mv.firebaseapp.com",
    projectId: "maa-wadi-mv",
    storageBucket: "maa-wadi-mv.firebasestorage.app",
    messagingSenderId: "434790166445",
    appId: "1:434790166445:web:ea1ce4da918a2ca105fb24",
    measurementId: "G-GC0E4PX66Y",
    databaseURL: "https://maa-wadi-mv-default-rtdb.firebaseio.com"
  };

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    firebaseInitialized = true;
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    if (error.code === 'app/duplicate-app') {
      console.log('Firebase app already exists, using existing instance');
      firebaseInitialized = true;
    } else {
      updateSyncStatus('disconnected', 'Firebase connection failed');
    }
  }
}

// Firestore Functions
let db = null;

function initializeFirestore() {
  if (!firebaseInitialized) {
    console.error('Firebase not initialized');
    return false;
  }
  
  try {
    db = firebase.firestore();
    console.log('Firestore initialized successfully');
    return true;
  } catch (error) {
    console.error('Firestore initialization error:', error);
    return false;
  }
}

async function saveProjectToFirestore(projectName) {
  if (!db) {
    if (!initializeFirestore()) {
      alert('Failed to initialize Firestore. Please check your internet connection.');
      return false;
    }
  }

  try {
    const projectData = {
      name: projectName,
      sheets: sheets,
      pieces: pieces,
      pieceIdCounter: pieceIdCounter,
      cabinets: cabinets,
      hardwareList: hardwareList,
      customerName: customerName,
      customerPhone: customerPhone,
      customerAddress: customerAddress,
      customerNotes: customerNotes,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    console.log('Saving project to Firestore:', projectName);
    const docRef = await db.collection('projects').doc(projectName).set(projectData);
    console.log('Project saved successfully:', projectName);
    return true;
  } catch (error) {
    console.error('Error saving project:', error);
    alert('Failed to save project: ' + error.message);
    return false;
  }
}

async function loadProjectFromFirestore(projectName) {
  if (!db) {
    if (!initializeFirestore()) {
      alert('Failed to initialize Firestore');
      return false;
    }
  }

  try {
    const docRef = db.collection('projects').doc(projectName);
    const doc = await docRef.get();

    if (!doc.exists) {
      alert(`Project "${projectName}" not found`);
      return false;
    }

    const projectData = doc.data();
    
    // Restore project data
    sheets = projectData.sheets || [];
    pieces = projectData.pieces || [];
    pieceIdCounter = projectData.pieceIdCounter || 0;
    cabinets = projectData.cabinets || [];
    hardwareList = projectData.hardwareList || [];
    customerName = projectData.customerName || '';
    customerPhone = projectData.customerPhone || '';
    customerAddress = projectData.customerAddress || '';
    customerNotes = projectData.customerNotes || '';

    // Update UI
    const customerNameEl = document.getElementById('customerName');
    if (customerNameEl) customerNameEl.value = customerName;
    
    const customerPhoneEl = document.getElementById('customerPhone');
    if (customerPhoneEl) customerPhoneEl.value = customerPhone;
    
    const customerAddressEl = document.getElementById('customerAddress');
    if (customerAddressEl) customerAddressEl.value = customerAddress;
    
    const customerNotesEl = document.getElementById('customerNotes');
    if (customerNotesEl) customerNotesEl.value = customerNotes;

    renderSheets();
    renderPiecesList();
    renderSheetDetails();
    generateQuotation();
    generateCostComparison();
    renderHardwareList();

    console.log('Project loaded successfully:', projectName);
    alert(`Project "${projectName}" loaded successfully!`);
    return true;
  } catch (error) {
    console.error('Error loading project:', error);
    alert('Failed to load project: ' + error.message);
    return false;
  }
}

async function listProjectsFromFirestore() {
  if (!db) {
    if (!initializeFirestore()) {
      alert('Failed to initialize Firestore');
      return [];
    }
  }

  try {
    const snapshot = await db.collection('projects').orderBy('updatedAt', 'desc').get();
    const projects = [];
    
    snapshot.forEach(doc => {
      projects.push({
        name: doc.id,
        ...doc.data()
      });
    });

    return projects;
  } catch (error) {
    console.error('Error listing projects:', error);
    alert('Failed to list projects: ' + error.message);
    return [];
  }
}

// 3D Viewer Functions
function initialize3DViewer() {
  if (viewerInitialized) return;

  const container = document.getElementById('viewer-container');
  const placeholder = document.getElementById('viewer-placeholder');

  // Remove placeholder
  if (placeholder) {
    placeholder.style.display = 'none';
  }

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // Camera setup
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(5, 5, 5);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 10);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  // Store lights for sync
  window.sceneLights = {
    ambient: ambientLight,
    directional: directionalLight
  };

  // Listen for camera sync from Blender
  if (typeof firebase !== 'undefined' && firebase.database) {
    const cameraRef = firebase.database().ref('blender/camera');
    cameraRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data && data.camera) {
        applyCameraData(data.camera);
      }
      if (data && data.lighting) {
        applyLightingData(data.lighting);
      }
    });
  }

  // Orbit controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Grid helper
  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);

  // Handle resize
  window.addEventListener('resize', onWindowResize);

  viewerInitialized = true;
  animate();
}

function onWindowResize() {
  const container = document.getElementById('viewer-container');
  if (!container || !camera || !renderer) return;

  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

function applyCameraData(cameraData) {
  if (!camera) return;

  // Apply position
  if (cameraData.position) {
    camera.position.set(
      cameraData.position.x || 5,
      cameraData.position.y || 5,
      cameraData.position.z || 5
    );
  }

  // Apply rotation (convert Blender Euler to Three.js)
  if (cameraData.rotation) {
    camera.rotation.set(
      cameraData.rotation.x || 0,
      cameraData.rotation.y || 0,
      cameraData.rotation.z || 0
    );
  }

  // Apply FOV
  if (cameraData.fov) {
    camera.fov = cameraData.fov * (180 / Math.PI); // Convert radians to degrees
    camera.updateProjectionMatrix();
  }

  // Update controls target to look at origin
  if (controls) {
    controls.target.set(0, 0, 0);
    controls.update();
  }
}

function applyLightingData(lightingData) {
  if (!scene) return;

  // Apply world background color
  if (lightingData.world_color) {
    scene.background = new THREE.Color(
      lightingData.world_color.r,
      lightingData.world_color.g,
      lightingData.world_color.b
    );
  }

  // Apply light objects from Blender
  if (lightingData.lights && Array.isArray(lightingData.lights)) {
    // Remove existing Blender lights (keep default lights)
    scene.children = scene.children.filter(child => {
      return !child.userData.isBlenderLight;
    });

    // Add Blender lights
    lightingData.lights.forEach(blenderLight => {
      let threeLight;

      switch (blenderLight.type) {
        case 'SUN':
          threeLight = new THREE.DirectionalLight(0xffffff, blenderLight.energy / 100);
          break;
        case 'POINT':
          threeLight = new THREE.PointLight(0xffffff, blenderLight.energy / 100);
          break;
        case 'SPOT':
          threeLight = new THREE.SpotLight(0xffffff, blenderLight.energy / 100);
          break;
        case 'AREA':
          threeLight = new THREE.RectAreaLight(0xffffff, blenderLight.energy / 100);
          break;
        default:
          threeLight = new THREE.DirectionalLight(0xffffff, blenderLight.energy / 100);
      }

      if (threeLight) {
        threeLight.position.set(
          blenderLight.position.x,
          blenderLight.position.y,
          blenderLight.position.z
        );
        threeLight.rotation.set(
          blenderLight.rotation.x,
          blenderLight.rotation.y,
          blenderLight.rotation.z
        );

        if (blenderLight.color) {
          threeLight.color.setRGB(
            blenderLight.color.r,
            blenderLight.color.g,
            blenderLight.color.b
          );
        }

        threeLight.userData.isBlenderLight = true;
        scene.add(threeLight);
      }
    });
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

function load3DModel(modelUrl) {
  if (!viewerInitialized) {
    initialize3DViewer();
  }

  const loader = new THREE.GLTFLoader();
  loader.load(
    modelUrl,
    function (gltf) {
      // Remove existing models
      const models = scene.children.filter(child => child.type === 'Group' || child.type === 'Mesh');
      models.forEach(model => scene.remove(model));

      // Add new model
      const model = gltf.scene;
      
      // Center and scale model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      model.position.sub(center);
      
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 5 / maxDim;
      model.scale.setScalar(scale);

      scene.add(model);
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
      console.error('Error loading 3D model:', error);
    }
  );
}

function load3DModelFromBase64(base64Data) {
  if (!viewerInitialized) {
    initialize3DViewer();
  }

  if (!base64Data) {
    console.error('No Base64 data provided');
    return;
  }

  try {
    // Decode Base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create Blob from binary data
    const blob = new Blob([bytes], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);

    // Load GLTF from Blob URL
    const loader = new THREE.GLTFLoader();
    loader.load(
      url,
      function (gltf) {
        // Remove existing models
        const models = scene.children.filter(child => child.type === 'Group' || child.type === 'Mesh');
        models.forEach(model => scene.remove(model));

        // Add new model
        const model = gltf.scene;
        
        // Center and scale model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        model.position.sub(center);
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;
        model.scale.setScalar(scale);

        scene.add(model);
        
        // Clean up URL
        URL.revokeObjectURL(url);
      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      function (error) {
        console.error('Error loading 3D model from Base64:', error);
        URL.revokeObjectURL(url);
      }
    );
  } catch (error) {
    console.error('Error decoding Base64:', error);
  }
}

function clear3DScene() {
  if (!scene) return;
  
  // Remove all meshes from scene
  const objectsToRemove = [];
  scene.traverse((child) => {
    if (child.isMesh) {
      objectsToRemove.push(child);
    }
  });
  
  objectsToRemove.forEach((obj) => {
    scene.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(mat => mat.dispose());
      } else {
        obj.material.dispose();
      }
    }
  });
}

function generate3DBox(length, width, thickness, name, position) {
  if (!viewerInitialized) {
    initialize3DViewer();
  }

  // Create box geometry (convert to meters for Three.js)
  const geometry = new THREE.BoxGeometry(
    length / 1000,  // Convert mm to meters
    thickness / 1000,
    width / 1000
  );

  // Create material with random color
  const colors = [0x8B4513, 0xA0522D, 0xCD853F, 0xDEB887, 0xD2691E]; // Wood tones
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const material = new THREE.MeshPhongMaterial({ 
    color: randomColor,
    shininess: 30
  });

  // Create mesh
  const box = new THREE.Mesh(geometry, material);
  
  // Use position from Blender if available, otherwise random
  if (position) {
    box.position.x = position.x;
    box.position.y = position.y;
    box.position.z = position.z;
  } else {
    box.position.x = (Math.random() - 0.5) * 4;
    box.position.y = (Math.random() - 0.5) * 2;
    box.position.z = (Math.random() - 0.5) * 4;
  }

  // Add to scene
  scene.add(box);

  // Add edges for better visibility
  const edges = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
  box.add(line);
}

function updateSyncStatus(status, text) {
  const syncStatus = document.getElementById('syncStatus');
  const syncIndicator = document.getElementById('syncIndicator');
  const syncText = document.getElementById('syncText');

  if (syncStatus && syncIndicator && syncText) {
    syncStatus.style.display = 'flex';
    syncStatus.className = `sync-status ${status}`;
    syncText.textContent = text;
  }
}

function enableBlenderSync() {
  if (!firebaseInitialized) {
    initializeFirebase();
  }

  if (!firebaseInitialized) {
    alert('Failed to initialize Firebase. Sync cannot be enabled.');
    return;
  }

  blenderSyncEnabled = true;
  updateSyncStatus('syncing', 'Connecting to Blender...');

  // Set up Firebase listener for pieces
  piecesRef = firebase.database().ref('blender/pieces');
  
  let lastPiecesData = null;
  
  piecesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    
    if (data && Object.keys(data).length > 0) {
      // Create a signature of the current data (excluding timestamp)
      const currentSignature = JSON.stringify(Object.values(data).map(p => ({
        name: p.name,
        length: p.length,
        width: p.width,
        thickness: p.thickness,
        position: p.position
      })));
      
      // Only update if data has actually changed
      if (currentSignature !== lastPiecesData) {
        updateSyncStatus('syncing', 'Syncing pieces from Blender...');
        
        // Clear existing pieces
        sheets = [];
        pieceIdCounter = 0;
        
        // Clear 3D scene before adding new boxes
        clear3DScene();
        
        // Add pieces from Firebase
        const piecesArray = Object.values(data);
        
        // Process pieces to create sheets (always do this regardless of model)
        piecesArray.forEach(piece => {
          const teakSides = [];
          if (piece.teak_top) teakSides.push('top');
          if (piece.teak_bottom) teakSides.push('bottom');
          if (piece.teak_left) teakSides.push('left');
          if (piece.teak_right) teakSides.push('right');
          
          // Handle qty field from Blender Cut List addon
          const qty = piece.qty || 1;
          for (let i = 0; i < qty; i++) {
            addPieceToSheetOptimized(piece.length, piece.width, teakSides);
          }

          // Generate 3D boxes from cut list data (only if no Blender model)
          if (piece.length && piece.width && piece.thickness) {
            const position = piece.position || null;
            generate3DBox(piece.length, piece.width, piece.thickness, piece.name, position);
          }
        });
        
        // Check if Blender GLB model is available (new _model key or old model_base64 in pieces)
        let blenderModel = null;
        
        // Check for new _model key
        if (data._model && data._model.model_base64) {
          blenderModel = data._model.model_base64;
          console.log('Found Blender GLB model in _model key, size:', blenderModel.length);
        } else {
          // Fall back to checking individual pieces (old method)
          for (const piece of piecesArray) {
            if (piece.model_base64) {
              blenderModel = piece.model_base64;
              console.log('Found Blender GLB model in piece, size:', piece.model_base64.length);
              break;
            }
          }
        }
        
        if (blenderModel) {
          // Load Blender GLB model instead of generated boxes
          console.log('Loading Blender GLB model...');
          load3DModelFromBase64(blenderModel);
        } else {
          console.log('No Blender GLB model found, using generated boxes from cut list');
        }
        
        renderSheets();
        renderPiecesList();
        renderSheetDetails();
        generateQuotation();
        generateCostComparison();
        initialize3DViewer();
        
        updateSyncStatus('connected', `Synced ${piecesArray.length} pieces from Blender`);
        lastPiecesData = currentSignature;
      }
    } else {
      updateSyncStatus('connected', 'Connected - Waiting for Blender data...');
    }
  }, (error) => {
    console.error('Firebase listener error:', error);
    updateSyncStatus('disconnected', 'Sync error: ' + error.message);
  });

  document.getElementById('blenderSyncBtn').textContent = 'Disable Sync';
  document.getElementById('blenderSyncBtn').onclick = disableBlenderSync;
}

function disableBlenderSync() {
  blenderSyncEnabled = false;
  
  if (piecesRef) {
    piecesRef.off();
    piecesRef = null;
  }
  
  updateSyncStatus('disconnected', 'Sync disabled');
  document.getElementById('syncStatus').style.display = 'none';
  document.getElementById('blenderSyncBtn').textContent = 'Blender Sync';
  document.getElementById('blenderSyncBtn').onclick = enableBlenderSync;
}


// Template Management Functions
// Cabinet/Asset Management
let cabinets = [];
let hardwareList = [];

function openCabinetModal() {
  document.getElementById('addCabinetModal').style.display = 'flex';
}

function closeCabinetModal() {
  document.getElementById('addCabinetModal').style.display = 'none';
  // Reset form
  document.getElementById('cabinetName').value = '';
  document.getElementById('cabinetLength').value = '';
  document.getElementById('cabinetHeight').value = '';
  document.getElementById('cabinetDepth').value = '';
  document.getElementById('cabinetQuantity').value = '1';
  document.getElementById('cabinetMaterial').value = '';
  document.getElementById('cabinetThickness').value = '18';
  document.getElementById('cabinetDoors').checked = false;
  document.getElementById('cabinetShelves').checked = false;
  document.getElementById('cabinetDividers').checked = false;
  document.getElementById('cabinetHandles').checked = false;
  document.getElementById('cabinetSkirting').checked = false;
  document.getElementById('cabinetDoorCount').value = '2';
  document.getElementById('cabinetNotes').value = '';
  
  // Reset teak checkboxes
  document.querySelectorAll('input[name="cabinetTeak"]').forEach(checkbox => {
    checkbox.checked = false;
  });
}

function addCabinetAndGeneratePieces() {
  const cabinetName = document.getElementById('cabinetName').value.trim();
  const length = parseFloat(document.getElementById('cabinetLength').value);
  const height = parseFloat(document.getElementById('cabinetHeight').value);
  const depth = parseFloat(document.getElementById('cabinetDepth').value);
  const quantity = parseInt(document.getElementById('cabinetQuantity').value);
  const material = document.getElementById('cabinetMaterial').value.trim();
  const thickness = parseFloat(document.getElementById('cabinetThickness').value);
  const hasDoors = document.getElementById('cabinetDoors').checked;
  const hasShelves = document.getElementById('cabinetShelves').checked;
  const hasDividers = document.getElementById('cabinetDividers').checked;
  const hasHandles = document.getElementById('cabinetHandles').checked;
  const hasSkirting = document.getElementById('cabinetSkirting').checked;
  const doorCount = parseInt(document.getElementById('cabinetDoorCount').value);
  const notes = document.getElementById('cabinetNotes').value.trim();
  
  // Get teak finishing sides
  const teakSides = Array.from(document.querySelectorAll('input[name="cabinetTeak"]:checked')).map(input => input.value);

  if (!cabinetName || !length || !height || !depth) {
    alert('Please fill in cabinet name and dimensions');
    return;
  }

  // Generate pieces based on cabinet specification
  const piecesGenerated = generatePiecesFromCabinet({
    name: cabinetName,
    length,
    height,
    depth,
    quantity,
    material,
    thickness,
    hasDoors,
    hasShelves,
    hasDividers,
    hasHandles,
    hasSkirting,
    doorCount,
    notes,
    teakSides
  });

  // Generate hardware requirements
  const hardwareGenerated = generateHardwareForCabinet({
    name: cabinetName,
    length,
    height,
    depth,
    quantity,
    hasDoors,
    hasShelves,
    hasDividers,
    hasHandles,
    doorCount,
    thickness
  });

  // Save cabinet specification
  cabinets.push({
    id: Date.now(),
    name: cabinetName,
    length,
    height,
    depth,
    quantity,
    material,
    thickness,
    hasDoors,
    hasShelves,
    hasDividers,
    hasHandles,
    hasSkirting,
    doorCount,
    notes,
    teakSides,
    piecesCount: piecesGenerated,
    hardwareCount: hardwareGenerated,
    createdAt: new Date().toISOString()
  });

  closeCabinetModal();
  alert(`Added ${quantity} cabinet(s)\nGenerated ${piecesGenerated} pieces\nGenerated ${hardwareGenerated} hardware items`);
  
  renderSheets();
  renderPiecesList();
  renderSheetDetails();
  generateQuotation();
  generateCostComparison();
  renderHardwareList();
}

function generatePiecesFromCabinet(cabinet) {
  let piecesCount = 0;
  const teakSides = cabinet.teakSides || []; // Use teak sides from cabinet spec

  // Generate pieces for each cabinet quantity
  for (let q = 0; q < cabinet.quantity; q++) {
    const cabinetInstance = q + 1;
    
    // Calculate position for this cabinet instance
    const offsetX = q * (cabinet.length / 1000 + 0.2); // Space between cabinets
    
    // 1. Main cabinet body (sides)
    // Left side panel
    addPieceToSheetOptimized(cabinet.depth, cabinet.height, teakSides, 'Left Side Panel', cabinet.name, cabinetInstance);
    piecesCount++;
    
    // Right side panel
    addPieceToSheetOptimized(cabinet.depth, cabinet.height, teakSides, 'Right Side Panel', cabinet.name, cabinetInstance);
    piecesCount++;
    
    // 2. Top panel
    addPieceToSheetOptimized(cabinet.length, cabinet.depth, teakSides, 'Top Panel', cabinet.name, cabinetInstance);
    piecesCount++;
    
    // 3. Bottom panel
    addPieceToSheetOptimized(cabinet.length, cabinet.depth, teakSides, 'Bottom Panel', cabinet.name, cabinetInstance);
    piecesCount++;
    
    // 4. Back panel
    addPieceToSheetOptimized(cabinet.length, cabinet.height, teakSides, 'Back Panel', cabinet.name, cabinetInstance);
    piecesCount++;
    
    // 5. Front face panel (if specified)
    if (cabinet.hasDoors) {
      addPieceToSheetOptimized(cabinet.length, cabinet.height, teakSides, 'Front Face Panel', cabinet.name, cabinetInstance);
      piecesCount++;
    }
    
    // 6. Middle shelf (if specified)
    if (cabinet.hasShelves) {
      addPieceToSheetOptimized(cabinet.length - (cabinet.thickness * 2), cabinet.depth, teakSides, 'Middle Shelf', cabinet.name, cabinetInstance);
      piecesCount++;
    }
    
    // 7. Divider panels (if specified)
    if (cabinet.hasDividers) {
      // Divider above shelf
      addPieceToSheetOptimized(cabinet.depth, (cabinet.height / 2) - cabinet.thickness, teakSides, 'Upper Divider Panel', cabinet.name, cabinetInstance);
      piecesCount++;
      
      // Divider below shelf
      addPieceToSheetOptimized(cabinet.depth, (cabinet.height / 2) - cabinet.thickness, teakSides, 'Lower Divider Panel', cabinet.name, cabinetInstance);
      piecesCount++;
    }
    
    // 8. Doors (if specified)
    if (cabinet.hasDoors && cabinet.doorCount > 0) {
      const doorWidth = cabinet.length / cabinet.doorCount;
      for (let d = 0; d < cabinet.doorCount; d++) {
        addPieceToSheetOptimized(doorWidth, cabinet.height, teakSides, `Door ${d + 1}`, cabinet.name, cabinetInstance);
        piecesCount++;
      }
    }
    
    // 9. Bottom skirting (if specified - 80mm height)
    if (cabinet.hasSkirting) {
      addPieceToSheetOptimized(cabinet.length, 80, teakSides, 'Bottom Skirting', cabinet.name, cabinetInstance);
      piecesCount++;
    }
    
    // Generate 3D cabinet model
    generate3DCabinetModel(cabinet, offsetX);
  }

  return piecesCount;
}

function generate3DCabinetModel(cabinet, offsetX = 0) {
  if (!viewerInitialized) {
    initialize3DViewer();
  }

  // Create a group for this cabinet
  const cabinetGroup = new THREE.Group();
  
  // Convert dimensions to meters
  const length = cabinet.length / 1000;
  const height = cabinet.height / 1000;
  const depth = cabinet.depth / 1000;
  const thickness = cabinet.thickness / 1000;
  
  // Material for cabinet
  const material = new THREE.MeshPhongMaterial({ 
    color: 0xFFFFFF, // White matte
    shininess: 10,
    transparent: true,
    opacity: 0.9
  });
  
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
  
  // 1. Left side panel
  const leftSideGeo = new THREE.BoxGeometry(thickness, height, depth);
  const leftSide = new THREE.Mesh(leftSideGeo, material);
  leftSide.position.set(-length/2 + thickness/2, 0, 0);
  addEdges(leftSide, leftSideGeo, edgeMaterial);
  cabinetGroup.add(leftSide);
  
  // 2. Right side panel
  const rightSideGeo = new THREE.BoxGeometry(thickness, height, depth);
  const rightSide = new THREE.Mesh(rightSideGeo, material);
  rightSide.position.set(length/2 - thickness/2, 0, 0);
  addEdges(rightSide, rightSideGeo, edgeMaterial);
  cabinetGroup.add(rightSide);
  
  // 3. Top panel
  const topGeo = new THREE.BoxGeometry(length - thickness*2, thickness, depth);
  const top = new THREE.Mesh(topGeo, material);
  top.position.set(0, height/2 - thickness/2, 0);
  addEdges(top, topGeo, edgeMaterial);
  cabinetGroup.add(top);
  
  // 4. Bottom panel
  const bottomGeo = new THREE.BoxGeometry(length - thickness*2, thickness, depth);
  const bottom = new THREE.Mesh(bottomGeo, material);
  bottom.position.set(0, -height/2 + thickness/2, 0);
  addEdges(bottom, bottomGeo, edgeMaterial);
  cabinetGroup.add(bottom);
  
  // 5. Back panel
  const backGeo = new THREE.BoxGeometry(length, height, thickness);
  const back = new THREE.Mesh(backGeo, material);
  back.position.set(0, 0, -depth/2 + thickness/2);
  addEdges(back, backGeo, edgeMaterial);
  cabinetGroup.add(back);
  
  // 6. Middle shelf (if specified)
  if (cabinet.hasShelves) {
    const shelfGeo = new THREE.BoxGeometry(length - thickness*2, thickness, depth);
    const shelf = new THREE.Mesh(shelfGeo, material);
    shelf.position.set(0, 0, 0);
    addEdges(shelf, shelfGeo, edgeMaterial);
    cabinetGroup.add(shelf);
  }
  
  // 7. Divider panels (if specified)
  if (cabinet.hasDividers) {
    const dividerHeight = (height/2) - thickness;
    const dividerGeo = new THREE.BoxGeometry(thickness, dividerHeight, depth);
    
    // Divider above shelf
    const dividerAbove = new THREE.Mesh(dividerGeo, material);
    dividerAbove.position.set(0, height/4 + thickness/2, 0);
    addEdges(dividerAbove, dividerGeo, edgeMaterial);
    cabinetGroup.add(dividerAbove);
    
    // Divider below shelf
    const dividerBelow = new THREE.Mesh(dividerGeo, material);
    dividerBelow.position.set(0, -height/4 - thickness/2, 0);
    addEdges(dividerBelow, dividerGeo, edgeMaterial);
    cabinetGroup.add(dividerBelow);
  }
  
  // 8. Doors (if specified)
  if (cabinet.hasDoors && cabinet.doorCount > 0) {
    const doorWidth = (length - thickness*2) / cabinet.doorCount;
    const doorGeo = new THREE.BoxGeometry(doorWidth - 0.01, height - thickness*2, thickness);
    const doorMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xF5F5F5, // Slightly different color for doors
      shininess: 15
    });
    
    for (let d = 0; d < cabinet.doorCount; d++) {
      const door = new THREE.Mesh(doorGeo, doorMaterial);
      const xPos = -length/2 + thickness + doorWidth/2 + d * doorWidth;
      door.position.set(xPos, 0, depth/2 + thickness/2);
      addEdges(door, doorGeo, edgeMaterial);
      cabinetGroup.add(door);
    }
  }
  
  // 9. Bottom skirting (if specified)
  if (cabinet.hasSkirting) {
    const skirtingHeight = 80 / 1000; // 80mm in meters
    const skirtingGeo = new THREE.BoxGeometry(length, skirtingHeight, thickness);
    const skirting = new THREE.Mesh(skirtingGeo, material);
    skirting.position.set(0, -height/2 - skirtingHeight/2, depth/2 - thickness/2);
    addEdges(skirting, skirtingGeo, edgeMaterial);
    cabinetGroup.add(skirting);
  }
  
  // Position the cabinet group
  cabinetGroup.position.set(offsetX, 0, 0);
  
  // Add to scene
  scene.add(cabinetGroup);
}

function addEdges(mesh, geometry, material) {
  const edges = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(edges, material);
  mesh.add(line);
}

function generateHardwareForCabinet(cabinet) {
  let hardwareCount = 0;
  
  // Generate hardware for each cabinet quantity
  for (let q = 0; q < cabinet.quantity; q++) {
    // 1. Hinges for doors
    if (cabinet.hasDoors && cabinet.doorCount > 0) {
      const hingesPerDoor = 2; // Standard: 2 hinges per door
      const totalHinges = cabinet.doorCount * hingesPerDoor;
      
      hardwareList.push({
        id: Date.now() + hardwareCount,
        cabinetName: cabinet.name,
        cabinetInstance: q + 1,
        type: 'Hinge',
        specification: 'Standard Cabinet Hinge',
        size: '35mm',
        quantity: totalHinges,
        material: 'Steel/Nickel plated',
        notes: 'For door mounting'
      });
      hardwareCount++;
    }
    
    // 2. Door handles
    if (cabinet.hasHandles && cabinet.hasDoors && cabinet.doorCount > 0) {
      const handlePerDoor = 1; // Standard: 1 handle per door
      const totalHandles = cabinet.doorCount * handlePerDoor;
      
      hardwareList.push({
        id: Date.now() + hardwareCount,
        cabinetName: cabinet.name,
        cabinetInstance: q + 1,
        type: 'Handle',
        specification: 'Cabinet Door Handle',
        size: '128mm or 160mm',
        quantity: totalHandles,
        material: 'Stainless Steel/Aluminum',
        notes: 'For door operation'
      });
      hardwareCount++;
    }
    
    // 3. Shelf support pins (if shelves)
    if (cabinet.hasShelves) {
      const pinsPerShelf = 4; // 4 pins per shelf (2 per side)
      
      hardwareList.push({
        id: Date.now() + hardwareCount,
        cabinetName: cabinet.name,
        cabinetInstance: q + 1,
        type: 'Shelf Support Pin',
        specification: 'Adjustable Shelf Pin',
        size: '5mm diameter',
        quantity: pinsPerShelf,
        material: 'Steel/Plastic',
        notes: 'For middle shelf support'
      });
      hardwareCount++;
    }
    
    // 4. Screws for assembly
    const screwTypes = [
      {
        type: 'Wood Screw',
        specification: 'Flat head wood screw',
        size: '4mm x 16mm',
        quantity: 24, // For side panels and top/bottom
        material: 'Steel/Zinc plated',
        notes: 'For cabinet body assembly'
      },
      {
        type: 'Wood Screw',
        specification: 'Flat head wood screw',
        size: '4mm x 25mm',
        quantity: 8, // For back panel
        material: 'Steel/Zinc plated',
        notes: 'For back panel mounting'
      },
      {
        type: 'Wood Screw',
        specification: 'Flat head wood screw',
        size: '3.5mm x 12mm',
        quantity: 8, // For hinges
        material: 'Steel/Zinc plated',
        notes: 'For hinge mounting'
      }
    ];
    
    screwTypes.forEach(screw => {
      hardwareList.push({
        id: Date.now() + hardwareCount,
        cabinetName: cabinet.name,
        cabinetInstance: q + 1,
        type: screw.type,
        specification: screw.specification,
        size: screw.size,
        quantity: screw.quantity,
        material: screw.material,
        notes: screw.notes
      });
      hardwareCount++;
    });
    
    // 5. Cam locks and bolts (for knock-down assembly)
    hardwareList.push({
      id: Date.now() + hardwareCount,
      cabinetName: cabinet.name,
      cabinetInstance: q + 1,
      type: 'Cam Lock',
      specification: 'Cam lock assembly',
      size: '15mm diameter',
      quantity: 8,
      material: 'Steel/Zinc plated',
      notes: 'For cabinet body assembly'
    });
    hardwareCount++;
    
    hardwareList.push({
      id: Date.now() + hardwareCount,
      cabinetName: cabinet.name,
      cabinetInstance: q + 1,
      type: 'Cam Bolt',
      specification: 'Cam bolt with nut',
      size: '7mm x 50mm',
      quantity: 8,
      material: 'Steel/Zinc plated',
      notes: 'For cabinet body assembly'
    });
    hardwareCount++;
    
    // 6. Divider panel hardware (if dividers)
    if (cabinet.hasDividers) {
      hardwareList.push({
        id: Date.now() + hardwareCount,
        cabinetName: cabinet.name,
        cabinetInstance: q + 1,
        type: 'Wood Screw',
        specification: 'Flat head wood screw',
        size: '4mm x 20mm',
        quantity: 8,
        material: 'Steel/Zinc plated',
        notes: 'For divider panel mounting'
      });
      hardwareCount++;
    }
    
    // 7. Skirting screws (if skirting)
    if (cabinet.hasSkirting) {
      hardwareList.push({
        id: Date.now() + hardwareCount,
        cabinetName: cabinet.name,
        cabinetInstance: q + 1,
        type: 'Wood Screw',
        specification: 'Flat head wood screw',
        size: '4mm x 30mm',
        quantity: 6,
        material: 'Steel/Zinc plated',
        notes: 'For bottom skirting mounting'
      });
      hardwareCount++;
    }
  }
  
  return hardwareCount;
}

function renderHardwareList() {
  const hardwareSection = document.getElementById('hardwareSection');
  if (!hardwareSection) {
    // Create hardware section if it doesn't exist
    const outputSection = document.querySelector('.output-section');
    const hardwareDiv = document.createElement('div');
    hardwareDiv.id = 'hardwareSection';
    hardwareDiv.className = 'card';
    hardwareDiv.style.marginTop = '2rem';
    hardwareDiv.innerHTML = `
      <h2><i class="fas fa-tools"></i> Hardware & Accessories</h2>
      <div id="hardwareList" class="hardware-list"></div>
    `;
    outputSection.appendChild(hardwareDiv);
  }
  
  const hardwareListEl = document.getElementById('hardwareList');
  
  if (hardwareList.length === 0) {
    hardwareListEl.innerHTML = '<p>No hardware items generated yet. Add cabinets to generate hardware requirements.</p>';
    return;
  }
  
  // Group hardware by type and specification
  const groupedHardware = {};
  hardwareList.forEach(item => {
    const key = `${item.type}-${item.specification}-${item.size}-${item.material}`;
    if (!groupedHardware[key]) {
      groupedHardware[key] = {
        type: item.type,
        specification: item.specification,
        size: item.size,
        material: item.material,
        notes: item.notes,
        quantity: 0,
        cabinets: new Set()
      };
    }
    groupedHardware[key].quantity += item.quantity;
    groupedHardware[key].cabinets.add(item.cabinetName + ' #' + item.cabinetInstance);
  });
  
  let html = '<table class="hardware-table">' +
    '<thead>' +
    '<tr>' +
    '<th>Type</th>' +
    '<th>Specification</th>' +
    '<th>Size</th>' +
    '<th>Material</th>' +
    '<th>Total Quantity</th>' +
    '<th>Used In</th>' +
    '<th>Notes</th>' +
    '</tr>' +
    '</thead>' +
    '<tbody>';
  
  Object.values(groupedHardware).forEach(item => {
    html += '<tr>' +
      '<td><strong>' + item.type + '</strong></td>' +
      '<td>' + item.specification + '</td>' +
      '<td>' + item.size + '</td>' +
      '<td>' + item.material + '</td>' +
      '<td><span class="quantity-badge">' + item.quantity + '</span></td>' +
      '<td>' + Array.from(item.cabinets).join(', ') + '</td>' +
      '<td>' + item.notes + '</td>' +
      '</tr>';
  });
  
  html += '</tbody></table>';
  
  // Add total summary
  const totalItems = hardwareList.reduce((sum, item) => sum + item.quantity, 0);
  html += '<div class="hardware-summary">' +
    '<strong>Total Hardware Items:</strong> ' + totalItems +
    '</div>';
  
  hardwareListEl.innerHTML = html;
}

// Project Modal Functions
function openSaveProjectModal() {
  if (sheets.length === 0) {
    alert('No pieces to save as project. Add pieces first.');
    return;
  }
  document.getElementById('saveProjectModal').style.display = 'flex';
}

function closeSaveProjectModal() {
  document.getElementById('saveProjectModal').style.display = 'none';
  document.getElementById('projectName').value = '';
}

async function saveProject() {
  const projectName = document.getElementById('projectName').value.trim();
  
  if (!projectName) {
    alert('Please enter a project name');
    return;
  }

  const saveBtn = document.getElementById('confirmSaveProject');
  const originalText = saveBtn.textContent;
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled = true;

  const success = await saveProjectToFirestore(projectName);
  
  saveBtn.textContent = originalText;
  saveBtn.disabled = false;
  
  if (success) {
    alert(`Project "${projectName}" saved successfully!`);
    closeSaveProjectModal();
  }
}

async function openLoadProjectModal() {
  document.getElementById('loadProjectModal').style.display = 'flex';
  document.getElementById('projectList').innerHTML = '<p>Loading projects...</p>';
  
  const projects = await listProjectsFromFirestore();
  
  if (projects.length === 0) {
    document.getElementById('projectList').innerHTML = '<p>No projects found. Save a project first.</p>';
    return;
  }

  let html = '<div class="template-list">';
  projects.forEach(project => {
    const date = new Date(project.updatedAt?.toDate?.() || project.createdAt?.toDate?.() || Date.now());
    html += `
      <div class="template-item" onclick="loadProject('${project.name}')">
        <div class="template-item-header">
          <strong>${project.name}</strong>
          <span class="template-date">${date.toLocaleDateString()}</span>
        </div>
        <p>${project.sheets?.length || 0} sheets, ${project.pieces?.length || 0} pieces</p>
      </div>
    `;
  });
  html += '</div>';
  document.getElementById('projectList').innerHTML = html;
}

function closeLoadProjectModal() {
  document.getElementById('loadProjectModal').style.display = 'none';
}

async function loadProject(projectName) {
  const success = await loadProjectFromFirestore(projectName);
  if (success) {
    closeLoadProjectModal();
  }
}

// Event listeners for project modals
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Firebase
  initializeFirebase();
  
  const saveProjectBtn = document.getElementById('saveProjectBtn');
  const loadProjectBtn = document.getElementById('loadProjectBtn');
  const addCabinetBtn = document.getElementById('addCabinetBtn');
  const blenderSyncBtn = document.getElementById('blenderSyncBtn');
  
  if (saveProjectBtn) {
    saveProjectBtn.addEventListener('click', openSaveProjectModal);
  }
  
  if (loadProjectBtn) {
    loadProjectBtn.addEventListener('click', openLoadProjectModal);
  }
  
  if (addCabinetBtn) {
    addCabinetBtn.addEventListener('click', openCabinetModal);
  }
  
  if (blenderSyncBtn) {
    blenderSyncBtn.addEventListener('click', enableBlenderSync);
  }
  
  const closeSaveProjectModalBtn = document.getElementById('closeSaveProjectModal');
  if (closeSaveProjectModalBtn) {
    closeSaveProjectModalBtn.addEventListener('click', closeSaveProjectModal);
  }
  
  const cancelSaveProjectBtn = document.getElementById('cancelSaveProject');
  if (cancelSaveProjectBtn) {
    cancelSaveProjectBtn.addEventListener('click', closeSaveProjectModal);
  }
  
  const confirmSaveProjectBtn = document.getElementById('confirmSaveProject');
  if (confirmSaveProjectBtn) {
    confirmSaveProjectBtn.addEventListener('click', saveProject);
  }
  
  const closeLoadProjectModalBtn = document.getElementById('closeLoadProjectModal');
  if (closeLoadProjectModalBtn) {
    closeLoadProjectModalBtn.addEventListener('click', closeLoadProjectModal);
  }
  
  const cancelLoadProjectBtn = document.getElementById('cancelLoadProject');
  if (cancelLoadProjectBtn) {
    cancelLoadProjectBtn.addEventListener('click', closeLoadProjectModal);
  }
  
  const closeCabinetModalBtn = document.getElementById('closeCabinetModal');
  if (closeCabinetModalBtn) {
    closeCabinetModalBtn.addEventListener('click', closeCabinetModal);
  }
  
  const cancelAddCabinetBtn = document.getElementById('cancelAddCabinet');
  if (cancelAddCabinetBtn) {
    cancelAddCabinetBtn.addEventListener('click', closeCabinetModal);
  }
  
  const confirmAddCabinet = document.getElementById('confirmAddCabinet');
  if (confirmAddCabinet) {
    confirmAddCabinet.addEventListener('click', addCabinetAndGeneratePieces);
  }
  
  // Close modals when clicking outside
  const saveProjectModal = document.getElementById('saveProjectModal');
  if (saveProjectModal) {
    saveProjectModal.addEventListener('click', function(e) {
      if (e.target === this) closeSaveProjectModal();
    });
  }
  
  const loadProjectModal = document.getElementById('loadProjectModal');
  if (loadProjectModal) {
    loadProjectModal.addEventListener('click', function(e) {
      if (e.target === this) closeLoadProjectModal();
    });
  }
  
  const addCabinetModal = document.getElementById('addCabinetModal');
  if (addCabinetModal) {
    addCabinetModal.addEventListener('click', function(e) {
      if (e.target === this) closeCabinetModal();
    });
  }
  
  // Mobile bottom navigation event listeners
  const mobileSaveProjectBtn = document.getElementById('mobileSaveProjectBtn');
  if (mobileSaveProjectBtn) {
    mobileSaveProjectBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openSaveProjectModal();
    });
  }
  
  const mobileLoadProjectBtn = document.getElementById('mobileLoadProjectBtn');
  if (mobileLoadProjectBtn) {
    mobileLoadProjectBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openLoadProjectModal();
    });
  }
  
  const mobileSettingsBtn = document.getElementById('mobileSettingsBtn');
  if (mobileSettingsBtn) {
    mobileSettingsBtn.addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('settingsBtn').click();
    });
  }
  
  // Mobile unit selector sync with desktop unit selector
  const mobileUnitSelector = document.getElementById('mobileUnitSelector');
  if (mobileUnitSelector) {
    mobileUnitSelector.addEventListener('change', function(e) {
      const unitSelector = document.getElementById('unitSelector');
      if (unitSelector) {
        unitSelector.value = e.target.value;
        unitSelector.dispatchEvent(new Event('change'));
      }
    });
  }
  
  // Sync desktop unit selector to mobile unit selector
  const unitSelector = document.getElementById('unitSelector');
  if (unitSelector) {
    unitSelector.addEventListener('change', function(e) {
      const mobileUnitSelector = document.getElementById('mobileUnitSelector');
      if (mobileUnitSelector) {
        mobileUnitSelector.value = e.target.value;
      }
    });
  }
});

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
  generateCostComparison();
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

function placePiece(sheet, pieceWidth, pieceHeight, isRotated, teakSides, pieceType = '', cabinetName = '', cabinetInstance = 0) {
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
          pieceType: pieceType || '',
          cabinetName: cabinetName || '',
          cabinetInstance: cabinetInstance || 0
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
      
      // Add piece label with converted units and ID
      const labelDiv = document.createElement('div');
      labelDiv.className = 'piece-label';
      const pieceWidthConverted = UnitConverter.fromMM(piece.width, currentUnit);
      const pieceHeightConverted = UnitConverter.fromMM(piece.height, currentUnit);
      labelDiv.textContent = `#${piece.id}: ${pieceWidthConverted} × ${pieceHeightConverted}${currentUnit}`;
      
      if (piece.isRotated) {
        labelDiv.textContent += ' (R)';
      }
      if (piece.teakSides.length > 0) {
        labelDiv.textContent += ` | T: ${piece.teakSides.join(',')}`;
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
  generateCostComparison();
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

function addPieceToSheetOptimized(length, width, teakSides, pieceType = '', cabinetName = '', cabinetInstance = 0) {
  let added = false;

  // Try to add the piece to an existing sheet, prioritizing full-height placement
  for (const sheet of sheets) {
    const didFit = tryFitPieceOptimized(sheet, length, width, teakSides, pieceType, cabinetName, cabinetInstance);
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

    const didFit = tryFitPieceOptimized(newSheet, length, width, teakSides, pieceType, cabinetName, cabinetInstance);
    if (!didFit) {
      return false;
    }

    sheets.push(newSheet);
  }

  return true;
}

function tryFitPieceOptimized(sheet, length, width, teakSides, pieceType = '', cabinetName = '', cabinetInstance = 0) {
  // Try full-height placement first (if piece height is close to sheet height)
  const isFullHeight = Math.abs(length - sheetHeight) < 50 || Math.abs(width - sheetHeight) < 50;
  
  if (isFullHeight) {
    // Try to place at the rightmost edge to create clean vertical cuts
    if (canFit(sheet, length, width)) {
      if (placePieceAtEdge(sheet, length, width, false, teakSides, pieceType, cabinetName, cabinetInstance)) return true;
    }
    if (canFit(sheet, width, length)) {
      if (placePieceAtEdge(sheet, width, length, true, teakSides, pieceType, cabinetName, cabinetInstance)) return true;
    }
  }
  
  // Try original orientation
  if (canFit(sheet, length, width)) {
    placePiece(sheet, length, width, false, teakSides, pieceType, cabinetName, cabinetInstance);
    return true;
  }

  // Try rotated orientation
  if (canFit(sheet, width, length)) {
    placePiece(sheet, width, length, true, teakSides, pieceType, cabinetName, cabinetInstance);
    return true;
  }

  return false;
}

function placePieceAtEdge(sheet, pieceWidth, pieceHeight, isRotated, teakSides, pieceType = '', cabinetName = '', cabinetInstance = 0) {
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
        pieceType: pieceType || '',
        cabinetName: cabinetName || '',
        cabinetInstance: cabinetInstance || 0
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
        pieceType: pieceType || '',
        cabinetName: cabinetName || '',
        cabinetInstance: cabinetInstance || 0
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
    tableBody.innerHTML = '<tr><td colspan="6">No pieces added yet.</td></tr>';
    return;
  }
  
  sheets.forEach((sheet, sheetIndex) => {
    sheet.pieces.forEach((piece, pieceIndex) => {
      const row = document.createElement('tr');
      
      const pieceWidthConverted = UnitConverter.fromMM(piece.width, currentUnit);
      const pieceHeightConverted = UnitConverter.fromMM(piece.height, currentUnit);
      
      // Build piece description with type and cabinet info
      let pieceDescription = '';
      if (piece.pieceType) {
        pieceDescription = piece.pieceType;
      }
      if (piece.cabinetName) {
        if (pieceDescription) pieceDescription += ' - ';
        pieceDescription += piece.cabinetName;
        if (piece.cabinetInstance) {
          pieceDescription += ` #${piece.cabinetInstance}`;
        }
      }
      
      row.innerHTML = '<td>#' + piece.id + '</td>' +
        '<td>' + pieceWidthConverted + ' × ' + pieceHeightConverted + currentUnit + '</td>' +
        '<td>' + (pieceDescription || 'Custom Piece') + '</td>' +
        '<td>Sheet ' + (sheetIndex + 1) + '</td>' +
        '<td>' + (piece.teakSides.length > 0 ? piece.teakSides.join(', ') : 'None') + '</td>' +
        '<td>' +
          '<button class="btn-remove" onclick="removePiece(' + piece.id + ')">' +
            '<i class="fas fa-trash"></i> Remove' +
          '</button>' +
        '</td>';
      
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
  
  // Hardware costs (estimated prices)
  const hardwarePrices = {
    'Hinge': 15,
    'Handle': 25,
    'Shelf Support Pin': 2,
    'Wood Screw': 0.5,
    'Cam Lock': 8,
    'Cam Bolt': 5
  };
  
  let hardwareTotal = 0;
  let hardwareRows = '';
  
  if (hardwareList.length > 0) {
    // Group hardware by type
    const groupedHardware = {};
    hardwareList.forEach(item => {
      const key = item.type;
      if (!groupedHardware[key]) {
        groupedHardware[key] = {
          type: item.type,
          quantity: 0,
          unitPrice: hardwarePrices[item.type] || 5
        };
      }
      groupedHardware[key].quantity += item.quantity;
    });
    
    Object.values(groupedHardware).forEach(hw => {
      const hwTotal = hw.quantity * hw.unitPrice;
      hardwareTotal += hwTotal;
      hardwareRows += '<tr>' +
        '<td>' + hw.type + '</td>' +
        '<td>' + hw.quantity + '</td>' +
        '<td>' + hw.unitPrice.toFixed(2) + '</td>' +
        '<td>' + hwTotal.toFixed(2) + '</td>' +
        '</tr>';
    });
  }
  
  const grandTotal = sheetTotal + cutsTotal + teakTotal + hardwareTotal;

  const sheetWidthConverted = UnitConverter.fromMM(sheetWidth, currentUnit);
  const sheetHeightConverted = UnitConverter.fromMM(sheetHeight, currentUnit);
  const currency = selectedWood ? 'MVR' : 'RF';
  const woodName = selectedWood ? selectedWood.name : 'Plywood';
  const shopName = selectedShop ? selectedShop.name : 'Default';

  quotationDiv.innerHTML = '<table>' +
    '<thead>' +
    '<tr>' +
    '<th>Description</th>' +
    '<th>Quantity</th>' +
    '<th>Unit Price (' + currency + ')</th>' +
    '<th>Total (' + currency + ')</th>' +
    '</tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr>' +
    '<td>' + woodName + ' Sheets (' + sheetWidthConverted + currentUnit + ' × ' + sheetHeightConverted + currentUnit + ') - ' + shopName + '</td>' +
    '<td>' + totalSheets + '</td>' +
    '<td>' + sheetCost.toFixed(2) + '</td>' +
    '<td>' + sheetTotal.toFixed(2) + '</td>' +
    '</tr>' +
    '<tr>' +
    '<td>Cuts (@' + UnitConverter.fromMM(woodWaste, currentUnit) + currentUnit + ' blade width)</td>' +
    '<td>' + totalCuts + '</td>' +
    '<td>' + cutCost.toFixed(2) + '</td>' +
    '<td>' + cutsTotal.toFixed(2) + '</td>' +
    '</tr>' +
    '<tr>' +
    '<td>Teak Edging</td>' +
    '<td>' + totalTeakMeters.toFixed(2) + ' m</td>' +
    '<td>' + teakCost.toFixed(2) + '</td>' +
    '<td>' + teakTotal.toFixed(2) + '</td>' +
    '</tr>' +
    hardwareRows +
    '<tr class="total-row">' +
    '<td colspan="3"><strong>Grand Total</strong></td>' +
    '<td><strong>' + grandTotal.toFixed(2) + ' ' + currency + '</strong></td>' +
    '</tr>' +
    '</tbody>' +
    '</table>';
}

function generateCostComparison() {
  const comparisonDiv = document.getElementById('costComparison');
  
  if (sheets.length === 0) {
    comparisonDiv.innerHTML = '<p>No cost comparison available. Add pieces to generate.</p>';
    return;
  }

  const totalSheets = sheets.length;
  const totalCuts = sheets.reduce((acc, sheet) => acc + (sheet.pieces.length - 1), 0);
  const totalTeakMeters = sheets.reduce((acc, sheet) => acc + sheet.pieces.reduce((acc, piece) => acc + calculateTeakMeters(piece), 0), 0);

  let comparisonHTML = `
    <table>
      <thead>
        <tr>
          <th>Shop</th>
          <th>Wood Type</th>
          <th>Sheet Price</th>
          <th>Total Cost</th>
          <th>Savings</th>
        </tr>
      </thead>
      <tbody>
  `;

  // Calculate costs for all shops
  const costs = [];
  let minCost = Infinity;

  shops.forEach(shop => {
    shop.woodTypes.forEach(wood => {
      const sheetTotal = totalSheets * wood.price;
      const cutsTotal = totalCuts * cutCost;
      const teakTotal = totalTeakMeters * teakCost;
      const grandTotal = sheetTotal + cutsTotal + teakTotal;
      
      if (grandTotal < minCost) {
        minCost = grandTotal;
      }
      
      costs.push({
        shopName: shop.name,
        woodName: wood.name,
        sheetPrice: wood.price,
        grandTotal: grandTotal
      });
    });
  });

  // Sort by total cost
  costs.sort((a, b) => a.grandTotal - b.grandTotal);

  // Generate table rows
  costs.forEach(cost => {
    const savings = cost.grandTotal - minCost;
    const savingsText = savings === 0 ? '-' : `-${savings.toFixed(2)} MVR`;
    const isCheapest = savings === 0;
    
    comparisonHTML += `
      <tr class="${isCheapest ? 'cheapest-option' : ''}">
        <td>${cost.shopName} ${isCheapest ? '⭐' : ''}</td>
        <td>${cost.woodName}</td>
        <td>${cost.sheetPrice.toFixed(2)} MVR</td>
        <td><strong>${cost.grandTotal.toFixed(2)} MVR</strong></td>
        <td>${savingsText}</td>
      </tr>
    `;
  });

  comparisonHTML += `
      </tbody>
    </table>
    <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
      ⭐ = Best price option
    </p>
  `;

  comparisonDiv.innerHTML = comparisonHTML;
}

// DXF Export Function
function exportDXF() {
  if (sheets.length === 0) {
    alert('No sheets to export. Add pieces first.');
    return;
  }

  let dxfContent = '';
  
  // DXF Header
  dxfContent += '0\nSECTION\n2\nHEADER\n';
  dxfContent += '9\n$INSUNITS\n70\n4\n'; // Millimeters
  dxfContent += '0\nENDSEC\n';
  
  // DXF Entities
  dxfContent += '0\nSECTION\n2\nENTITIES\n';
  
  sheets.forEach((sheet, sheetIndex) => {
    const sheetX = sheetIndex * (sheetWidth + 100); // Offset each sheet
    
    // Draw sheet outline
    dxfContent += drawRectangle(sheetX, 0, sheetWidth, sheetHeight, 0, 'SHEET');
    
    // Draw pieces
    sheet.pieces.forEach(piece => {
      const pieceX = sheetX + piece.x;
      const pieceY = piece.y;
      
      // Draw piece rectangle
      dxfContent += drawRectangle(pieceX, pieceY, piece.width, piece.height, 1, `PIECE #${piece.id}`);
      
      // Add text label for piece
      dxfContent += drawText(pieceX + piece.width/2, pieceY + piece.height/2, `#${piece.id}`, 50);
      dxfContent += drawText(pieceX + piece.width/2, pieceY + piece.height/2 + 60, `${piece.width}x${piece.height}`, 30);
    });
  });
  
  dxfContent += '0\nENDSEC\n';
  dxfContent += '0\nEOF\n';
  
  // Download the DXF file
  const blob = new Blob([dxfContent], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cutting_diagram_${Date.now()}.dxf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function drawRectangle(x, y, width, height, color, layer) {
  let dxf = '';
  
  // Start of polyline
  dxf += '0\nLAYER\n2\n' + layer + '\n';
  dxf += '0\nPOLYLINE\n8\n' + layer + '\n';
  dxf += '70\n1\n'; // Closed polyline
  dxf += '90\n4\n'; // Number of vertices
  
  // Vertex 1 (bottom-left)
  dxf += '0\nVERTEX\n10\n' + x + '\n20\n' + y + '\n';
  
  // Vertex 2 (bottom-right)
  dxf += '0\nVERTEX\n10\n' + (x + width) + '\n20\n' + y + '\n';
  
  // Vertex 3 (top-right)
  dxf += '0\nVERTEX\n10\n' + (x + width) + '\n20\n' + (y + height) + '\n';
  
  // Vertex 4 (top-left)
  dxf += '0\nVERTEX\n10\n' + x + '\n20\n' + (y + height) + '\n';
  
  // End of polyline
  dxf += '0\nSEQEND\n';
  
  return dxf;
}

function drawText(x, y, text, height) {
  let dxf = '';
  
  dxf += '0\nTEXT\n';
  dxf += '8\nLABELS\n';
  dxf += '10\n' + x + '\n'; // X position
  dxf += '20\n' + y + '\n'; // Y position
  dxf += '40\n' + height + '\n'; // Text height
  dxf += '1\n' + text + '\n'; // Text content
  dxf += '72\n1\n'; // Horizontal alignment (center)
  dxf += '73\n2\n'; // Vertical alignment (center)
  
  return dxf;
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
  const exportDXFBtn = document.getElementById('exportDXF');

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
      } catch (err) {
        console.error(err);
        alert('Failed to share quotation.');
      }
    });
  }

  if (exportDXFBtn) {
    exportDXFBtn.addEventListener('click', (e) => {
      e.preventDefault();
      exportDXF();
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