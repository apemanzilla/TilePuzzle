import {Puzzle, Moves} from "Puzzle";
import {ArrayPuzzleSet, SortedPuzzleSet} from "Structures/PuzzleSet";
import {HashPuzzleMap, PuzzleMapWithDefault} from "./Structures/PuzzleMap";

function reconstructPath(cameFrom: HashPuzzleMap<Puzzle>, cameFromMoves: HashPuzzleMap<Moves>, current: Puzzle): Moves[] {
	let totalPath = [];
	while (cameFrom.containsKey(current)) {
		totalPath.unshift(cameFromMoves.get(current));

		current = cameFrom.get(current);
	}
	return totalPath;
}

/**
 * Solves a puzzle using A* search
 * Horribly inefficient but it works
 * @param {Puzzle} start
 */
export function solve(start: Puzzle): Moves[] {
	start = new Puzzle(start.tiles);

	// nodes already evaluated
	let closedSet = new ArrayPuzzleSet();
	
	// node => node that it can most easily be reached from
	let cameFrom = new HashPuzzleMap<Puzzle>();
	// complementary map, node => move to node it can be most easily reached from
	let cameFromMoves = new HashPuzzleMap<Moves>();

	// node => cost to reach that node from start
	let gScore = new PuzzleMapWithDefault<number>(Infinity);
	gScore.put(start, 0);

	// node => cost to reach end from that node (partially heuristic, partially known)
	let fScore = new PuzzleMapWithDefault<number>(Infinity);
	fScore.put(start, start.solveHeuristic());

	// discovered but unexplored nodes
	let openSet = new SortedPuzzleSet(p => fScore.get(p), [start]);

	let ops = 0;

	while (openSet.length > 0) {
		let current = openSet.first();

		if (current.isSolved()) {
			// solution found
			console.log(`Solution found after ${ops} operations`);
			return reconstructPath(cameFrom, cameFromMoves, current);
		}

		openSet.remove(current);
		closedSet.add(current);

		for (let move of current.validMoves()) {
			const neighbor = new Puzzle(current.tiles);
			neighbor.move(move);

			if (closedSet.contains(neighbor)) continue; // ignore already evaluated neighbors

			if (!openSet.contains(neighbor)) openSet.add(neighbor); // discovered a new node

			let tentativeGScore = gScore.get(current) + 1;

			if (tentativeGScore > gScore.get(neighbor)) continue; // not a better path

			cameFrom.put(neighbor, current);
			cameFromMoves.put(neighbor, move);
			gScore.put(neighbor, tentativeGScore);
			fScore.put(neighbor, tentativeGScore + neighbor.solveHeuristic());
		}

		if (ops % 100 == 0) {
			console.log(`Solving, ${ops} operations`);
		}

		if (ops >= 10000) {
			throw new Error(`Maximum operations exceeded (${ops})`);
		}

		ops++;
	}

	throw new Error(`Solving failed`);
}