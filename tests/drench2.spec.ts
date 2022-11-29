import { test } from "@playwright/test";

const Color = {
  RED: {name: 'red', code: 'rgb(234, 32, 39)', id: 'b1'},
  BLUE: {name: 'blue', code: 'rgb(6, 81, 221)', id: 'b2'},
  GREEN: {name: 'green', code: 'rgb(0, 138, 132)', id: 'b3'},
  YELLOW: {name: 'yellow', code: 'rgb(254, 184, 20)', id: 'b4'},
  LIGHT_GREEN: {name: 'lightGreen', code: 'rgb(206, 211, 173)', id: 'b5'},
  PINK: {name: 'pink', code: 'rgb(232, 67, 147)'},
  WHITE: {name: 'white', code: 'white'},
};

test("Play The Game - Drench2", async ({ page }) => {
	await page.goto("http://www.flashbynight.com/drench2/");

  const play9x9ButtonSelector = '#butang1'
	await page.waitForSelector(play9x9ButtonSelector)
	await page.click(play9x9ButtonSelector);

  console.log('CALCULATING...')
  const winnerActions = calculateWinner(await getState(page))
  
  console.log(`WINNER (${winnerActions.length}) - ${winnerActions.map(action => action.name)}`)
 
  console.log('CLICKING...')
  await clickColors(winnerActions, page)
  
  console.log('END')

  // just to keep window open
	await new Promise(() => {});
});

const calculateWinner = initialState => {
  let statesWithActions = [{ actions: [], state: initialState}]
  let winnerActions: any[] = []
  let isSuccess = false

  for(let i = 0; i < 20 && !isSuccess; i++) {
    console.log(`=== ${i+1} (${statesWithActions.length}) ===`)

    let newStatesWithActions: any[] = []
    statesWithActions.forEach(stateWithActions => {
      if(isSuccess) {
        return
      }
      const colorsToClickAndPositions = getClickableColorsAndPosition(stateWithActions.state)
      const itemsToChangeArray = getStateDifferenceAfterClick(colorsToClickAndPositions, stateWithActions.state)

      itemsToChangeArray.forEach(item => {
        if(isSuccess) {
          return
        }
        let newStateWithActions = { 
          actions: [...stateWithActions.actions, item.color],
          state: setState(item.array, stateWithActions.state)
        }
      
        if(isSolved(newStateWithActions.state)) {
          isSuccess = true
          winnerActions = newStateWithActions.actions
          return
        }

        newStatesWithActions.push(newStateWithActions)
      })
    })

    statesWithActions = newStatesWithActions
  }

  return winnerActions
}

const getState = async page => {
  const rgb = await page.$$eval('.square', elements => 
    elements.map(element => element.attributes.style.nodeValue.match(/color: (.*);/)[1]))
  return rgb.map(color => getColorByCode(color))
}

const setState = (arrayToChange, currentState) =>
  currentState.map((item, index) => arrayToChange.includes(index) ? Color.WHITE : item)

const getClickableColorsAndPosition = state => {
  const clickableColors = Object.keys(Color)
    .filter(key => Color[key].id).map(key => Color[key])
    
  let itemsToClick: any[] = [];
  clickableColors.forEach(color => {
    let position = getWhiteDirectsNeighboursOfColor(color, state)
    if(position.length > 0) {
      itemsToClick.push({color, position})
    }
  })

  return itemsToClick
}

const getWhiteDirectsNeighboursOfColor = (colorToSearch, state) => {
  let final: Number[] = [];

  getIndexesOfWhite(state).forEach(cell => {
     final = final.concat(neighbours(cell).filter(a => state[a] === colorToSearch))
  });

  return [...new Set(final)]
}

const getSequentialNeiboughtsByCells = (cells, state) => {
  let final: Number[] = [];

  cells.forEach(cell => {
    let neighbours = getDirectsNeighboursOfSameColorByCell(cell, state)
    final = final.concat(cells, neighbours)
  
    while(neighbours.length > 0) {
      let newNeighbours: Number[] = [];
      neighbours.forEach(neighbour => {  
        newNeighbours = getDirectsNeighboursOfSameColorByCell(neighbour, state)
          .filter(obj => final.indexOf(obj) == -1)
          
        if(newNeighbours.length > 0) {
          final = final.concat(newNeighbours)
        }
      })
      neighbours = newNeighbours
    }
  })
  
  return [... new Set(final)]
}

const getDirectsNeighboursOfSameColorByCell = (cell, state) =>
  [...new Set(neighbours(cell).filter(a => a == cell ? false : state[a] === state[cell]))]

const getStateDifferenceAfterClick = (itemsToClick, state) => itemsToClick.map(item => {
  return {color: item.color, array: getSequentialNeiboughtsByCells(item.position, state)}
})

const getColorByCode = colorCode =>
  colorCode && Color[Object.keys(Color).find(color => Color[color].code === colorCode)!]

const getIndexesOfWhite = state =>
  state.map((color, index) => color === Color.WHITE ? index : '').filter(String)

const isSolved = state => 
  state.filter(item => item != Color.WHITE).length === 0

const neighbours = cell => {
  let top = cell <= 8 ? null : cell - 9
  let right = (cell+1)%9 ? cell + 1 : null
  let bottom = cell >= 72 ? null : cell + 9
  let left = cell > 0 && cell%9 ? cell - 1 : null

  return [top, right, bottom, left]
}

const clickColors = async (arrayToClick, page) => {
  for(let i = 0; i < arrayToClick.length; i++) {
    await page.click(`#${arrayToClick[i].id}`)
    await page.waitForTimeout(500);
  }
}