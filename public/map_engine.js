//utilities consts and variables

const SIZE_OF_CHARACTER = 50;
const MINIMAL_TRAVEL_DISTANCE = 100;
const STEP = getEvenSquareAdjacents(MINIMAL_TRAVEL_DISTANCE);
const PRIMARY_MAP_SCROLLING_KEY = "Shift";
const SECONDARY_MAP_SCROLLING_KEY = "Alt";
const MINI_MAP_DISABILITY_BUTTON = "Control";
const LINE_DRAWING_BUTTON = "`"
const MEASURE_KEY = "r";
const DISABLE_MEASURE_KEY = "t";
const MOUSE_ON_RIGHT_OR_DOWN_SIDE_THRESHOLD = 0.9;
const MOUSE_ON_LEFT_OR_UP_SIDE_THRESHOLD = 0.1;
const MAP_OFFSET_PER_ONE_SCROLL = 3; //pixels
const MAP_SCROLLING_ACCELERATION = 5; //multiplier
const MINI_MAP_HEIGHT = 30; //percent
const MINI_MAP_WIDTH = 30; //percent
const MINI_MAP_MARGIN_BOTTOM = 2; //percent
const MINI_MAP_MARGIN_RIGHT = 2; //percent
const MINI_MAP_BORDER_THICKNESS = 6; //px
const MAP_BORDER_COLOR = "grey";
const MINI_MAP_PREVIEW_FILL_COLOR = {red: 96, green: 96, blue: 96, alpha: 0.6};
const MINI_MAP_PREVIEW_STROKE_COLOR = {red: 255, green: 0, blue: 0, alpha: 0.6};
const MINI_MAP_CURRENT_VIEW_STROKE_COLOR = {red: 255, green: 0, blue: 0};
const EMPHASIZE_MAX_RADIUS = 100;
const EMPHASIZE_MIN_RADIUS = 20;
const EMPHASIZE_RADIUS_INCREASE = 10;
const EMPHASIZE_COLOR = "rgba(0,0,0,0.4)";
const MINI_MAP_EMPHASIZE_COLOR = "white";
const EMPHASIZE_COUNT = 5;
const LINE_TOLERANCE = 8;
const ORTO_DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const LINE_THICKNESS = 5;
const ORTO_LINE_DIAGONAL_ANGLE = 45;
const ORTO_DIAGONAL_RADIANS = getRadiansFromDegs(ORTO_LINE_DIAGONAL_ANGLE);

let drawingPoint = {x:0, y:0};
let drawingSecond = {x:0, y:0};
let drawingMode = false;
let lines = [];

//utilities functions

function getEvenSquareAdjacents(hypotenuse){ 
    if (isNaN(hypotenuse) || hypotenuse < 0 ) hypotenuse = 0;
    return Math.sqrt(hypotenuse / 2);
}

function getDegFromRadians(radians){
    return radians * (180 / Math.PI);
}

function getRadiansFromDegs(degs){
    return degs * Math.PI / 180;
}

function feetsToMeters(feets){
    return  feets / 3.2808399;
}

const checkForScrolling = (mousePosition, bigMultiplier, smallMultiplier, mapSize) => {
    if (mousePosition >= bigMultiplier * mapSize) return {moving: true, increasing: true};
    if (mousePosition <= smallMultiplier * mapSize) return {moving: true, increasing: false};
    return {moving: false};
}

