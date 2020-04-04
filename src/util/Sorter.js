export const Sorter = {
  getArraySortered,
  getPointsDistance
}

getArraySortered = array => {
  let sorteredArray = []

  let shorterDistance
  
  array.forEach((e, i) => {

    let currentItem = e

    array.forEach(n => {

      if (currentItem === n) break
      let distance = getPointsDistance(currentItem, n)
      if (!shorterDistance) {
        shorterDistance = distance
        
      }






    })




  })

  array.map((p, i) => {

    let distance = getPointsDistance(p, array[i+1])
    if (!shorterDistance) {
      shorterDistance = distance
      break
    }










    if (!minnor) {
      minnor = distance
      sorteredArray.push(p)
      break
    }

    if (distance < minnor) {
      minnor = distance
      sorteredArray.push(p)
    }






  })





  return sorteredArray
}

getPointsDistance = (p1, p2) => {
  return Math.sqrt( 
    Math.pow(
      (p2.x - p1.x), 2) + 
    Math.pow(
      (p2.y - p1.y), 2) 
  )
}