const canvas = document.getElementById("gameWindow");
const ctx = canvas.getContext("2d");

const viewport = {
    width: canvas.width,
    height: canvas.height,
    x: 0,
    y: 0
}

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);