const euclideanDistance = (x1 = 0, y1 = 0, x2 = 0, y2 = 0) => {
    return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

const widthOnCanvas = (vc, mapCornersX, elementCornersX, elementWidth) => {
    if (!Array.isArray(vc) || !Array.isArray(mapCornersX) || !Array.isArray(elementCornersX)) return 0;
    if (isNaN(elementWidth) || elementWidth < 0) elementWidth = 0;

    if ((vc[1] || vc[3]) === false) return mapCornersX[1] - elementCornersX[0];
    if ((vc[2] || vc[0]) === false) return elementCornersX[1] - mapCornersX[0];
    return elementWidth;

}

const heightOnCanvas = (vc, mapCornersY, elementCornersY, elementHeight) => {
    if (!Array.isArray(vc) || !Array.isArray(mapCornersY) || !Array.isArray(elementCornersY)) return 0;
    if (isNaN(elementHeight) || elementHeight < 0) elementHeight = 0;

    if ((vc[2] || vc[3]) === false) return mapCornersY[2] - elementCornersY[0];
    if ((vc[0] || vc[1]) === false) return elementCornersY[2] - mapCornersY[0];
    return elementHeight;

}

const getCanvasColorStringFromJSON = (colorJSON) => {
    if (!colorJSON.hasOwnProperty("red") || !colorJSON.hasOwnProperty("green"), !colorJSON.hasOwnProperty("blue")) return null;
    if (isNaN(colorJSON.hasOwnProperty("red")) || isNaN(colorJSON.hasOwnProperty("green")), isNaN(colorJSON.hasOwnProperty("blue"))) return null;
    if (colorJSON.hasOwnProperty("alpha")) 
        if (isNaN(colorJSON.hasOwnProperty("alpha"))) return null;

    let colorString = colorJSON.red.toString() + ", " + colorJSON.green.toString() + ", " + colorJSON.blue.toString();
    if (colorJSON.hasOwnProperty("alpha")) colorString = "rgba(" + colorString  + ", " + colorJSON.alpha.toString();
    if (!colorJSON.hasOwnProperty("alpha")) colorString = "rgb(" + colorString;
    colorString += ")";
    return colorString;
}

//Declarations of properties

const loadableProperties = () => {

    const properties = {
        height: 0,
        width: 0,
        img: new Image(),
        imgPath : "",
        imgLoaded: false,
        xCorners: [0, 0, 0, 0],
        yCorners: [0, 0, 0, 0]
    };

    return { 
        ...properties
    };
}

const bigMapProperties = () => {

    const properties = {
        x: 0,
        y: 0,
        ctx: null,
        mapCanvas: null,
        boundingRect: null,
        elementsOnMap: [[]],
        mouseOnMap: false,
        keyPressed: {},
        lastVisibleX: null,
        lastVisibleY: null,
        clicked: false
        
    };

    return { 
        ...properties
    };

}

const mouseTrackingProperties = () => {

    const properties = {
        mouseX: 0,
        mouseY: 0,
        throttlingWait: false,
        throttlingTime: 100,
    };

    return {
        ...properties
    };
}

const staticProperties = () => {

    const properties = {
        x: 0,
        y: 0,
        isCollisionFree: false,
        isVisible: true,
        toBeDestroyed: false,
        visibleCorners: [false, false, false, false]
    };

    return {
        ...properties
    };
}

const dynamicProperties = () => {

    const properties = {
        toBeMoved: false,
        aimedX: -1,
        aimedY: -1
    };

    return {
        ...properties
    };
    
}    

const characterProperties = () => {

    const properties = {
        type: 'character',
        maxHP: 0,
        currentHP: 0,
        state: "ok",
        speed: 0,
        name: "Nameless",
        toBeRedrawn: false,
        describedHP: "Full HP",
        hiddenInfo: "Nothing right now..." //GM's only
    };
}

//Methods

const loadingImage = (drawElement) => ({
    loadImage: (path) => {
        if (!drawElement.hasOwnProperty("img")) return;
        if (!drawElement.hasOwnProperty("updateCorners")) return;
        if (!path) return;
        
        drawElement.img.src = path;
        drawElement.img.onload = function() {
            drawElement.width = drawElement.img.width;
            drawElement.height = drawElement.img.height;
            if (drawElement.type === "character"){
                const multiplier = (drawElement.sizeMultiplier && !isNaN(drawElement.sizeMultiplier))? drawElement.sizeMultiplier: 1;
                drawElement.width = SIZE_OF_CHARACTER * multiplier;
                drawElement.height = SIZE_OF_CHARACTER * multiplier;
            }

            if (drawElement.type === "map"){
                drawElement.width = drawElement.mapCanvas.width;
                drawElement.height = drawElement.mapCanvas.height;
            }
                

            drawElement.imgLoaded = true;
            drawElement.updateCorners();
        }
    }
})

const canvasPreparing = (map) => ({
    prepareCanvas: (canvasID) => {
        if (!canvasID) return;
        if (!map.hasOwnProperty("mapCanvas")) return;

        map.mapCanvas = document.getElementById(canvasID);
        map.ctx = map.mapCanvas.getContext("2d");
        map.boundingRect = map.mapCanvas.getBoundingClientRect();

    }
})

const putingPlaceholderToCanvas = (graphic) => ({
    putPlaceholderToCanvas: (placeholderText = "Placeholder") => {
        if (!graphic.hasOwnProperty("ctx")) return;
        if (!graphic.hasOwnProperty("mapCanvas")) return;
        if (typeof placeholderText !== "string") return;

        graphic.ctx.font = "30px Comic Sans MS";
        graphic.ctx.textAlign = "center";
        graphic.ctx.fillText(placeholderText, graphic.mapCanvas.width/2, graphic.mapCanvas.height/2);
    }
})

const preparingSizeOfMap = (map) => ({
    prepareSizeOfMap: (heightFactor = 0, widthFactor = 0) => {
        if (!map.hasOwnProperty("mapCanvas")) return;

        if (isNaN(heightFactor) || heightFactor <= 0) heightFactor = defaultHeightFactor;
        if (isNaN(widthFactor) || widthFactor <= 0) widthFactor = defaultWidthFactor;

        map.height = window.innerHeight * heightFactor / 100;
        map.width = window.innerWidth * widthFactor / 100;
        map.mapCanvas.width = map.width;
        map.mapCanvas.height = map.height;
        map.lastVisibleX = map.img.width - map.mapCanvas.width;
        map.lastVisibleY = map.img.height - map.mapCanvas.height;
    }
})

const declaringMap = (map) => ({
    declare: ({id,  heightFactor, widthFactor, throttlingTime} = {},) => {
        if (!map.hasOwnProperty("prepareCanvas")) return;
        if (!map.hasOwnProperty("putPlaceholderToCanvas")) return;
        if (!map.hasOwnProperty("prepareSizeOfMap")) return;

        map.prepareCanvas(id);
        map.prepareSizeOfMap(heightFactor, widthFactor);
        map.putPlaceholderToCanvas();
        map.trackMouse(throttlingTime);
        map.assignKeyboardEvents();

    }
})

const working = (map) => ({ //Main method, hub for all others
    work: () => {
    if (!map.hasOwnProperty("ctx")) return;
    
    if (map.imgLoaded)
        document.body.style.cursor = "auto";
        if (map.mouseOnMap && map.keyPressed[LINE_DRAWING_BUTTON]) document.body.style.cursor = "pointer";
            
        map.prepareSizeOfMap(70, 35);
        map.handleScrolling();
        map.drawBackground();
        map.drawElementsIfVisible();
        handleClick(map);
        handleMeasure(map);
        map.drawMeasure(); 
        handleLineDrawing(map);
        handleEmphasize(map);
        drawingMiniMap(map);
    }
})

function drawLine(ctx, x1, y1, x2, y2, strokeStyle, width){
    ctx.lineWidth = width;
    ctx.strokeStyle = strokeStyle;
    ctx.beginPath(); 
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
}

function getDrawingLineVisiblePoints(map, oneLine){
    const point1Visible = isVisible(map, oneLine.point1.x, oneLine.point1.y);
    const point2Visible = isVisible(map, oneLine.point2.x, oneLine.point2.y);
    if (!point1Visible && !point2Visible) return null;
    if (point1Visible &&   point2Visible) return [oneLine.point1, oneLine.point2];
    if (oneLine.point1.x === oneLine.point2.x) return getDrawingVerticalLineVisiblePoints(map, oneLine, point1Visible);

    const firstPointIsOnLeft = oneLine.point1.x <= oneLine.point2.x;
    const visiblePointIsOnLeft = (point1Visible && firstPointIsOnLeft) || (point2Visible && !firstPointIsOnLeft);
    const returnedPoints = [];
    point1Visible? returnedPoints.push(oneLine.point1) : returnedPoints.push(oneLine.point2);
    const secondPoint = {};
    visiblePointIsOnLeft? secondPoint.x = map.xCorners[1] : secondPoint.x = map.xCorners[0];
    secondPoint.y = oneLine.trajectory.a * secondPoint.x + oneLine.trajectory.b;
    returnedPoints.push(secondPoint);
    return returnedPoints;
}

function getDrawingVerticalLineVisiblePoints(map, oneLine, isPoint1Visible){
    const p1 = {x: oneLine.point1.x, y:0};
    const p2 = {x: oneLine.point1.x, y:0};
    const y1 = oneLine.point1.y;
    const y2 = oneLine.point2.y;

    const higherPoint = y1 < y2? oneLine.point1: oneLine.point2;
    const lowerPoint = higherPoint.y === oneLine.point1.y? oneLine.point2: oneLine.point1;
    const higherVisible = isVisible(map, higherPoint.x, higherPoint.y);

    higherVisible? p1.y = map.yCorners[2]: p1.y = lowerPoint.y;
    higherVisible? p2.y = higherPoint.y: p2.y = map.yCorners[0];
    return [p1, p2];
}

function drawPreparedLines(map){
    if (lines.length <= 0 ) return;
    lines.forEach(oneLine => {
        const points = getDrawingLineVisiblePoints(map, oneLine);
        if (!points) return;
        drawLine(map.ctx, points[0].x - map.x, points[0].y - map.y, points[1].x - map.x, points[1].y - map.y, oneLine.color, LINE_THICKNESS);
    })
}

function handleLineDrawing(map){
    if (!lines) return;
    if (lines.length) drawPreparedLines(map);

    if (drawingMode){
        if (!map.mouseOnMap) return;
        document.body.style.cursor = "pointer";
        prepareSecondLinePoint(map);
        drawLine(map.ctx, drawingPoint.x - map.x, drawingPoint.y - map.y, drawingSecond.x - map.x, drawingSecond.y - map.y, lineDrawingColor, LINE_THICKNESS);
    }
}

function prepareSecondLinePoint(map){
    const p2 = clickedCoordinates(map);
    const clickedPoint =  {x: p2[0], y: p2[1]};
    if (!map.keyPressed[LINE_DRAWING_BUTTON]) {
        drawingSecond = clickedPoint;
        return;
    }
    drawingSecond = getOrtoPoint(clickedPoint);
}

function getOrtoPoint(clickedPoint){
    const angle = calculateAngleForRotatedAxis(drawingPoint, clickedPoint);
    const partOfAnAngle = getPartOfAnArc(angle);
    const ortoDirection = ORTO_DIRECTIONS[partOfAnAngle];

    if (ortoDirection === "N" || ortoDirection === "S")
        return {x: drawingPoint.x, y: clickedPoint.y};
    if (ortoDirection === "E" || ortoDirection === "W")
        return {x: clickedPoint.x, y: drawingPoint.y};

    const x = drawingPoint.x;
    const y = drawingPoint.y;
    const d = euclideanDistance(x, y, clickedPoint.x, clickedPoint.y);
    const dx = d * Math.sin(ORTO_DIAGONAL_RADIANS);
    const dy = d * Math.cos(ORTO_DIAGONAL_RADIANS);

    if (ortoDirection === "NE") return {x: x + dx, y: y - dy}; //+  -
    if (ortoDirection === "SE") return {x: x + dx, y: y + dy};
    if (ortoDirection === "SW") return {x: x - dx, y: y + dy}; //-
    if (ortoDirection === "NW") return {x: x - dx, y: y - dy};//   -

}

function calculateAngleForRotatedAxis(p1, p2){
    const angle = degreesBeetwenPoints(p1, p2);
    if (p2.x < p1.x) return angle + 270;
    return angle + 90;
}

function getAverageDistance(p1, p2){
    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.y - p1.y);
    return (dx + dy) / 2;

}


