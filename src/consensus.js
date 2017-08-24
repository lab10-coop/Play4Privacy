import GameSettings from '../frontend/src/GameSettings';

// find the move with the highest frequency or return a random move
export default function findConsensus(submittedMoves) {
  let mostMoves = {
    move: Math.floor(Math.random() * GameSettings.BOARD_SIZE * GameSettings.BOARD_SIZE),
    ids: [],
  };

  const movesIdMap = new Map();
  submittedMoves.forEach((move, id) => {
    let ids = [];
    if (movesIdMap.has(move)) {
      ids = movesIdMap.get(move);
      ids.push(id);
    } else {
      ids = [ id ];
      movesIdMap.set(move, ids);
    }

    if (ids.length > mostMoves.ids.length) {
      mostMoves = { move, ids };
    }
  });

  return mostMoves;
}
