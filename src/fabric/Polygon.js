import { fabric } from 'fabric'

class Polygon {

  BACKGROUND_COLOR = '#62B7A0'
  POINT_COLOR = '#368F77'
  // INVISIBLE_POINT_COLOR = 'rgba(173, 173, 173, 0.5)'
  INVISIBLE_POINT_COLOR = '#818181'
  BORDER_COLOR = '#7C7C7C'

  POLYGON_TYPE = 'POLYGON'
  
  ALL_POINTS = 'ALL_POINTS'
  POINT_TYPE = 'POINT'
  INVISIBLE_POINT_TYPE = 'INVISIBLE_POINT'

  POINT_RADIUS = 5
  INVISIBLE_POINT_RADIUS = 3

  SELECTABLE_STATE = 'SELECTABLE'
  EDITION_STATE = 'EDITION'

  selectedPolygon = undefined
  currentState = this.SELECTABLE_STATE
  
  constructor(canvas, width, height, onChangeState) {
    this.canvasF = canvas
    this.onChangeState = onChangeState
    let coords = this.getPolygonDefaultCoords(width/2, height/2)
    coords = coords.map(p => new fabric.Point(p[0], p[1]))
    this.selectedPolygon = this.createPolygon(coords, true, false)
    this.canvasF.add(this.selectedPolygon)
    this.canvasF.setActiveObject(this.selectedPolygon)
    this.updateState(this.SELECTABLE_STATE)
    this.addPolygonListeners()
    this.setCanvasListeners()
  }

  updateState = state => {
    this.onChangeState(state)
    this.currentState = state
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

  reDrawPolygon = (points, selectable, objectCaching) => {
    this.canvasF.remove(this.selectedPolygon)
    this.selectedPolygon = this.createPolygon(points, selectable, objectCaching)
  }

  createCirclePoint = (x, y, type, selectable, hasBorders, hasControls, name) => {
    return new fabric.Circle({
      id: this.getId(),
      name,
      type,
      radius: type === this.POINT_TYPE ? this.POINT_RADIUS : this.INVISIBLE_POINT_RADIUS,
      fill: type === this.POINT_TYPE ? this.POINT_COLOR : this.INVISIBLE_POINT_COLOR,
      left: x,
      top: y,
      selectable,
      originX: 'center',
      originY: 'center',
      hasBorders,
      hasControls
    })
  }

  createCirclePointsFromPolygon = () => {
    if (!this.selectedPolygon) return
    this.selectedPolygon.points.map((p, i) => {
      const point = this.createCirclePoint(p.x, p.y, this.POINT_TYPE, true, false, false, i)
      return this.canvasF.add(point)
    })
  }

  createCircleInvisiblePoints = () => {
    if (!this.selectedPolygon) return
    const size = this.selectedPolygon.points.length
    this.selectedPolygon.points.forEach((p, i) => {
      let index = 0
      if (i+1 !== size) {
        index = i+1    
      }
      const centerPoint = this.getCenterPointOfLine(p, this.selectedPolygon.points[index])
      const point = this.createCirclePoint(centerPoint.x, centerPoint.y, 
        this.INVISIBLE_POINT_TYPE, true, false, false, i+50)
      this.canvasF.add(point)
    })
  }

  removePolygonPoint = (x, y) => {
    if (!this.selectedPolygon) return
    let currentPoints = this.selectedPolygon.points
    this.selectedPolygon.points = currentPoints.filter(p => p.x !== x || p.y !== y)
  }

  removeCirclePoints = p => {
    switch (p) {
      case this.ALL_POINTS: {
        this.canvasF.getObjects()
        .filter(o => o.type === this.POINT_TYPE || o.type === this.INVISIBLE_POINT_TYPE)
        .map(p => this.canvasF.remove(p))
        break
      }
      case this.POINT_TYPE: {
        this.canvasF.getObjects()
        .filter(o => o.type === this.POINT_TYPE)
        .map(p => this.canvasF.remove(p))
        break
      }
      case this.INVISIBLE_POINT_TYPE: {
        this.canvasF.getObjects()
        .filter(o => o.type === this.INVISIBLE_POINT_TYPE)
        .map(p => this.canvasF.remove(p))
      }
    }
  }

  getId = () => {
    return new Date().getTime()
  }

  getCenterPoint = (x1, x2) => {
    return (x1 + x2) / 2
  }

  getCenterPointOfLine = (p1, p2) => {
    return new fabric.Point((p1.x+p2.x)/2, (p1.y+p2.y)/2)
  }

  addPolygonListeners = () => {
    this.selectedPolygon.on('mousedblclick', e => {
      if (this.currentState === this.SELECTABLE_STATE && this.selectedPolygon.get('selectable')) {
        this.updateState(this.EDITION_STATE)
        this.selectedPolygon.set('selectable', false)
        this.canvasF.discardActiveObject()
        this.createCirclePointsFromPolygon()
        this.createCircleInvisiblePoints()
      } else {
        this.updateState(this.SELECTABLE_STATE)
        this.removeCirclePoints(this.ALL_POINTS)
        const points = this.selectedPolygon.points
        this.reDrawPolygon(points, true, false)
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

    this.removeCirclePoints(this.INVISIBLE_POINT_TYPE)
    this.createCircleInvisiblePoints()

    const points = this.selectedPolygon.points
    this.reDrawPolygon(points, false, false)

    this.canvasF.add(this.selectedPolygon)
    this.selectedPolygon.sendToBack()
    this.addPolygonListeners()
  }

  onRightClickEditionMode = event => {
    const { pointer } = event
    const newPoint = new fabric.Point(pointer.x, pointer.y)
    const polygonPoints = this.selectedPolygon.points
    polygonPoints.push(newPoint)
    this.reDrawPolygon(polygonPoints, false, false)
    this.canvasF.add(this.selectedPolygon)
    this.removeCirclePoints(this.ALL_POINTS)
    this.createCirclePointsFromPolygon()
    this.selectedPolygon.sendToBack()
    this.addPolygonListeners()
  }

  onRemovePoint = object => {

    this.removePolygonPoint(object.left, object.top)
    const newPoints = this.selectedPolygon.points

    this.reDrawPolygon(newPoints, false, false)
    this.canvasF.add(this.selectedPolygon)
    
    this.removeCirclePoints(this.ALL_POINTS)
    this.createCirclePointsFromPolygon()
    this.createCircleInvisiblePoints()
    this.selectedPolygon.sendToBack()
    this.addPolygonListeners()
  }

  setCanvasListeners = () => {
    //POINTS
    this.canvasF.on('object:moving', e => {
      if (!this.selectedPolygon) return
      this.onPointModified(e.target)
    })
    this.canvasF.on('mouse:dblclick', e => {
      if (!this.selectedPolygon) return
      if (this.selectedPolygon.points.length === 3) return
      const { target } = e
      if (!target) return
      if (target.type !== this.POINT_TYPE) return
      this.onRemovePoint(target)
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
    //RIGHT BUTTON CLICK
    this.canvasF.on('mouse:down', e => {
      if (!this.selectedPolygon || this.currentState !== this.EDITION_STATE || e.button !== 3) return
      this.onRightClickEditionMode(e)
    })
  }
}

export { Polygon }