function getPartOfAnArc(degrees, numberOfParts = 8, fullArc = 360){
    const doubleNumberOfParts = numberOfParts * 2;
    const base = fullArc / doubleNumberOfParts;
    const onePart = fullArc / numberOfParts;
    for (let i = 0; i < numberOfParts; i++){
        if ((degrees >= -1 * base + i * onePart) && (degrees < base + i * onePart)) return i;
    }
    if (degrees >= fullArc - base && degrees <= fullArc) return 0;
    throw console.error('bad call');
}

function degreesBeetwenPoints(p1, p2){
    if (p1.x === p2.x) return 0;
    return getDegFromRadians(Math.atan((p1.y - p2.y) / (p1.x - p2.x)));
}

function handleMeasure(map){
    const valid = map.mouseOnMap;
    if (!valid) return;

    if (Object.keys(map.keyPressed).length === 0) return;
    const enable = map.keyPressed[MEASURE_KEY];
    const disable = map.keyPressed[DISABLE_MEASURE_KEY];
    if (!enable && !disable) return;

    if (!map.measuring && enable){
        map.measuring = true;
        map.measurePoint = {x: map.mouseX, y: map.mouseY};
        return;
    }

    if (map.measuring && disable){
        map.measuring = false;
        delete map.measurePoint;
    }

}

function handleRightClick(event, map){
    if (!canClick) return;
    event.preventDefault();
    deleteVisibleAvatar(map);
    deleteVisibleLine(map);
}

function isVisible(map, x, y){
    const xOK = x >= map.xCorners[0] && x <= map.xCorners[1];
    const yOK = y >= map.yCorners[0] && y <= map.yCorners[2];
    return xOK && yOK;
}

function deleteVisibleLine(map){
    const len = lines.length;
    if (len === 0) return;
    const clicked = clickedCoordinates(map);
    for (let i = len - 1; i >= 0; i--){
        if (isPointOnTrajectory(clicked[0], clicked[1], lines[i].trajectory.a, lines[i].trajectory.b, LINE_TOLERANCE)){
            socket.emit('deleteLine', lines[i].id);
            return;
        }
        if (isPointOnVerticalLine(clicked[0], clicked[1], lines[i].point1, lines[i].point2, LINE_TOLERANCE)){
            socket.emit('deleteLine', lines[i].id);
            return;
        }
    }
}

function isPointOnVerticalLine(x, y, p1, p2, tolerance = 0){
    const xOk = Math.abs(x - p1.x) <= tolerance;
    const smallerY = p1.y < p2.y? p1.y: p2.y;
    const biggerY = p2.y === smallerY? p1.y: p2.y;
    const yOk = y >= smallerY && y <= biggerY;
    return xOk && yOk;
}

function isPointOnTrajectory(x, y, a, b, tolerance = 0){
   const calculated = a * x + b;
   return Math.abs(y - calculated) <= tolerance;
}

function deleteVisibleAvatar(map){ 
  const len = map.elementsOnMap[0].length;
  for (let i = len - 1; i >= 0; i--){
    if (map.isMouseOnAsset(map.elementsOnMap[0][i])) {
        socket.emit('delete-asset', map.elementsOnMap[0][i].id);
        delete map.elementsOnMap[0][i];
        return;
    }
  }
}

function handleClick(map) {
    if (!map.clickedOnMiniMap) return;
    if (!map.mouseOnMap) return;
    if (!canClick) return;

    map.elementsOnMap[0].forEach(el => { 
        const isOnAsset = map.isMouseOnAsset(el); 
        const clicked = el.isClicked;
        if (isOnAsset) el.isClicked = true;
        if (clicked){
            el.move({x: map.mouseX + map.xCorners[0], y: map.mouseY + map.yCorners[0]});
            el.isClicked = false;
            socket.emit('move-character', [map.mouseX + map.xCorners[0], map.mouseY + map.yCorners[0], el.id]);
        }
    }
        )
}

