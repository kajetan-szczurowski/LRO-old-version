const BIG_MAP_SCALE = 0.9;
const MAP_ZOOM_BUTTON = 'Shift';
const mapDialog = document.getElementById("big-map-dialog");
const mapButton = document.getElementById("show-map-button");
const bigMapCanvas = document.getElementById("big-map-in-dialog");
const bigMapCtx = bigMapCanvas.getContext("2d");
const controlsButton = document.getElementById("show-controls-button");
const controlsDialog = document.getElementById("controls-dialog");
let bigMapOpened = false;
let zoomingMode = false;
const bigMapMouse ={x:0, y:0};
let bigBoundingRect = bigMapCanvas.getBoundingClientRect();

document.addEventListener("keydown", event => handleZoomKeyDown(event));
document.addEventListener("keyup", event => handleZoomKeyUp(event));

function handleZoomKeyDown(event){
    if (!(event.key === MAP_ZOOM_BUTTON) || zoomingMode || !bigMapOpened) return;
    zoomingMode = true;
    showBigMap();
}

function handleZoomKeyUp(event){
    if (!(event.key === MAP_ZOOM_BUTTON) || !zoomingMode || !bigMapOpened) return;
    zoomingMode = false;
    showBigMap();
}

bigMapCanvas.addEventListener("mousemove", event => { 
    bigMapMouse.x = event.clientX - bigBoundingRect.left;
    bigMapMouse.y = event.clientY - bigBoundingRect.top;
    if (!bigMapOpened) return; 
    showBigMap();
    if (zoomingMode) return;

    const rawSourceX = mainMap.img.width * bigMapMouse.x / bigMapCanvas.width - mainMap.mapCanvas.width / 2;
    const rawSourceY = mainMap.img.height * bigMapMouse.y / bigMapCanvas.height - mainMap.mapCanvas.height / 2;
    const sourceX = (rawSourceX > 0 && rawSourceX <= mainMap.img.width)? rawSourceX : 0;
    const sourceY = (rawSourceY > 0 && rawSourceY <= mainMap.img.height)? rawSourceY : 0;
    const sx = sourceX * bigMapCanvas.width / mainMap.img.width;
    const sy = sourceY * bigMapCanvas.height / mainMap.img.height;
    const width = mainMap.mapCanvas.width * bigMapCanvas.width / mainMap.img.width;
    const height = mainMap.mapCanvas.height * bigMapCanvas.height / mainMap.img.height;

    bigMapCtx.fillStyle = "rgba(96,96,96,0.6)";
    bigMapCtx.fillRect(sx, sy, width, height);
    bigMapCtx.beginPath();
    bigMapCtx.lineWidth = "1";
    bigMapCtx.strokeStyle = "red";
    bigMapCtx.rect(sx, sy, width, height);
    bigMapCtx.stroke();   
})


controlsButton.onclick = function(){
    controlsDialog.showModal();
}

mapDialog.onclose = function(){
    bigMapOpened = false;
    zoomingMode = false;
}

mapButton.onclick = function(){
    mapDialog.showModal();
    bigMapOpened = true;
    showBigMap(); 
}

