import { Application, Graphics, Container, Text } from 'pixi.js';

export class Snake {
    constructor() {
        // 游戏基础配置
        this.config = {
            baseSpeed: 80,          // 基础移动间隔（毫秒）
            foodsPerSpeedUp: 2,      // 每吃几个食物加速
            speedUpRate: 0.1,        // 每次加速增加的速度比率（相对于基础速度）
            foodCollisionRange: 3,   // 食物碰撞检测范围 (值即为范围大小，如1是1x1，3是3x3)
            gridSize: 20,           // 网格大小
            infoBarHeight: 60,      // 信息栏高度
            obstacleWidth: 4,       // 障碍物第一维度
            obstacleHeight: 10      // 障碍物第二维度
        };

        this.app = new Application();
        this.gridSize = this.config.gridSize;
        this.infoBarHeight = this.config.infoBarHeight;
        this.gameStartTime = 0;     // 游戏开始时间
        this.gameTime = 0;          // 当前游戏时间（秒）
        this.lastUpdateTime = 0;    // 上次更新时间
        this.moveInterval = this.config.baseSpeed; // 当前移动间隔
    }
    
    async init() {
        await this.app.init({
            width: 1920,
            height: 1080,
            backgroundColor: 0x111111,
        });
        document.body.appendChild(this.app.canvas);
        // 设置网页背景颜色
        document.body.style.backgroundColor = '#222222';
        document.body.style.margin = '0';
        
        this.container = new Container();
        this.app.stage.addChild(this.container);
        
        this.initGameState();
        this.createGameArea();
        this.createGraphics();
        this.createUI();
        
        window.addEventListener('keydown', this.handleKeydown.bind(this));
        this.app.ticker.add(this.gameLoop.bind(this));
        this.isPlaying = true;
    }
    
    initGameState() {
        this.gridWidth = Math.floor(1920 / this.gridSize);
        this.gridHeight = Math.floor(1080 / this.gridSize);
        this.minY = Math.floor(this.infoBarHeight / this.gridSize);
        
        this.snake = [{x: 5, y: 5}];
        this.direction = {x: 1, y: 0};
        this.obstacles = [];  // 初始化为空数组，不生成障碍物
        this.score = 0;
        this.foodsEaten = 0;
        this.currentSpeedLevel = 1;
        this.speed = this.config.baseSpeed;
        this.food = null;
        
        // 重置计时器
        this.gameStartTime = Date.now();
        this.gameTime = 0;
        
        // 更新状态栏显示
        if (this.scoreText) {
            this.scoreText.text = `Score: ${this.score}`;
            this.speedText.text = `Speed: ${this.currentSpeedLevel.toFixed(1)}x`;
            this.timeText.text = "Time: 0:00";
            this.restartText.text = "";
        }
        
        // 只生成食物，不生成障碍物
        this.generateFood();
    }
    
    createGameArea() {
        // 信息栏背景
        const infoBar = new Graphics();
        infoBar
            .rect(0, 0, 1920, this.infoBarHeight)
            .fill({ color: 0x161616 });
        
        // 分隔线
        const separator = new Graphics();
        separator
            .rect(0, this.infoBarHeight, 1920, 1)
            .fill({ color: 0x222222 });
        
        // 网格
        const grid = new Graphics();
        grid.setStrokeStyle({ width: 1, color: 0x222222, alpha: 0.5 });
        
        for(let i = 0; i <= this.gridWidth; i++) {
            grid.moveTo(i * this.gridSize, this.infoBarHeight + 1)
                .lineTo(i * this.gridSize, 1080);
        }
        for(let i = 0; i <= this.gridHeight; i++) {
            grid.moveTo(0, i * this.gridSize + this.infoBarHeight + 1)
                .lineTo(1920, i * this.gridSize + this.infoBarHeight + 1);
        }
        
        this.container.addChild(infoBar, separator, grid);
    }
    
    createGraphics() {
        this.snakeGraphics = new Graphics();
        this.foodGraphics = new Graphics();
        this.obstaclesGraphics = new Graphics();
        this.container.addChild(this.snakeGraphics, this.foodGraphics, this.obstaclesGraphics);
    }
    