const drawingBackground = (map) => ({
    drawBackground: () => {

        let horizontalBorderVisible, verticalBorderVisible, withoutBorder;
        let rectWidth, rectHeight;
        let sourceX, sourceY, drawingWidth, drawingHeight, mapStartX, mapStartY;

        const drawBorderRectangle = (x, y, width, height) => {
            map.ctx.fillStyle = MAP_BORDER_COLOR;
            map.ctx.fillRect(x, y, width, height);
        }

        const getRectAxisPoint = (baseValue, lastVisible, mapSize) => {
            if (baseValue < 0) return 0;
            return mapSize - (baseValue - lastVisible);
        }

        const getRectAxisSize = (baseValue, lastVisible) => {
            if (baseValue < 0) return Math.abs(baseValue);
            return baseValue - lastVisible;
        }

        const calcAndDrawWidthBorder = () => {
            rectWidth = getRectAxisSize(map.x, map.lastVisibleX);
            drawBorderRectangle(getRectAxisPoint(map.x, map.lastVisibleX, map.width), 0, rectWidth, map.height);
        }

        const calcAndDrawHeightBorder = () => {
            rectHeight = getRectAxisSize(map.y, map.lastVisibleY);
            drawBorderRectangle(0, getRectAxisPoint(map.y, map.lastVisibleY, map.height), map.width, rectHeight)
        }

        const bordersLogic = () => {
            horizontalBorderVisible = (map.x < 0 || map.x > map.lastVisibleX);
            verticalBorderVisible = (map.y < 0 || map.y > map.lastVisibleY);
            withoutBorder = !horizontalBorderVisible && !verticalBorderVisible;
        }

        const bordersService = () => {
            bordersLogic();
            if (withoutBorder) return;
            if (horizontalBorderVisible) calcAndDrawWidthBorder();
            if (verticalBorderVisible) calcAndDrawHeightBorder();

        }

        const getSourceAxisPosition = (baseAxisValue, oppositeAxisBorderVisible, lastVisible, rectSize) => {
            if (withoutBorder || oppositeAxisBorderVisible) return baseAxisValue;
            if (baseAxisValue > lastVisible) return lastVisible + rectSize;
            return 0;

        }

        const calcCanvasStartPoint = () => {
            if (horizontalBorderVisible && verticalBorderVisible) {
                mapStartX = 0;
                mapStartY = 0;
                return;
            }

            (map.x < 0)? mapStartX = rectWidth: mapStartX = 0;
            (map.y < 0)? mapStartY = rectHeight: mapStartY = 0;
        }

        const calcCanvasSource = () => {
            sourceX = getSourceAxisPosition(map.x, verticalBorderVisible, map.lastVisibleX, rectWidth);
            sourceY = getSourceAxisPosition(map.y, horizontalBorderVisible, map.lastVisibleY, rectHeight);
            (withoutBorder || verticalBorderVisible)? drawingWidth = map.width: drawingWidth = map.width - rectWidth;
            (withoutBorder || horizontalBorderVisible)? drawingHeight = map.height: drawingHeight = map.height - rectHeight;
        }


        bordersService();
        calcCanvasSource();
        calcCanvasStartPoint();
        map.ctx.drawImage(map.img, sourceX, sourceY, drawingWidth, drawingHeight, mapStartX, mapStartY, drawingWidth, drawingHeight);
        currentMapX = sourceX;
        currentMapY = sourceY;
    }                       
})

const drawingMeasure = (map) => ({
    drawMeasure: () => {
        if (!map.measurePoint) return;
        if (!map.measurePoint.x) return;
        document.body.style.cursor = "crosshair";
        map.ctx.lineWidth = 2.5;
        map.ctx.strokeStyle = "red";
        map.ctx.beginPath(); 
        map.ctx.moveTo(map.measurePoint.x, map.measurePoint.y);
        map.ctx.lineTo(map.mouseX, map.mouseY);
        map.ctx.stroke();
        map.ctx.lineWidth = 1;
        map.ctx.strokeStyle = "black";

        const distance = euclideanDistance(map.measurePoint.x, map.measurePoint.y, map.mouseX, map.mouseY);
        const distanceRelateToCharacter = distance / SIZE_OF_CHARACTER;
        const fixedValue = (Math.round(distanceRelateToCharacter * 100) / 100).toFixed(2);
        const feets = 5 * fixedValue;
        const ft = (Math.round(feets * 100) / 100).toFixed(2); 
        const meters = feetsToMeters(feets);
        const m = (Math.round(meters * 100) / 100).toFixed(2); 

        map.ctx.beginPath();
        map.ctx.arc(map.measurePoint.x, map.measurePoint.y, distance, 0, 2 * Math.PI);
        map.ctx.fillStyle = "rgba(0,0,0,0.5)";
        map.ctx.fill();

        map.ctx.font = "20px Arial";
        map.ctx.fillStyle = "red";
        map.ctx.fillText(`${ft}ft`, map.mouseX + 15, map.mouseY);
        map.ctx.fillText(`${m}m`, map.mouseX + 15, map.mouseY + map.ctx.measureText('M').width * 1.2);


    }                       
})

