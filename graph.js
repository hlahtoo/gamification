export class Graph {
  constructor(nodes, edges = []) {
    this.nodesforViz = nodes.map((id) => ({
      id,
      label: ` #${id + 1}`,
      selectable: false,
    }));
    this.nodes = nodes;
    this.edges = edges;
    this.edgeSet = new Set(this._edgeSet());
  }

  _edgeSet() {
    return this.edges.map((edge) => `${edge[0]}-${edge[1]}`);
  }

  addEdge(edge) {
    const [from, to, label] = edge;
    const edgeString = `${from}-${to}`;

    if (!this.edgeSet.has(edgeString)) {
      const newEdge = {
        id: edgeString,
        from,
        to,
        label: label.toString(),
        color: { color: "lightgray" },
      };
      this.edges.push([from, to, label]); // Store edge as [from, to, label]
      this.edgeSet.add(edgeString);
      return true;
    } else {
      return false;
    }
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  createRandomEdge() {
    const weight = Math.floor(Math.random() * 100);
    const node1 = this.getRandomInt(0, this.nodes.length - 1);
    let node2 = this.getRandomInt(0, this.nodes.length - 1);
    while (node1 === node2) {
      node2 = this.getRandomInt(0, this.nodes.length - 1);
    }
    if (node1 < node2) {
      return [this.nodes[node1], this.nodes[node2], weight];
    } else {
      return [this.nodes[node2], this.nodes[node1], weight];
    }
  }

  addRandomEdge(totalEdges) {
    while (this.edges.length < totalEdges) {
      this.addEdge(this.createRandomEdge());
    }
  }
}

export function createRandomConnectedGraph(nodes, totalEdges) {
  const allNodes = [...nodes];
  const visited = new Set();

  function popRandomElement(array) {
    const index = Math.floor(Math.random() * array.length);
    return array.splice(index, 1)[0];
  }
  let cur = popRandomElement(allNodes);
  visited.add(cur);

  const graph = new Graph(nodes);

  while (allNodes.length > 0) {
    let neighbor = popRandomElement(allNodes);
    const weight = Math.floor(Math.random() * 100);
    if (!visited.has(neighbor)) {
      graph.addEdge(
        cur < neighbor ? [cur, neighbor, weight] : [neighbor, cur, weight]
      );
      visited.add(neighbor);
      cur = neighbor;
    }
  }

  graph.addRandomEdge(totalEdges);

  return graph;
}