    createUI() {
        const textStyle = {
            fontSize: 28,
            fill: 0xCCCCCC,
            fontFamily: 'Press Start 2P, Consolas, Monaco, monospace',
            align: 'left',
            baseline: 'middle',
            letterSpacing: 1
        };
        
        this.scoreText = new Text({ text: "Score: 0", style: textStyle });
        this.speedText = new Text({ text: "Speed: 1.0x", style: textStyle });
        this.timeText = new Text({ text: "Time: 0:00", style: textStyle });
        this.restartText = new Text({ 
            text: "", 
            style: { ...textStyle, align: 'right' }
        });
        
        // 垂直居中（考虑基线对齐）
        const verticalCenter = this.infoBarHeight / 2;
        
        // 设置锚点为垂直中心
        this.scoreText.anchor.set(0, 0.5);
        this.speedText.anchor.set(0, 0.5);
        this.timeText.anchor.set(0, 0.5);
        this.restartText.anchor.set(1, 0.5);
        
        // 使用新的定位方式
        this.scoreText.position.set(20, verticalCenter);
        this.speedText.position.set(300, verticalCenter);
        this.timeText.position.set(600, verticalCenter);
        this.restartText.position.set(1920 - 20, verticalCenter);
        
        this.container.addChild(this.scoreText, this.speedText, this.timeText, this.restartText);
    }
    