const drawingMiniMap = (map) => {
    if (!map.miniMapVisible) return;
    const maxWidth = map.mapCanvas.width * MINI_MAP_WIDTH / 100; //percents
    const maxHeight = map.mapCanvas.height * MINI_MAP_HEIGHT / 100;
    const marginRight = map.mapCanvas.width * MINI_MAP_MARGIN_RIGHT / 100;
    const marginBot = map.mapCanvas.height * MINI_MAP_MARGIN_BOTTOM / 100;
    const ratio = map.img.width / map.img.height;
    let miniMapCanvasWidth, miniMapCanvasHeight;     

    if (map.img.width >= map.img.height) {
        miniMapCanvasWidth = maxWidth;
        miniMapCanvasHeight = miniMapCanvasWidth / ratio; 
    }
    if (map.img.width < map.img.height){
        miniMapCanvasHeight = maxHeight;
        miniMapCanvasWidth = miniMapCanvasHeight * ratio; 
    }

    const borderX = map.mapCanvas.width - marginRight - miniMapCanvasWidth;
    const borderY = map.mapCanvas.height - marginBot - miniMapCanvasHeight;
    const mapX = borderX + MINI_MAP_BORDER_THICKNESS / 2;
    const mapY = borderY + MINI_MAP_BORDER_THICKNESS / 2;
    const mapWidth = miniMapCanvasWidth - MINI_MAP_BORDER_THICKNESS;
    const mapHeight = miniMapCanvasHeight - MINI_MAP_BORDER_THICKNESS;

    map.ctx.lineWidth = MINI_MAP_BORDER_THICKNESS;
    map.ctx.beginPath();
    map.ctx.rect(borderX, borderY, miniMapCanvasWidth, miniMapCanvasHeight);
    map.ctx.stroke(); 
    map.ctx.drawImage(map.img, 0, 0, map.img.width, map.img.height, mapX, mapY, mapWidth, mapHeight);

    const heightCoefficient = mapHeight /  map.img.height;
    const widthCoefficient = mapWidth / map.img.width;
    const rectangleWidth = map.mapCanvas.width * widthCoefficient;
    const rectangleHeight = map.mapCanvas.height * heightCoefficient;
    const rectangleCorner = getMiniMapRectangleCorner(map.x, map.y, mapX, mapY, widthCoefficient, heightCoefficient);

    map.drawShape("stroked rectangle", {...rectangleCorner, width: rectangleWidth, height: rectangleHeight, lineWidth: 1 }, MINI_MAP_CURRENT_VIEW_STROKE_COLOR);

    const mousePoints = getPreviewMapCords(map, miniMapCanvasWidth, miniMapCanvasHeight, mapX, mapY, rectangleWidth, rectangleHeight);
    let movingOptionCorner;
    if (mousePoints !== null) {
        movingOptionCorner = getMiniMapRectangleCorner(mousePoints.x, mousePoints.y, mapX, mapY, widthCoefficient, heightCoefficient);
        map.drawShape("filled rectangle", {...movingOptionCorner, width: rectangleWidth, height: rectangleHeight }, MINI_MAP_PREVIEW_FILL_COLOR);
        map.drawShape("stroked rectangle", {...movingOptionCorner, width: rectangleWidth, height: rectangleHeight, lineWidth: 1 }, MINI_MAP_PREVIEW_STROKE_COLOR);
        moveMapToClickedPoint(map, mousePoints);
    }

    if (map.emphasizing && map.mapCanvas.width > 0 && map.mapCanvas.height){
        if (!map.miniEmphasizeCounter) map.miniEmphasizeCounter = 0;
        const emphasizeX = miniMapCanvasWidth / map.img.width * map.emphasizeX + mapX;
        const emphasizeY = miniMapCanvasHeight / map.img.height * map.emphasizeY + mapY;
        const radius = EMPHASIZE_MAX_RADIUS *  miniMapCanvasWidth / map.img.width;
        
        if (map.miniEmphasizeCounter % 4 !== 0)
            drawArc(map, emphasizeX, emphasizeY, radius, MINI_MAP_EMPHASIZE_COLOR);
        
        map.miniEmphasizeCounter++;

    } else map.miniEmphasizeCounter = 0;
}

const getMiniMapRectangleCorner = (x, y, miniMapXCorner, miniMapYCorner, widthCoefficient, heightCoefficient) => {
    //Put x and y on a big map, get corner of rectangle showing on mini map

    return {x: miniMapXCorner + x * widthCoefficient, y: miniMapYCorner + y * heightCoefficient};
}

const drawingOneElement = (map) => ({
    drawOneElement: (element) => {
    if (!map.hasOwnProperty("ctx")) return;
    
    const vc = element.visibleCorners;
    let sx, sy, sWidth, sHeight
    const widthCoefficient = element.img.width / element.width;
    const heightCoefficient = element.img.height / element.height;

    (vc[0] || vc[2])? element.xOnCanvas = element.xCorners[0] - map.xCorners[0]: element.xOnCanvas = 0;
    (vc[0] || vc[1])? element.yOnCanvas = element.yCorners[0] - map.yCorners[0]: element.yOnCanvas = 0;
    element.widthOnCanvas  = widthOnCanvas(vc, map.xCorners, element.xCorners, element.width);
    element.heightOnCanvas = heightOnCanvas(vc, map.yCorners, element.yCorners, element.height);
    ((vc[0] || vc[2]) === false)? sx = widthCoefficient  * (map.x - element.xCorners[0]): sx = 0;
    ((vc[0] || vc[1]) === false)? sy = heightCoefficient * (map.y - element.yCorners[0]): sy = 0;
    sWidth = element.widthOnCanvas*(element.img.width/element.width);
    sHeight = element.heightOnCanvas*(element.img.height/element.height);
    const d = {x: element.xOnCanvas, y: element.yOnCanvas, width: element.widthOnCanvas, height: element.heightOnCanvas};
    map.ctx.drawImage(element.img, sx, sy, sWidth, sHeight, d.x, d.y, d.width, d.height);
    if (element.isClicked) {
    map.ctx.lineWidth = 5;
    map.ctx.strokeStyle = "#38f";
    map.ctx.strokeRect(d.x, d.y, d.width, d.height);
    map.ctx.lineWidth = 1;
    map.ctx.strokeStyle = "black"; 
    }
    }
})

const drawingCanvasShape = (map) => ({
    drawShape: (type, shapeJSON, colorJSON) => {
        if (!map.hasOwnProperty("ctx") || !type) return;

        const colorstyle = getCanvasColorStringFromJSON(colorJSON);
        if (colorstyle === null) return;

        if (!shapeJSON.hasOwnProperty("x") || !shapeJSON.hasOwnProperty("y")) return; 
        if (isNaN(shapeJSON.x) || isNaN(shapeJSON.y)) return;

        if (type.includes("rectangle")) {
            drawRectangleHub(map, type, shapeJSON, colorstyle);
            return;
        }

    }
})

const drawArc = (map, x, y, radius, fillStyle) =>{
    map.ctx.beginPath();
    map.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    map.ctx.fillStyle = fillStyle;
    map.ctx.fill();
}

const drawRectangleHub = (map, type, shapeJSON, colorstyle) => {
    if (!shapeJSON.hasOwnProperty("width") || !shapeJSON.hasOwnProperty("height")) return; 
    if (isNaN(shapeJSON.width) || isNaN(shapeJSON.height)) return;
    if (type === "filled rectangle") drawFilledRectangle(map, shapeJSON, colorstyle);
    if (type === "stroked rectangle") drawStrokedRectangle(map, shapeJSON, colorstyle);
}

const drawFilledRectangle = (map, shapeJSON, colorstyle) => {
    map.ctx.fillStyle = colorstyle;
    map.ctx.fillRect(shapeJSON.x, shapeJSON.y, shapeJSON.width, shapeJSON.height);
}

