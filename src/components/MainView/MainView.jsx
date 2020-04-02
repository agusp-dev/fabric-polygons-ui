import React from 'react'

class MainView extends React.Component {

  render() {
    return (
      <div className='ui container'>
        <div className='ui vertically grid'>
          <div className='row'>
            <div className='left floated ten wide column'>
              <h1 className='ui grey header'>Canvas UI</h1>
            </div>
            <div className='right floated three wide column'>
              <button className='ui green button'>New Polygon</button>
            </div>
          </div>
          <div className='row'>
            <canvas style={{border:'1px solid grey', width:'100%', height:'100%'}}></canvas>
          </div>
        </div>
      </div>
    )
  }
}

export { MainView }