    draw() {
        this.snakeGraphics.clear();
        this.foodGraphics.clear();
        this.obstaclesGraphics.clear();
        
        // 绘制食物的有效范围
        const range = Math.floor(this.config.foodCollisionRange / 2);
        for(let i = -range; i <= range; i++) {
            for(let j = -range; j <= range; j++) {
                const y = this.food.y + j;
                // 跳过状态栏区域
                if (y < this.minY) continue;
                
                this.foodGraphics
                    .roundRect(
                        (this.food.x + i) * this.gridSize + 1,
                        y * this.gridSize + 1,
                        this.gridSize - 2,
                        this.gridSize - 2,
                        4
                    )
                    .fill({ color: 0x333333, alpha: 0.6 });
            }
        }

        // 绘制食物
        this.foodGraphics
            .roundRect(
                this.food.x * this.gridSize + 1,
                this.food.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2,
                4
            )
            .fill({ color: 0xDDDDDD });
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            this.snakeGraphics
                .roundRect(
                    segment.x * this.gridSize + 1,
                    segment.y * this.gridSize + 1,
                    this.gridSize - 2,
                    this.gridSize - 2,
                    4
                )
                .fill({ color: index === 0 ? 0xEEEEEE : 0xAAAAAA });
        });
        
        // 绘制障碍物
        this.obstacles.forEach(obstacle => {
            for(let i = 0; i < obstacle.width; i++) {
                for(let j = 0; j < obstacle.height; j++) {
                    this.obstaclesGraphics
                        .roundRect(
                            (obstacle.x + i) * this.gridSize + 1,
                            (obstacle.y + j) * this.gridSize + 1,
                            this.gridSize - 2,
                            this.gridSize - 2,
                            4
                        )
                        .fill({ color: 0x444444 });
                }
            }
        });
    }
    
    gameLoop(delta) {
        if(!this.isPlaying) return;
        
        // 更新计时器
        if (this.gameStartTime > 0) {
            this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
            const minutes = Math.floor(this.gameTime / 60);
            const seconds = this.gameTime % 60;
            this.timeText.text = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        const currentTime = Date.now();
        if (currentTime - this.lastUpdateTime < this.moveInterval) return;
        
        this.lastUpdateTime = currentTime;
        
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        
        if(this.checkCollision(head)) {
            this.isPlaying = false;
            this.gameStartTime = 0;  // 停止计时
            this.scoreText.text = "Game Over!";
            this.speedText.text = `Final Score: ${this.score}`;
            this.restartText.text = "Press Enter to Start";
            return;
        }
        
        const range = Math.floor(this.config.foodCollisionRange / 2);
        const ateFood = Math.abs(head.x - this.food.x) <= range && 
                       Math.abs(head.y - this.food.y) <= range;
        
        if(ateFood) {
            this.snake.unshift(head);
            this.snake.unshift({
                x: head.x + this.direction.x,
                y: head.y + this.direction.y
            });
            this.updateScore();
            // 先生成新的障碍物
            this.generateObstacle();
            // 再生成新的食物
            this.generateFood();
        } else {
            this.snake.pop();
            this.snake.unshift(head);
        }
        
        this.draw();
    }
    
    checkCollision(head) {
        return head.x < 0 || head.x >= this.gridWidth || 
               head.y < this.minY || head.y >= this.gridHeight ||
               this.snake.some(segment => segment.x === head.x && segment.y === head.y) ||
               this.obstacles.some(obstacle => 
                   head.x >= obstacle.x && head.x < obstacle.x + obstacle.width &&
                   head.y >= obstacle.y && head.y < obstacle.y + obstacle.height
               );
    }
    
    handleKeydown(event) {
        const lastDirection = { ...this.direction };
        
        switch(event.key) {
            case 'ArrowUp':
                if(lastDirection.y !== 1) this.direction = {x: 0, y: -1};
                break;
            case 'ArrowDown':
                if(lastDirection.y !== -1) this.direction = {x: 0, y: 1};
                break;
            case 'ArrowLeft':
                if(lastDirection.x !== 1) this.direction = {x: -1, y: 0};
                break;
            case 'ArrowRight':
                if(lastDirection.x !== -1) this.direction = {x: 1, y: 0};
                break;
            case 'Enter':
                if(!this.isPlaying) this.initGameState();
                this.isPlaying = true;
                break;
        }
    }
    
    updateScore() {
        this.score += 10;
        this.foodsEaten++;
        
        // 检查是否需要加速
        if (this.foodsEaten % this.config.foodsPerSpeedUp === 0) {
            // 计算当前应该达到的速度等级（线性增长）
            const speedUpTimes = Math.floor(this.foodsEaten / this.config.foodsPerSpeedUp);
            this.currentSpeedLevel = 1 + (speedUpTimes * this.config.speedUpRate);
            this.moveInterval = this.config.baseSpeed / this.currentSpeedLevel;
        }
        
        this.scoreText.text = `Score: ${this.score}`;
        this.speedText.text = `Speed: ${this.currentSpeedLevel.toFixed(1)}x`;
    }
    
    generateFood() {
        do {
            this.food = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * (this.gridHeight - this.minY)) + this.minY
            };
        } while(
            // 检查是否与蛇重叠（包括蛇头和身体的每个部分）
            this.snake.some(segment => 
                segment.x === this.food.x && segment.y === this.food.y) ||
            // 检查是否与蛇的下一个位置重叠（防止蛇头即将移动到食物位置）
            (this.snake[0].x + this.direction.x === this.food.x && 
             this.snake[0].y + this.direction.y === this.food.y) ||
            // 检查是否在任何障碍物内部
            this.obstacles.some(obstacle => 
                this.food.x >= obstacle.x && this.food.x < obstacle.x + obstacle.width &&
                this.food.y >= obstacle.y && this.food.y < obstacle.y + obstacle.height)
        );
    }
    
    generateObstacle() {
        // 生成所有可能的尺寸组合
        const sizes = [];
        const minDim = Math.min(this.config.obstacleWidth, this.config.obstacleHeight);
        const maxDim = Math.max(this.config.obstacleWidth, this.config.obstacleHeight);
        
        // 生成从minDim到maxDim的所有组合
        for (let i = minDim; i <= maxDim; i++) {
            const j = maxDim - (i - minDim);
            sizes.push(
                {width: i, height: j},
                {width: j, height: i}
            );
        }
        
        // 去除重复的尺寸（当width=height时会产生重复）
        const uniqueSizes = sizes.filter((size, index, self) =>
            index === self.findIndex(s => s.width === size.width && s.height === size.height)
        );
        
        // 随机选择一个尺寸
        const size = uniqueSizes[Math.floor(Math.random() * uniqueSizes.length)];
        
        let newObstacle;
        do {
            newObstacle = {
                x: Math.floor(Math.random() * (this.gridWidth - size.width)),
                y: Math.floor(Math.random() * (this.gridHeight - this.minY - size.height)) + this.minY,
                width: size.width,
                height: size.height
            };
        } while(
            // 检查是否与蛇重叠
            this.snake.some(segment => 
                segment.x === newObstacle.x && segment.y === newObstacle.y) ||
            // 检查是否与食物重叠（如果食物存在）
            (this.food && this.food.x === newObstacle.x && this.food.y === newObstacle.y) ||
            // 检查是否与其他障碍物重叠
            this.obstacles.some(obs =>
                obs.x === newObstacle.x && obs.y === newObstacle.y)
        );
        
        this.obstacles.push(newObstacle);
    }
}

export const snake = new Snake(); 