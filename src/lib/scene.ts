import * as THREE from 'three';
import { OrbitControls } from 'three/addons';
import { RenderPass } from 'three/addons';
import { EffectComposer } from 'three/addons';
import { UnrealBloomPass } from 'three/addons';

interface Settings {
	affectingDistance: number;
	avoidanceFactor: number;
	rotationSpeed: number;
}

class Particle {
	mesh: THREE.Mesh;
	radius: number;
	original: THREE.Group;
	lerp: number;
	lerpSpeed: number;
	avoiding: boolean;
	newPosition: THREE.Vector3;
	settings: Settings;

	constructor(radius: number, original: THREE.Group, settings: Settings) {
		this.mesh = new THREE.Mesh(
			new THREE.OctahedronGeometry(0.2, 0),
			new THREE.MeshStandardMaterial({ color: 0x9ece6a })
		);
		this.radius = radius;
		this.original = original;
		this.lerp = 0.0;
		this.lerpSpeed = 0.05;
		this.avoiding = false;
		this.newPosition = new THREE.Vector3();
		this.settings = settings;
	}

	avoidMouse(mouse: THREE.Vector2): void {
		const particlePosition = new THREE.Vector3();
		this.mesh.getWorldPosition(particlePosition);

		const distance = mouse.distanceTo(particlePosition);

		if (distance < this.settings.affectingDistance) {
			const dir = new THREE.Vector2(particlePosition.x - mouse.x, particlePosition.y - mouse.y);

			dir.normalize();

			this.newPosition.x = dir.x * this.settings.avoidanceFactor;
			this.newPosition.y = dir.y * this.settings.avoidanceFactor;

			if (!this.avoiding) {
				this.avoiding = true;
				this.lerp = 0;
			}
		} else {
			this.newPosition.copy(new THREE.Vector3(0, 0, 0));

			if (this.avoiding) {
				this.avoiding = false;
				this.lerp = 0;
			}
		}
	}

	updatePosition(): void {
		this.mesh.position.lerp(this.newPosition, this.lerp);
		if (this.lerp < 1) {
			this.lerp += this.lerpSpeed;
		}
	}
}

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;
let composer: EffectComposer;
let mouse = new THREE.Vector2();
let particleGeo: Particle[] = [];
const particleGeoGroup: THREE.Group = new THREE.Group();

export function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x1a1b26);

	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(0, 0, 75);

	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.enableRotate = false;

	composer = new EffectComposer(renderer);
	const renderPass = new RenderPass(scene, camera);
	composer.addPass(renderPass);
	const bloomPass = new UnrealBloomPass(
		new THREE.Vector2(window.innerWidth, window.innerHeight),
		2.5,
		2.5,
		0.01
	);
	composer.addPass(bloomPass);

	document.addEventListener('mousemove', (event) => {
		event.preventDefault();

		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		const vec = new THREE.Vector3(mouse.x, mouse.y, 0.5);

		vec.unproject(camera);
		const vec2 = vec.sub(camera.position).normalize();
		const distance = -camera.position.z / vec2.z;
		mouse = mouse.copy(camera.position).add(vec2.multiplyScalar(distance));
	});
	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(1, 1, 2);
	scene.add(directionalLight);
}

export function createScene(geo: string, settings: Settings): void {
	type Geometry = { [key: string]: THREE.BufferGeometry };

	const geometry: Geometry = {
		plane: new THREE.PlaneGeometry(16, 16, 32, 32),
		sphere: new THREE.SphereGeometry(12, 64, 64),
		box: new THREE.BoxGeometry(16, 16, 16, 16, 16, 16),
		torus: new THREE.TorusGeometry(12, 3, 32, 128),
		'torus knot': new THREE.TorusKnotGeometry(12, 3, 128, 32)
	};
	const geometryMesh = new THREE.Mesh(geometry[geo], new THREE.MeshBasicMaterial());
	const verticePosition = geometryMesh.geometry.attributes.position;

	for (let i = 0; i < verticePosition.count; i++) {
		const vertex = new THREE.Vector3();
		vertex.fromBufferAttribute(verticePosition, i);

		const original = new THREE.Group();
		original.position.copy(vertex.clone().applyMatrix4(geometryMesh.matrixWorld));

		const particle = new Particle(10, original, settings);
		particle.mesh.position.copy(vertex);
		particleGeo = [...particleGeo, particle];

		original.add(particle.mesh);

		particleGeoGroup.add(original);
	}

	scene.add(particleGeoGroup);

	function render() {
		composer.render();
	}

	function animate() {
		controls.update();

		particleGeoGroup.rotation.x += settings.rotationSpeed;
		particleGeoGroup.rotation.y += settings.rotationSpeed;
		particleGeoGroup.rotation.z += settings.rotationSpeed;

		for (let i = 0; i < particleGeo.length; i++) {
			particleGeo[i].avoidMouse(mouse);
			particleGeo[i].updatePosition();
		}

		render();
		requestAnimationFrame(animate);
	}

	animate();
}

export function destroyScene() {
	scene.remove(particleGeoGroup);
	particleGeo = [];
	particleGeoGroup.children = [];
}