function showBigMap(){

    const ratio = mainMap.img.width / mainMap.img.height;
    const maxWidth = window.innerWidth * BIG_MAP_SCALE;
    const maxHeight = window.innerHeight * BIG_MAP_SCALE;
    let bigMapWidth, bigMapHeight; 

    if (mainMap.img.width >= mainMap.img.height) {
        bigMapWidth = maxWidth;
        bigMapHeight = bigMapWidth / ratio; 
        if (bigMapHeight > maxHeight){
            bigMapWidth -= bigMapWidth * (1 - maxHeight / bigMapHeight);
            bigMapHeight = maxHeight;
        }
    }
    if (mainMap.img.width < mainMap.img.height){
        bigMapHeight = maxHeight;
        bigMapWidth = bigMapHeight * ratio;
        if (bigMapWidth > maxWidth){
            bigMapHeight -= bigMapHeight * (1 - bigMapWidth / maxWidth);
            bigMapWidth = maxWidth;
        }
    }

    mapDialog.style.width = bigMapWidth;
    bigMapCanvas.width = bigMapWidth;
    mapDialog.style.height = bigMapHeight;
    bigMapCanvas.height = bigMapHeight;
    bigBoundingRect = bigMapCanvas.getBoundingClientRect();

    
    const sourceWidth = zoomingMode? mainMap.mapCanvas.width : mainMap.img.width;
    const sourceHeight = zoomingMode? mainMap.mapCanvas.height  : mainMap.img.height;
    const widthRatio = bigMapCanvas.width / sourceWidth;
    const heightRatio = bigMapCanvas.height / sourceHeight;
    const rawSourceX = zoomingMode? mainMap.img.width * bigMapMouse.x / bigMapWidth - mainMap.mapCanvas.width / 2 : 0;
    const rawSourceY = zoomingMode? mainMap.img.height * bigMapMouse.y / bigMapHeight - mainMap.mapCanvas.height / 2 : 0;
    const sourceX = (rawSourceX > 0 && rawSourceX <= mainMap.img.width)? rawSourceX : 0;
    const sourceY = (rawSourceY > 0 && rawSourceY <= mainMap.img.height)? rawSourceY : 0;

    bigMapCtx.drawImage(mainMap.img, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, bigMapCanvas.width, bigMapCanvas.height);
    mainMap.elementsOnMap[0].forEach(element => {
        const x = zoomingMode? element.x * widthRatio  - sourceX * widthRatio : element.x * widthRatio;
        const y = zoomingMode? element.y  * heightRatio  - sourceY * heightRatio: element.y * heightRatio;
        const width = element.width * widthRatio;
        const height = element.height * heightRatio;
        bigMapCtx.drawImage(element.img, 0, 0, element.img.width, element.img.height, x, y, width, height);
    });

    }

var redrawCanvas = false;
var freezeDrawing = false;


const drawOnCanvas = (myCanvas, elements) => {
    if (!redrawCanvas || freezeDrawing) return;
    if (!isAtLeast2dArray(elements)) return;
    
}

const mainMap = createBigMap();
mainMap.declare({id: "map", widthFactor: 40, heightFactor: 70, throttlingTime: 100});
mainMap.loadImage("bigMap.png");

mainMap.x = 0;
mainMap.y = 0;
mainMap.updateCorners();

var x = 50, y = 190, factor = 50, minus = false;

setInterval(mainMap.work, 50);


function clearLines(){
    socket.emit('clearLines');
}


socket.on('char_added', ([newURL, id, x, y, sizeMultiplier]) => {
    const newCharacter = createCharacter(id);
    newCharacter.x = x;
    newCharacter.y = y;
    newCharacter.sizeMultiplier = sizeMultiplier;
    newCharacter.loadImage(newURL);
    mainMap.pushElement(newCharacter);
})

socket.on('move-order', ([x, y, id]) => {
    mainMap.elementsOnMap[0].forEach(item => {
        if (item.id === id) item.move({x: x, y: y});
    }) 
});

socket.on('coords', function(coordinates){ //coordinates when we have loaded the page
    if (!coordinates) return;
    mainMap.elementsOnMap = [[]];
    coordinates.forEach(champion => {
        const newCharacter = createCharacter(champion.id);
        newCharacter.x = champion.x;
        newCharacter.y = champion.y;
        newCharacter.sizeMultiplier = champion.sizeMultiplier;
        newCharacter.loadImage(champion.graphic);
        mainMap.pushElement(newCharacter);
    })
    
    
});

socket.on('change-the-map', map_path =>{
    mainMap.loadImage(map_path);
})

socket.on('delete-asset', id => {
    mainMap.elementsOnMap[0] = mainMap.elementsOnMap[0].filter(el => el.id !== id);
})

socket.on('emphasizeOrder', ([x, y]) => {
    emphasize(mainMap, x,y);
})

socket.on('lines', linesData => lines = linesData);
socket.emit('linesPlease');

function avatarPlaceholder(){
    const newCharacter = createCharacter(1111);
    newCharacter.x = 50;
    newCharacter.y = 50;
    newCharacter.sizeMultiplier = 1;
    newCharacter.loadImage('https://drive.google.com/uc?id=1nDT9hUjVmFPDmsCkwjCQSCTTt1rBkU7n');
    mainMap.pushElement(newCharacter);
}

setTimeout(avatarPlaceholder, 1000);