import { fabric } from 'fabric'

class Polygon {

  BACKGROUND_COLOR = '#62B7A0'
  POINT_COLOR = '#368F77'
  BORDER_COLOR = '#7C7C7C'
  POLYGON_TYPE = 'POLYGON'
  POINT_TYPE = 'POINT'

  selectedPolygon = undefined
  
  constructor(canvas, width, height) {
    this.canvasF = canvas
    let coords = this.getPolygonDefaultCoords(width/2, height/2)
    coords = coords.map(p => new fabric.Point(p[0], p[1]))
    this.selectedPolygon = this.createPolygon(coords, true, false)
    this.canvasF.add(this.selectedPolygon)
    this.canvasF.setActiveObject(this.selectedPolygon)

    this.addPolygonListeners()
    this.setCanvasListeners()
  }

  getPolygonDefaultCoords = (width, height) => {
    const defaultSize = 40
    return [
      [width - defaultSize, height - defaultSize],
      [width + defaultSize, height - defaultSize],
      [width + defaultSize, height + defaultSize],
      [width - defaultSize, height + defaultSize]
    ]
  }

  createPolygon = (points, selectable, objectCaching) => {
    return new fabric.Polygon(points, {
      id: this.getId(),
      type: this.POLYGON_TYPE,
      fill: this.BACKGROUND_COLOR,
      opacity: 0.5,
      borderColor: this.BORDER_COLOR,
      borderOpacityWhenMoving: 1,
      selectable,
      objectCaching
    })
  }

  reDrawPolygon = (selectable, objectCaching) => {
    const points = this.selectedPolygon.points
    this.canvasF.remove(this.selectedPolygon)
    this.selectedPolygon = this.createPolygon(points, selectable, objectCaching)
  }

  createPoint = (x, y, selectable, hasBorders, hasControls, name) => {
    return new fabric.Circle({
      id: this.getId(),
      name,
      type: this.POINT_TYPE,
      radius: 5,
      fill: this.POINT_COLOR,
      left: x,
      top: y,
      selectable,
      originX: 'center',
      originY: 'center',
      hasBorders,
      hasControls
    })
  }

  removeAllPoints = () => {
    this.canvasF.getObjects()
      .filter(o => o.type === this.POINT_TYPE)
      .map(p => this.canvasF.remove(p))
  }

  getId = () => {
    return new Date().getTime()
  }

  getCenterPoint = (x1, x2) => {
    return (x1 + x2) / 2
  }

  addPolygonListeners = () => {
    this.selectedPolygon.on('mousedblclick', e => {
      if (this.selectedPolygon.get('selectable')) {
        this.selectedPolygon.set('selectable', false)
        this.canvasF.discardActiveObject()
        this.selectedPolygon.points.map((p, i) => {
          const point = this.createPoint(p.x, p.y, true, false, false, i)
          return this.canvasF.add(point)
        })
      } else {
        this.removeAllPoints()
        this.reDrawPolygon(true, false)
        this.canvasF.add(this.selectedPolygon)
        this.canvasF.setActiveObject(this.selectedPolygon)    
        this.addPolygonListeners()
      }
    })
  }

  onPolygonModified = object => {
    if (object.type !== this.POLYGON_TYPE) return
    const matrix = this.selectedPolygon.calcTransformMatrix()
    const transformedPoints = this.selectedPolygon.points
      .map(po => {
        return new fabric.Point(
          po.x - this.selectedPolygon.pathOffset.x,
          po.y - this.selectedPolygon.pathOffset.y
        )
    }).map(pa => {
      return fabric.util.transformPoint(pa, matrix)
    })

    this.canvasF.remove(this.selectedPolygon)
    this.selectedPolygon = this.createPolygon(transformedPoints, true, false)
    this.canvasF.add(this.selectedPolygon)
    this.canvasF.setActiveObject(this.selectedPolygon)
    this.addPolygonListeners()
  }

  onPointModified = object => {
    if (object.type !== this.POINT_TYPE) return
    this.selectedPolygon.points[object.name] = new fabric.Point(object.getCenterPoint().x, object.getCenterPoint().y)
    this.reDrawPolygon(false, false)
    this.canvasF.add(this.selectedPolygon)
    this.selectedPolygon.sendToBack()
    this.addPolygonListeners()
  }

  setCanvasListeners = () => {
    //POINTS
    this.canvasF.on('object:moving', o => {
      if (!this.selectedPolygon) return
      this.onPointModified(o.target)
    })
    //POLYGONS
    this.canvasF.on('object:moved', e => {
      if (!this.selectedPolygon) return
      this.onPolygonModified(e.target)
    })
    this.canvasF.on('object:rotated', e => {
      if (!this.selectedPolygon) return
      this.onPolygonModified(e.target)
    })
    this.canvasF.on('object:scaled', e => {
      if (!this.selectedPolygon) return
      this.onPolygonModified(e.target)
    })
  }
}

export { Polygon }