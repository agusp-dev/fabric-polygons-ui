import React from 'react'
import { Polygon } from '../../fabric/Polygon'
import { fabric } from 'fabric'

class MainView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentState: 'NO POLYGON'
    }
  }

  componentDidMount() {
    const canvas = document.getElementsByClassName('canvas')[0]
    this.createCanvas(canvas.clientWidth, canvas.clientHeight)
  }

  createCanvas = (width, height) => {
    this.canvasF = new fabric.Canvas('canvas-f', { width, height, fireRightClick: true})
    this.canvasF.stopContextMenu = true
  }

  createPolygon = () => {
    new Polygon(
      this.canvasF, 
      this.canvasF.width, 
      this.canvasF.height,
      this.onChangePolygonState
    )
  }

  onChangePolygonState = state => {
    this.setState({
      currentState: state
    })
  }

  render() {
    return (
      <div className='ui container' style={{marginTop:'20px'}}>
        <div className='ui vertically grid'>
          <div className='row'>
            <div className='left floated ten wide column'>
              <h1 className='ui grey header'>Canvas UI</h1>
            </div>
            <div className='right floated three wide column'>
              <button 
                className='ui green button'
                onClick={ this.createPolygon }
                >New Polygon
              </button>
            </div>
          </div>
          <div className='row'>
            <canvas id='canvas-f' className='canvas' style={{border:'1px solid grey', width:'100%', height:'100%'}} />
            <div className='ui basic grey large label' style={{marginTop:'10px'}}>
              Mode:
              <div className='detail' style={{color: '#CD91A8'}}>
                {this.state.currentState}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export { MainView }