// find the move with the highest frequency or return a random move
export default function findConsensus(submittedMoves) {
  let mostMoves = {
    move: undefined,
    ids: [],
  };

  const movesIdMap = new Map();
  submittedMoves.forEach((move, id) => {
    const length = (movesIdMap[move] || (movesIdMap[move] = [])).push(id);

    if (length > mostMoves.ids.length) {
      mostMoves = { move, ids: movesIdMap[move] };
    }
  });

  return mostMoves;
}