const  drawStrokedRectangle = (map, shapeJSON, colorstyle) => {
    if (!shapeJSON.hasOwnProperty("lineWidth")) return; 
    if (isNaN(shapeJSON.lineWidth)) return;

    map.ctx.strokeStyle = colorstyle;
    map.ctx.lineWidth = shapeJSON.lineWidth;
    map.ctx.beginPath();
    map.ctx.rect(shapeJSON.x, shapeJSON.y, shapeJSON.width, shapeJSON.height);
    map.ctx.stroke();
}


const drawingElementsIfVisible = (map) => ({
    drawElementsIfVisible: () => {
    if (!isAtLeast2dArray(map.elementsOnMap)) return;
    let elementToDescribe = null;
    map.elementsOnMap.forEach((layer) => {

        const lay = layer.filter(function (element) {return element.imgLoaded; });
        //TODO: filtering invisible things in current layer
        if (lay)
            lay.forEach((element) => {
                element.step();
                map.determineVisibility(element);
                const sumOfCorners = element.visibleCorners.reduce((a,b) => a + b, 0);
                sumOfCorners? map.drawOneElement(element) : element.isClicked = false;
            })
    })
    if (elementToDescribe !== null) map.describeElement(elementToDescribe);
    }
    
})

const describingElement = (map) => ({
    describeElement: (element) => {
        if (element.hasOwnProperty("name")) {
            map.ctx.font = "20px serif";
            map.ctx.fillText(element.name, map.mouseX, map.mouseY);
        }
        
        if (element.hasOwnProperty("maxHP") && element.hasOwnProperty("currentHP")){
            map.ctx.font = "20px serif";
            const numberOfHP = "HP: " + element.currentHP + " / " + element.maxHP;
            map.ctx.fillText(numberOfHP, map.mouseX, map.mouseY + map.ctx.measureText("M").width);
        }
        if (element.hasOwnProperty("describedHP")) {
            map.ctx.font = "20px serif";
            map.ctx.fillText(element.describedHP, map.mouseX, map.mouseY + 2 * map.ctx.measureText("M").width);

        }
    }
})

const determiningVisibilityOfMapElement = (map) => ({
    determineVisibility: (element) => {
        if (!element.hasOwnProperty("xCorners") || !element.hasOwnProperty("yCorners")) return;
        if (!map.hasOwnProperty("xCorners") || !map.hasOwnProperty("yCorners")) return;

        for (let i = 0; i < 4; i++){
            let x, y
            x = element.xCorners[i] >= map.xCorners[0] && element.xCorners[i] <= map.xCorners[1];
            y = element.yCorners[i] >= map.yCorners[1] && element.yCorners[i] <= map.yCorners[2];
            element.visibleCorners[i] = x && y;
        }
    }
})

const pushingElementToMap = (map) => ({
    pushElement: (element, layer = 0) => {
        if (!map.hasOwnProperty("elementsOnMap")) return;
        if (layer < 0 ) layer = 0;
        map.elementsOnMap[layer].push(element);
    }
})

const mouseTracing = (graphic) => ({
    trackMouse: (time) => {
    const defaultTime = 100;

    if (!graphic.hasOwnProperty("mapCanvas")) return;
    if (!graphic.hasOwnProperty("boundingRect")) return;

    time = time || defaultTime;
    if (isNaN(time)) return;
    if (time < 0) time = defaultTime;
    graphic.throttlingTime = time;

    graphic.mapCanvas.addEventListener("mousemove", event => { 
        if (graphic.throttlingWait) return;

        graphic.mouseOnMap = true;
        graphic.mouseX = event.clientX - graphic.boundingRect.left;
        graphic.mouseY = event.clientY - graphic.boundingRect.top;
        graphic.throttlingWait = true;
        setTimeout(function () {graphic.throttlingWait = false;}, graphic.throttlingTime);
    })

    graphic.mapCanvas.addEventListener("mouseout", event => {graphic.mouseOnMap = false;})

    }

})

const checkingForMouseOnAsset = (map) =>  ({
    isMouseOnAsset : (asset) => {
        if (!asset) return;
        if (!map.hasOwnProperty("mouseX")) return;
        if (!asset.hasOwnProperty("xOnCanvas")) return;
        const lowX = map.mouseX >= asset.xOnCanvas;
        const lowY = map.mouseY >= asset.yOnCanvas;
        const highX = map.mouseX <= asset.xOnCanvas + asset.widthOnCanvas; 
        const highY = map.mouseY <= asset.yOnCanvas + asset.heightOnCanvas;

        return lowX && lowY && highX && highY;
    }
})

const assigningKeyboardEvents = (map) => ({
    assignKeyboardEvents: () => {
        document.addEventListener("keydown", event => handleKeyDown(event, map));
        document.addEventListener("keyup", event => {delete map.keyPressed[event.key]});
        map.mapCanvas.addEventListener("click", event => {map.clickedOnMiniMap = true});
        map.mapCanvas.addEventListener("click", () => {handleClicking(map)}); //2137
        map.mapCanvas.oncontextmenu = event => handleRightClick(event, map);
        map.mapCanvas.ondblclick = event => handleDoubleClick(map);
    }
})

function getLineTrajectory(point1, point2){
    if (point1.x == point2.x) return {a:0, b:0};
    const a = (point2.y - point1.y) / (point2.x - point1.x);
    const b = point1.y - a * point1.x;
    return {a:a, b:b};
}

function handleClicking(map){
    if (drawingMode){
        const lineData = {
            point1: drawingPoint,
            point2: drawingSecond,
            color: lineDrawingColor,
            id: Date.now(),
            trajectory: getLineTrajectory(drawingPoint, drawingSecond)
        };
        socket.emit('addLine', lineData);
        resetDrawing();
        return;
    }
  
    if (!map.keyPressed[LINE_DRAWING_BUTTON]) return;
    if (!drawingMode){
        const point = clickedCoordinates(map);
        drawingPoint = {x: point[0], y: point[1]};
        drawingMode = true;
        return;
    }
    
    
}

function resetDrawing(){
    drawingMode = false;
    drawingPoint = {x: 0, y:0};
}

function handleDoubleClick(map){
    const [x, y] = clickedCoordinates(map);
    socket.emit('emphasize', [x, y]);
}

function getCoordinatesOfVisiblePoint(map, pointX, pointY, originX, originY){
    const x = getCoordinateRelateToMap(map.x, originX, pointX);
    const y = getCoordinateRelateToMap(map.y, originY, pointY);
    return [x, y];
}

function getCoordinateRelateToMap(mapCoordinate, originCoordinate, coordinate){
    if (mapCoordinate == originCoordinate) return coordinate;
    const offset = Math.abs(mapCoordinate - originCoordinate);
    if (mapCoordinate > originCoordinate) return coordinate - offset;
    return coordinate + offset;

}

