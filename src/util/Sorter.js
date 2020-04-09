import sortByDistance from 'sort-by-distance'

const getSorteredPoints = (points, newPoint) => {

  //Change Points to {x, y}
  points = points.map(p => {
    return {x: p.x, y: p.y}
  })
  newPoint = {x:newPoint.x, y:newPoint.y}

  console.log('1', points)
  console.log('2', newPoint)

  //Closest point to newPoint
  const closestPoint = sortByDistance(newPoint, points)[0]

  //Return index to add
  return points.indexOf(closestPoint)
}
  
export const sorter = {
  getSorteredPoints
}