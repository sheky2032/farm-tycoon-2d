// Game object to hold all game state and logic
const game = {
    // Game state
    resources: {
        wheat: 0,
        wood: 0,
        gold: 100,
        stone: 0
    },

    buildings: [],
    selectedBuilding: null,
    gameSpeed: 1,

    // Building definitions
    buildingTypes: {
        farm: {
            name: '🌾 Farm',
            cost: { gold: 50 },
            width: 50,
            height: 50,
            production: { wheat: 1 },
            productionTime: 2000 // ms
        },
        lumbermill: {
            name: '🪵 Lumber Mill',
            cost: { gold: 75 },
            width: 60,
            height: 50,
            production: { wood: 1 },
            productionTime: 2500
        },
        quarry: {
            name: '🪨 Quarry',
            cost: { gold: 100 },
            width: 70,
            height: 60,
            production: { stone: 1 },
            productionTime: 3000
        },
        house: {
            name: '🏠 House',
            cost: { gold: 200 },
            width: 80,
            height: 80,
            production: { gold: 2 },
            productionTime: 5000
        }
    },

    // Initialize game
    init: function() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Load saved game
        this.loadGame();
        
        // Set up event listeners
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Start game loop
        this.lastTime = Date.now();
        this.gameLoop();
        
        // Update UI every 100ms
        setInterval(() => this.updateUI(), 100);
    },

    // Game loop
    gameLoop: function() {
        const now = Date.now();
        const deltaTime = (now - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = now;

        // Update buildings
        this.updateBuildings(deltaTime);

        // Draw everything
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    },

    // Update building production
    updateBuildings: function(deltaTime) {
        for (let building of this.buildings) {
            building.timeSinceProduction += deltaTime * 1000; // Convert back to ms

            if (building.timeSinceProduction >= building.productionTime) {
                // Produce resources
                for (let resource in building.production) {
                    this.resources[resource] += building.production[resource];
                }
                building.timeSinceProduction = 0;
            }
        }
    },

    // Draw everything on canvas
    draw: function() {
        // Clear canvas
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grass pattern
        this.ctx.fillStyle = 'rgba(76, 175, 80, 0.1)';
        for (let i = 0; i < this.canvas.width; i += 40) {
            for (let j = 0; j < this.canvas.height; j += 40) {
                this.ctx.fillRect(i, j, 35, 35);
            }
        }

        // Draw buildings
        for (let building of this.buildings) {
            this.drawBuilding(building);
        }

        // Draw grid
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.canvas.width; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.canvas.height; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
    },

    // Draw individual building
    drawBuilding: function(building) {
        // Draw building background
        this.ctx.fillStyle = building.color;
        this.ctx.fillRect(building.x, building.y, building.width, building.height);

        // Draw border
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(building.x, building.y, building.width, building.height);

        // Draw emoji
        this.ctx.font = '32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(building.emoji, building.x + building.width / 2, building.y + building.height / 2);

        // Draw production progress bar
        const progressWidth = (building.timeSinceProduction / building.productionTime) * building.width;
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(building.x, building.y + building.height - 5, progressWidth, 5);

        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(building.x, building.y + building.height - 5, building.width, 5);
    },

    // Handle canvas click to place buildings
    handleCanvasClick: function(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicked on existing building
        for (let building of this.buildings) {
            if (x >= building.x && x <= building.x + building.width &&
                y >= building.y && y <= building.y + building.height) {
                console.log('Clicked building:', building.type);
                return;
            }
        }

        // If a building is selected, try to place it
        if (this.selectedBuilding) {
            this.placeBuilding(this.selectedBuilding, x, y);
        }
    },

    // Buy a building type
    buyBuilding: function(buildingType) {
        const buildingDef = this.buildingTypes[buildingType];
        
        // Check if we can afford it
        for (let resource in buildingDef.cost) {
            if (this.resources[resource] < buildingDef.cost[resource]) {
                alert(`Not enough ${resource}!`);
                return;
            }
        }

        // Deduct cost
        for (let resource in buildingDef.cost) {
            this.resources[resource] -= buildingDef.cost[resource];
        }

        // Enable selection mode
        this.selectedBuilding = buildingType;
        alert(`Click on the map to place your ${buildingDef.name}`);
    },

    // Place building on map
    placeBuilding: function(buildingType, x, y) {
        const buildingDef = this.buildingTypes[buildingType];
        const emojis = {
            farm: '🌾',
            lumbermill: '🪵',
            quarry: '🪨',
            house: '🏠'
        };

        const building = {
            type: buildingType,
            x: Math.round(x / 50) * 50,
            y: Math.round(y / 50) * 50,
            width: buildingDef.width,
            height: buildingDef.height,
            color: ['#8B7355', '#D2B48C', '#A0826D', '#CD853F'][Math.floor(Math.random() * 4)],
            emoji: emojis[buildingType],
            production: buildingDef.production,
            productionTime: buildingDef.productionTime,
            timeSinceProduction: 0
        };

        this.buildings.push(building);
        this.selectedBuilding = null;
    },

    // Update UI elements
    updateUI: function() {
        document.getElementById('wheat').textContent = Math.floor(this.resources.wheat);
        document.getElementById('wood').textContent = Math.floor(this.resources.wood);
        document.getElementById('gold').textContent = Math.floor(this.resources.gold);
        document.getElementById('stone').textContent = Math.floor(this.resources.stone);

        document.getElementById('stat-buildings').textContent = this.buildings.length;

        // Calculate production per second
        let totalProduction = 0;
        for (let building of this.buildings) {
            const productionRate = (1000 / building.productionTime);
            for (let resource in building.production) {
                totalProduction += building.production[resource] * productionRate;
            }
        }
        document.getElementById('stat-production').textContent = totalProduction.toFixed(2);
        document.getElementById('stat-income').textContent = (totalProduction * 100).toFixed(0) + ' Gold/min';
    },

    // Save game to localStorage
    saveGame: function() {
        const gameData = {
            resources: this.resources,
            buildings: this.buildings,
            timestamp: Date.now()
        };
        localStorage.setItem('farmTycoonSave', JSON.stringify(gameData));
        alert('Game saved!');
    },

    // Load game from localStorage
    loadGame: function() {
        const saved = localStorage.getItem('farmTycoonSave');
        if (saved) {
            const gameData = JSON.parse(saved);
            this.resources = gameData.resources;
            this.buildings = gameData.buildings || [];
            console.log('Game loaded!', gameData);
        }
    },

    // Reset game
    resetGame: function() {
        if (confirm('Are you sure you want to reset the game? This cannot be undone!')) {
            this.resources = { wheat: 0, wood: 0, gold: 100, stone: 0 };
            this.buildings = [];
            localStorage.removeItem('farmTycoonSave');
            this.updateUI();
            alert('Game reset!');
        }
    }
};

// Start the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    game.init();
});