function handleEmphasize(map){
    if (!map.emphasizing) return;
    calculateEmphasize(map);
    drawEmphasize(map);
    
}

function drawEmphasize(map){
    if (!isVisible(map, map.emphasizeX, map.emphasizeY)) return;
    drawTorus(map, map.emphasizeX - map.x, map.emphasizeY - map.y, map.emphasizeRadius, map.emphasizeCutRadius, EMPHASIZE_COLOR);
}

function drawTorus(map, x, y, fullRadius, emptyRadius, color){
    map.ctx.fillStyle = color;
    map.ctx.beginPath()
    map.ctx.arc(x,y,fullRadius,0,Math.PI*2, false); // outer (filled)
    map.ctx.arc(x,y,emptyRadius,0,Math.PI*2, true); // outer (unfills it)
    map.ctx.fill();
}

function emphasize(map, x, y){
    initEmphasize(map, x, y);
    resetEmphasizeCycle(map);
}


function clickedCoordinates(map){
    return  [map.mouseX + map.xCorners[0], map.mouseY + map.yCorners[0]];
}

function initEmphasize(map, x, y){
    map.emphasizeCount = 1;
    map.emphasizing = true;
    map.emphasizeX = x;
    map.emphasizeY = y;
}

function resetEmphasizeCycle(map){
    map.emphasizeDirection = true;
    map.emphasizeRadius = EMPHASIZE_MIN_RADIUS - EMPHASIZE_RADIUS_INCREASE;
    map.emphasizeCutRadius = 0;
}

function newEmphasizeCycle(map){
    map.emphasizeCount++;
    if (map.emphasizeCount >= EMPHASIZE_COUNT){
        map.emphasizing = false;
        return;
    }
    resetEmphasizeCycle(map);
}

function calculateEmphasize(map){
    if (map.emphasizeDirection){
        map.emphasizeRadius += EMPHASIZE_RADIUS_INCREASE;
        if (map.emphasizeRadius >= EMPHASIZE_MAX_RADIUS) changeEmphaizeDirection(map);
        return;
    }

    map.emphasizeCutRadius += EMPHASIZE_RADIUS_INCREASE;
    if (map.emphasizeCutRadius >= EMPHASIZE_MAX_RADIUS) {
        newEmphasizeCycle(map);
    }
    
}

function changeEmphaizeDirection(map){
    map.emphasizeDirection = false;
    map.emphasizeRadius = EMPHASIZE_MAX_RADIUS;
    map.empasizeCutRadius = EMPHASIZE_MIN_RADIUS - EMPHASIZE_RADIUS_INCREASE;
}

function handleKeyDown(event, map){
    if (event.key === MINI_MAP_DISABILITY_BUTTON) map.miniMapVisible = !map.miniMapVisible;
    map.keyPressed[event.key] = true;
}

const scrollingMap = (map) => ({
    handleScrolling: () => {
        if (!map.mouseOnMap) return;
        if (!map.keyPressed.hasOwnProperty(PRIMARY_MAP_SCROLLING_KEY)) return;
        resetDrawing();
        let booster;
        map.keyPressed.hasOwnProperty(SECONDARY_MAP_SCROLLING_KEY)? booster = MAP_SCROLLING_ACCELERATION: booster = 1;
        const xMove = checkForScrolling(map.mouseX, MOUSE_ON_RIGHT_OR_DOWN_SIDE_THRESHOLD, MOUSE_ON_LEFT_OR_UP_SIDE_THRESHOLD, map.width);
        const yMove = checkForScrolling(map.mouseY, MOUSE_ON_RIGHT_OR_DOWN_SIDE_THRESHOLD, MOUSE_ON_LEFT_OR_UP_SIDE_THRESHOLD, map.height);
        if (xMove.moving) map.scroll(booster * MAP_OFFSET_PER_ONE_SCROLL, "x", xMove.increasing);
        if (yMove.moving) map.scroll(booster * MAP_OFFSET_PER_ONE_SCROLL, "y", yMove.increasing);
    }
}) 

const scrollingService = (map) => ({
    scroll: (shift, axis, incresing) => {
        if (axis !== "x" && axis !== "y") return;
        let targetOffset, mul;
        incresing? mul = 1: mul = -1; 
        targetOffset = map[axis] + mul * shift;
       
        if (targetOffset < -100) return;
        if (targetOffset > map.lastVisibleX + 100 && axis === "x") return;
        if (targetOffset > map.lastVisibleY + 100 && axis === "y") return;
        if (axis === "x" && targetOffset > map.img.width) return;
        if (axis === "y" && targetOffset > map.img.height) return;

        map[axis] = targetOffset;
        map.updateCorners();
    }
})

const getPreviewMapCords = (map, miniMapWidth, miniMapHeight, miniMapStartX, miniMapStartY, visibleWidth, visibleHeight) => {
    if (map.mouseX < miniMapStartX || map.mouseY < miniMapStartY || map.mouseX > miniMapStartX + miniMapWidth || map.mouseY > miniMapStartY + miniMapHeight){
        map.clickedOnMiniMap = false;
        return null;
    }

    const mousePoint = {mouseX: map.mouseX - miniMapStartX - visibleWidth / 2, mouseY: map.mouseY - miniMapStartY - visibleHeight / 2};
    const calculatedPoints = {x: Math.round(mousePoint.mouseX / miniMapWidth * map.img.width), y: Math.round(mousePoint.mouseY / miniMapHeight * map.img.height)};

    if (calculatedPoints.x <= 0) calculatedPoints.x = 0;
    if (calculatedPoints.y <= 0) calculatedPoints.y = 0;
    if (calculatedPoints.x >= map.lastVisibleX) calculatedPoints.x = map.lastVisibleX;
    if (calculatedPoints.y >= map.lastVisibleY) calculatedPoints.y = map.lastVisibleY;

    return calculatedPoints;
}

const moveMapToClickedPoint = (map, clickedPoint) => {
        if (map.clickedOnMiniMap !== true) return;
        if (!clickedPoint.hasOwnProperty("x") || !clickedPoint.hasOwnProperty("y")) return;
        if (isNaN(clickedPoint.x) || isNaN(clickedPoint.y)) return;

        map.x = clickedPoint.x;
        map.y = clickedPoint.y;
        map.updateCorners();
        map.clickedOnMiniMap = false;
}


const updatingCorners = (graphic) => ({
    updateCorners: () => {
    if (!graphic.hasOwnProperty("xCorners")) return;
    if (!graphic.hasOwnProperty("width")) return;
    if (!graphic.hasOwnProperty("height")) return;
    
     //Corners:
    //1                2
    //
    //
    //3                4

    let width = graphic.width;
    let height = graphic.height;
    graphic.xCorners = [graphic.x, graphic.x + width, graphic.x, graphic.x + width];
    graphic.yCorners = [graphic.y, graphic.y, graphic.y + height, graphic.y + height];

    }
})

