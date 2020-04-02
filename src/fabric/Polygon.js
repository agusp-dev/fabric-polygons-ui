import { fabric } from 'fabric'

class Polygon {
  
  constructor(canvas, width, height) {
    this.canvasF = canvas
    console.log('Polygon class')
    const coords = this.getPolygonCoords(width/2, height/2)
    this.drawPolygon(coords)
  }

  getPolygonCoords = (width, height) => {
    return [
      [width - 40, height - 40],
      [width + 40, height - 40],
      [width + 40, height + 40],
      [width - 40, height + 40]
    ]
  }

  drawPolygon = points => {
    points = points.map(p => new fabric.Point(p[0], p[1]))
    console.log('points', points)
    const polygon = new fabric.Polygon(points, {
      fill: 'green',
      opacity: 0.5,
      borderColor: 'grey',
      borderOpacityWhenMoving: 1,
      selectable: true
    })
    this.canvasF.add(polygon)
    console.log('active objects', this.canvasF.getObjects())
  }

}

export { Polygon }