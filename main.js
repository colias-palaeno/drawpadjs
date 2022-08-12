const canvas = document.getElementById('canvas')
const sticky = document.getElementById('sticky')
const picker = document.getElementById('picker')
const downloadButton = document.getElementById('downloadButton')

const ctx = canvas.getContext('2d')

let savedCanvas
let coord = {x: 0, y: 0}
let rightClickCoords = []
let lineWidth = 3
let coords

new ResizeObserver(resize).observe(document.body, {childList: true, subtree: true})

addEventListener('keydown', keyDown)
canvas.addEventListener('mousedown', start)
canvas.addEventListener('contextmenu', rightClick)
downloadButton.addEventListener('click', download)  

function resize() {
  canvas.width = document.documentElement.clientWidth - 16
  canvas.height = document.documentElement.clientHeight - sticky.offsetHeight - downloadButton.offsetHeight - 16
  if (savedCanvas != null) ctx.putImageData(savedCanvas, 0, 0)
}; resize();

const clearRectCoords = () => {
  rightClickCoords.sort((a,b) => a.reduce((x,y)=>x+y) - b.reduce((z,c)=>z+c))
  ctx.clearRect(...(rightClickCoords[0].map(x=>x-2)), rightClickCoords[1][0]-rightClickCoords[0][0]+10, rightClickCoords[1][1]-rightClickCoords[0][1]+10)
  rightClickCoords.forEach(point => ctx.clearRect(...point, 5, 5))
}

const strokeRectCoords = () => ctx.strokeRect(...rightClickCoords[0], coords[0]-rightClickCoords[0][0], coords[1] - rightClickCoords[0][1])

function keyDown(k) {
  switch (k.code) {
    case 'ArrowUp':
      k.preventDefault() 
      lineWidth++
      break
    case 'ArrowDown':
      k.preventDefault() 
      lineWidth--
      break
    case 'Delete':
      if (rightClickCoords.length == 2) {
        clearRectCoords()
      } else ctx.clearRect(0, 0, canvas.width, canvas.height)
      rightClickCoords = []
      break
    case 'KeyL':
      if (ctx.globalCompositeOperation == 'source-over') ctx.globalCompositeOperation = 'destination-over'; 
      else ctx.globalCompositeOperation= 'source-over'
  }
}

function download() {
    const link = document.createElement('a')
    link.download = 'Drawpad.js.png'; link.href = canvas.toDataURL()
    link.click(); link.remove()
};

function reposition(ev) {
  coord.x = ev.clientX - canvas.offsetLeft
  coord.y = ev.clientY - canvas.offsetTop
};

function start(c) {
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'butt'
    ctx.strokeStyle = picker.getAttribute('data-current-color')
    this.removeEventListener('mousedown', start)
    this.addEventListener('mousemove', draw)
    this.addEventListener('mouseup', end)
    reposition(c)
};

function rightClick(c) {
  c.preventDefault()
  coords = [c.clientX - canvas.offsetLeft, c.clientY - canvas.offsetTop];
  ctx.beginPath()
  ctx.fillStyle = 'CornflowerBlue'
  ctx.fillRect(...coords, 5, 5)
  ctx.fill()

  switch (rightClickCoords.length) {
    case 1:
      ctx.globalAlpha = 0.5
      ctx.fillStyle = 'CadetBlue'; ctx.lineWidth = 1
      ctx.beginPath()
      strokeRectCoords()
      ctx.stroke(); ctx.fill()
      rightClickCoords[1] = coords
      ctx.globalAlpha = 1
      break
    case 2:
      clearRectCoords()
      rightClickCoords = []
    default:
      rightClickCoords[0] = coords
  }
  
};

function end() {
  this.addEventListener('mousedown', start)
  this.removeEventListener('mousemove', draw)
  this.removeEventListener('mouseup', end)
  savedCanvas = ctx.getImageData(0,0,canvas.width,canvas.height)
};

function draw(ev) {
  ctx.beginPath()
  ctx.moveTo(coord.x, coord.y)
  reposition(ev)
  ctx.lineTo(coord.x, coord.y)
  ctx.stroke()
};