const showing = (terrain) => ({
    show: () => {
        if (!terrain.hasOwnProperty("isVisible")) return;
        terrain.isVisible = true;
    }
    
})

const hiding = (terrain) => ({
    hide: () => {
        if (!terrain.hasOwnProperty("isVisible")) return;
        terrain.isVisible = false;
    }
})

const destroying = (terrain) => ({
    destroy: () => {
        if (!terrain.hasOwnProperty("toBeDestroyed")) return;
        terrain.toBeDestroyed = true;
    }
})

const moving = (terrain) => ({
    move: ({x,y} = {x:0, y:0}) => {
        if (!terrain.hasOwnProperty("toBeMoved")) return;
        if (isNaN(x) || isNaN(y)) return;
        if (x < 0 || y < 0 ) return;

        terrain.aimedX = x;
        terrain.aimedY = y;
        terrain.toBeMoved = true;
        terrain.trajectory = getTrajectory(x, y, terrain);
        terrain.direction = getDirection(x, y, terrain);
    }
})

function getDirection(x, y, terrain) {
    let direction = "";
    if (terrain.x === x || terrain.y === y) return direction;
    
    terrain.x < x? direction += "+X " : direction += "-X ";
    terrain.y < y? direction += "+Y " : direction += "-Y ";
    return direction;

}

function getTrajectory(x, y, terrain) {
    const yDifference = y - terrain.y;
    const xDifference = x - terrain.x;
    if (xDifference === 0) return "vertical";
    const tangent = yDifference / xDifference; //a
    const freeElement = terrain.y - tangent * terrain.x; //b
    const angle = getDegFromRadians(Math.atan(tangent));
    const relativeAngle = getClosest45Deg(angle);
    const speed = (relativeAngle / 45) * STEP;

    return [tangent, freeElement, STEP]; // a and b of { y = ax + b }
}

function getClosest45Deg(angle){
    const myAngle = Math.abs(angle);
    const multiplier = Math.floor(myAngle/45);
    return myAngle - 45 * multiplier;
}

const stepping = (terrain) => ({
    step: () => {
        if (!terrain.hasOwnProperty("toBeMoved")) return;
        if (!terrain.toBeMoved) return;
        if (terrain.aimedX === undefined || terrain.aimedY === undefined) return;
        if (terrain.aimedX === null || terrain.aimedY === null) return;
        if (!terrain.trajectory) return;

        const distance = euclideanDistance(terrain.x, terrain.y, terrain.aimedX, terrain.aimedY);
        if (distance <= 2 * STEP){
            finishStepping();
            return;
        }

        if (terrain.trajectory === 'vertical') {
            terrain.aimedX > terrain.x? 
            terrain.changePosition({x: terrain.x + STEP, y: terrain.y}):
            terrain.changePosition({x: terrain.x - STEP, y: terrain.y});
            return;
        }

        let aimedX;
        const speed = terrain.trajectory[2];
        (terrain.aimedX < terrain.x)? aimedX = terrain.x - speed: aimedX = terrain.x + speed;
        const a = terrain.trajectory[0];
        const b = terrain.trajectory[1];
        const aimedY = a * aimedX + b;

        const currentDirection = getDirection(aimedX, aimedY, terrain);
        if (currentDirection !== terrain.direction){
            finishStepping();
            return;
        }

        terrain.changePosition({x: aimedX, y: aimedY});

        function finishStepping(){
            terrain.toBeMoved = false;
            terrain.changePosition({x: terrain.aimedX, y: terrain.aimedY});

        }

    }

})

const changingPosition = (graphic) => ({
    changePosition: ({x,y} = {x:0, y:0}) => {
        if (!graphic.hasOwnProperty("updateCorners")) return;
        graphic.x = x;
        graphic.y = y;
        graphic.updateCorners();
    }
})

const changingState = (character) => ({
    changeState: (state) => {
        if (!character.hasOwnProperty("state")) return;
        if (!character.hasOwnProperty("toBeRedrawn")) return;
        if (!state) return;

        character.state = state;
        character.toBeRedrawn = true;
    }
})

const killing = (character) => ({
    kill: () => {
        character.changeState("killed");
    }
})

const knockingOut = (character) => ({
    knockOut: () => {
        character.changeState("knockedOut");
    }
})

const wounding = (character) => ({
    wound: () => {
        character.changeState("wounded");
    }
})

const assigningCharacterStats = (character) => ({
    assignStats: ({maxHP, currentHP, state, speed, name, describedHP}  = {maxHP: 10, currentHP: 0, state: "ok", speed: 1, name: "Nameless", describedHP: "Full HP"}) => {
        character.maxHP = maxHP;
        character.currentHP = currentHP;
        character.state = state;
        character.speed = speed;
        character.name = name;
        character.describedHP = describedHP;
    }
})

//Object constructors

const createTerrainElement = () => {

    const terrain = {
        ...staticProperties(),
    }

    return Object.assign(terrain, showing(terrain), hiding(terrain));
}

const createBigMap = () => {

    const map = {
        ...bigMapProperties(),
        ...loadableProperties(),
        ...mouseTrackingProperties(),
    }

        Object.assign(map, canvasPreparing(map), putingPlaceholderToCanvas(map));
        Object.assign(map, preparingSizeOfMap(map), declaringMap(map), loadingImage(map));
        Object.assign(map, working(map), mouseTracing(map), updatingCorners(map));
        Object.assign(map, drawingElementsIfVisible(map), pushingElementToMap(map));
        Object.assign(map, determiningVisibilityOfMapElement(map), drawingOneElement(map));
        Object.assign(map, assigningKeyboardEvents(map), scrollingMap(map), scrollingService(map));
        Object.assign(map, drawingBackground(map), drawingCanvasShape(map), checkingForMouseOnAsset(map));
        Object.assign(map, describingElement(map), drawingMeasure(map));
        map.type = "map";
        map.miniMapVisible = true;

        return map;
    
}

const createCharacter = (id) => {

    const myId = id ?? 2137;

    const char = {
        ...loadableProperties(),
        ...staticProperties(),
        ...dynamicProperties(),
        ...characterProperties()
    }

    Object.assign(char, loadingImage(char), moving(char), assigningCharacterStats(char));
    Object.assign(char, updatingCorners(char), stepping(char), changingPosition(char));
    char.type = "character";
    char.id = myId;

    return char;
}

