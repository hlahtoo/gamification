import * as THREE from "three";
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from "three.meshline";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

let font;
const labels = [];

export function setFont(loadedFont) {
  font = loadedFont;
}

export function createRing(innerRadius, outerRadius, depth, color) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const extrudeSettings = {
    depth: depth,
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshBasicMaterial({
    color: color,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = -Math.PI / 2;
  ring.visible = false;
  return ring;
}

// Function to create text labels
function createLabel(text, position, color = 0x000000, scene) {
  const textGeometry = new TextGeometry(text, {
    font: font,
    size: 1.2,
    depth: 0.2,
  });

  // Compute the bounding box of the text geometry
  textGeometry.computeBoundingBox();
  const boundingBox = textGeometry.boundingBox;

  // Calculate the offset to center the text
  const textOffset = boundingBox
    .getCenter(new THREE.Vector3())
    .multiplyScalar(-1);

  // Apply the offset to the text geometry
  textGeometry.translate(textOffset.x, textOffset.y, textOffset.z);

  const textMaterial = new THREE.MeshBasicMaterial({ color });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);

  // Position the text mesh at the specified position
  textMesh.position.copy(position);
  textMesh.rotation.x = -Math.PI / 2;
  scene.add(textMesh);
  labels.push(textMesh);
  return textMesh;
}

export function createNodeLabel(
  text,
  position,
  scene,
  size = 1.2,
  depth = 0.3,
  color = 0xffd700
) {
  const textGeometry = new TextGeometry(text, {
    font: font,
    size: size,
    depth: depth,
  });

  // Center the geometry
  textGeometry.computeBoundingBox();
  const boundingBox = textGeometry.boundingBox;
  const centerOffsetX = -0.5 * (boundingBox.max.x - boundingBox.min.x);
  const centerOffsetY = -0.5 * (boundingBox.max.y - boundingBox.min.y);
  const centerOffsetZ = -0.5 * (boundingBox.max.z - boundingBox.min.z);
  textGeometry.translate(centerOffsetX, centerOffsetY, centerOffsetZ);

  const textMaterial = new THREE.MeshBasicMaterial({ color: color });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.copy(position);

  scene.add(textMesh);
  return textMesh;
}

export function updateNodeLabel(
  textMesh,
  newText,
  size = 0.35,
  depth = 0.15,
  color = 0xffd700
) {
  textMesh.geometry.dispose();
  textMesh.material.dispose();

  const newTextGeometry = new TextGeometry(newText, {
    font: font,
    size: size,
    depth: depth,
  });

  textMesh.geometry = newTextGeometry;
  textMesh.material = new THREE.MeshBasicMaterial({ color: color });
}

export function updateNodeLabelColor(textMesh, color) {
  textMesh.material.color.set(color);
}

export function getRandomColor() {
  const colors = [
    "#F1F6F1",
    "#f8fa90",
    "#6aff4c",
    "#55F7FF",
    "#FC5B3B",

    // "#be4bdb",
    // "#7950f2",
    // "#4c6ef5",
    // "#15aabf",
    // "#12b886",
    // "#40c057",
    // "#fab005",
    // "#fd7e14",
  ];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

export function updateComponentColors(uf, nodes, componentColors) {
  const newColors = {};
  nodes.forEach((node) => {
    const root = uf.find(node);
    if (!newColors[root]) {
      newColors[root] = getRandomColor();
    }
    componentColors[node] = newColors[root];
  });
}

export function drawLine(startCube, endCube, weight, edge, scene) {
  const lineMaterial = new MeshLineMaterial({
    color: 0x74c0fc,
    lineWidth: 0.2, // Set the desired line width
  });

  const points = [];

  const numSegments = 50; // Increase the number of segments for more precision
  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    const x =
      startCube.position.x + t * (endCube.position.x - startCube.position.x);
    const y =
      startCube.position.y + t * (endCube.position.y - startCube.position.y);
    const z =
      startCube.position.z + t * (endCube.position.z - startCube.position.z);
    points.push(new THREE.Vector3(x, y, z));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new MeshLine();
  line.setGeometry(geometry);

  const mesh = new THREE.Mesh(line.geometry, lineMaterial);
  mesh.raycast = MeshLineRaycast;
  scene.add(mesh);

  // Create label in the middle of the line
  const midPoint = new THREE.Vector3(
    (startCube.position.x + endCube.position.x) / 2,
    (startCube.position.y + endCube.position.y) / 2 + 0.5,
    (startCube.position.z + endCube.position.z) / 2
  );
  const label = createLabel(weight.toString(), midPoint, 0x000000, scene);
  mesh.userData = { startCube, endCube, label, edge, selected: false }; // Store edge data and selected state

  return mesh;
}

export function updateLinePosition(mesh, startCube, endCube) {
  const points = [];

  const numSegments = 50; // Same number of segments as used in drawLine
  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    const x =
      startCube.position.x + t * (endCube.position.x - startCube.position.x);
    const y =
      startCube.position.y + t * (endCube.position.y - startCube.position.y);
    const z =
      startCube.position.z + t * (endCube.position.z - startCube.position.z);
    points.push(new THREE.Vector3(x, y, z));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new MeshLine();
  line.setGeometry(geometry);

  mesh.geometry.dispose(); // Dispose of the old geometry
  mesh.geometry = line.geometry; // Set the new geometry

  // Update the label position
  const midPoint = new THREE.Vector3(
    (startCube.position.x + endCube.position.x) / 2,
    (startCube.position.y + endCube.position.y) / 2 + 0.5,
    (startCube.position.z + endCube.position.z) / 2
  );
  mesh.userData.label.position.copy(midPoint);
  if (mesh.userData.ring) {
    mesh.userData.ring.position.copy(mesh.userData.label.position);
  }
}

// Usage:
// Assume 'lineMesh' is the mesh returned from drawLine function
// updateLinePosition(lineMesh, newStartCube, newEndCube);

export function isTriangleInequalitySatisfied(a, b, c, margin) {
  const ab = a.distanceTo(b);
  const bc = b.distanceTo(c);
  const ac = a.distanceTo(c);
  return (
    ab + bc > ac + margin && ab + ac > bc + margin && ac + bc > ab + margin
  );
}

// Function to highlight a chest
export function highlightChest(chest, scene) {
  const circleGeometry = new THREE.CircleGeometry(1, 32);
  const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
  const circle = new THREE.Mesh(circleGeometry, circleMaterial);
  circle.position.set(
    chest.position.x,
    chest.position.y + 0.1,
    chest.position.z
  ); // Slightly above the chest
  circle.rotation.x = -Math.PI / 2;
  scene.add(circle);
  return circle;
}
