import { fabric } from 'fabric'

class Polygon {

  backgroundColor = '#62B7A0'
  pointColor = '#368F77'
  selectedPolygon = undefined
  
  constructor(canvas, width, height) {
    this.canvasF = canvas
    const coords = this.getPolygonCoords(width/2, height/2)
    this.drawPolygon(coords)
    this.addPolygonListeners()
    this.setCanvasListeners()
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
    this.selectedPolygon = new fabric.Polygon(points, {
      id: this.getId(),
      type: 'POLYGON',
      fill: this.backgroundColor,
      opacity: 0.5,
      borderColor: 'grey',
      borderOpacityWhenMoving: 1,
      selectable: true,
      objectCaching: false
    })
    
    this.canvasF.add(this.selectedPolygon)
    this.canvasF.setActiveObject(this.selectedPolygon)
  }

  getId = () => {
    return new Date().getTime()
  }

  addPolygonListeners = () => {
    this.selectedPolygon.on('mousedblclick', e => {
      
      console.log('current polygon', this.selectedPolygon)

      console.log('cc0', this.selectedPolygon.getCoords())


      console.log('current polygon points', this.selectedPolygon.points)

      if (this.selectedPolygon.get('selectable')) {
        this.selectedPolygon.set('selectable', false)
        this.canvasF.discardActiveObject()
        this.selectedPolygon.points.map((p, i) => {
          const fPoint = new fabric.Circle({
            id: this.getId(),
            type: 'POINT',
            radius: 5,
            fill: this.pointColor,
            left: p.x,
            top: p.y,
            selectable: true,
            originX: 'center',
            originY: 'center',
            hasBorders: false,
            hasControls: false,
            name: i
          })
          this.canvasF.add(fPoint)
        })
      } else {

        this.canvasF.getObjects()
          .filter(o => o.type === 'POINT')
          .map(p => this.canvasF.remove(p))
          
        this.reDrawPolygon()

        this.selectedPolygon.set('selectable', true)
        
        this.canvasF.add(this.selectedPolygon)
        this.canvasF.setActiveObject(this.selectedPolygon)
        this.addPolygonListeners()
      }
    })
  }

  setCanvasListeners = () => {
    this.canvasF.on('object:moving', o => {
      if (!this.selectedPolygon) return
      const p = o.target
      if (p.type === 'POINT') {
        this.selectedPolygon.points[p.name] = new fabric.Point(p.getCenterPoint().x, p.getCenterPoint().y)
        this.reDrawPolygon()
        this.canvasF.add(this.selectedPolygon)
        this.addPolygonListeners()
      }
    })
  }

  reDrawPolygon = () => {

    this.canvasF.remove(this.selectedPolygon)
    const points = this.selectedPolygon.points

    this.selectedPolygon = new fabric.Polygon(points, {
      id: this.getId(),
      type: 'POLYGON',
      fill: this.backgroundColor,
      opacity: 0.5,
      borderColor: 'grey',
      borderOpacityWhenMoving: 1,
      selectable: false,
      objectCaching: false
    })

  }

  

}

export { Polygon }