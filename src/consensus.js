import GameSettings from '../frontend/src/GameSettings';

// find the move with the highest frequency
export default function findConsensus(submittedMoves) {
  const movesIdMap = new Map();
  submittedMoves.forEach((move, id) => {
    if (movesIdMap.has(move)) {
      const idArray = movesIdMap.get(move);
      idArray.push(id);
    } else {
      movesIdMap.set(move, [ id ]);
    }
  });

  let mostMoves = {
    move: Math.floor(Math.random() * GameSettings.BOARD_SIZE * GameSettings.BOARD_SIZE),
    ids: [],
  };

  movesIdMap.forEach((ids, move) => {
    if (ids.length > mostMoves.ids.length) {
      mostMoves = { move, ids };
    }
  });

  return mostMoves;
}
