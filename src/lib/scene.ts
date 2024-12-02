import * as THREE from 'three';
import { OrbitControls } from 'three/addons';
import { RenderPass } from 'three/addons';
import { EffectComposer } from 'three/addons';
import { UnrealBloomPass } from 'three/addons';

interface Settings {
	affectingDistance: number;
	avoidanceFactor: number;
	lerpSpeed: number;
	rotationSpeed: number;
}

class Particle {
	mesh: THREE.Mesh;
	original: THREE.Group;
	lerp: number;
	avoiding: boolean;
	newPosition: THREE.Vector3;
	settings: Settings;

	constructor(original: THREE.Group, settings: Settings) {
		const colors = [0x7aa2f7, 0x7dcfff, 0xbb9af7, 0x9ece6a, 0xff9e64, 0x73daca];

		this.mesh = new THREE.Mesh(
			new THREE.BoxGeometry(0.2, 0.2, 0.8),
			new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random() * colors.length)] })
		);
		this.original = original;
		this.lerp = 0.0;
		this.avoiding = false;
		this.newPosition = new THREE.Vector3();
		this.settings = settings;
	}

	avoidMouse(mouse: THREE.Vector2): void {
		const originalPosition = new THREE.Vector3();
		this.original.getWorldPosition(originalPosition);
		const particlePosition = new THREE.Vector3();
		this.mesh.getWorldPosition(particlePosition);

		const distance = mouse.distanceTo(originalPosition);

		if (distance < this.settings.affectingDistance) {
			const dir = new THREE.Vector3(
				particlePosition.x + originalPosition.x - mouse.x,
				particlePosition.y + originalPosition.y - mouse.y,
				particlePosition.z + originalPosition.z
			);

			dir.normalize();

			this.newPosition.x = dir.x * this.settings.avoidanceFactor;
			this.newPosition.y = dir.y * this.settings.avoidanceFactor;
			this.newPosition.z = dir.z * this.settings.avoidanceFactor;

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
			this.lerp += this.settings.lerpSpeed;
		}
	}
}

let scene: THREE.Scene;
let controls: OrbitControls;
let composer: EffectComposer;
let mouse = new THREE.Vector2();
let particleGeo: Particle[] = [];
let particleGeoGroup: THREE.Group = new THREE.Group();

export function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x0a0a0f);

	const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
		60,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.set(0, 0, 60);

	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.enableRotate = false;

	composer = new EffectComposer(renderer);
	const renderPass = new RenderPass(scene, camera);
	composer.addPass(renderPass);
	const bloomPass = new UnrealBloomPass(
		new THREE.Vector2(window.innerWidth, window.innerHeight),
		4,
		0.5,
		0.0
	);
	composer.addPass(bloomPass);

	document.addEventListener('mousemove', (event) => {
		event.preventDefault();

		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		const vec = new THREE.Vector3(mouse.x, mouse.y, 0);

		vec.unproject(camera);
		const vec2 = vec.sub(camera.position).normalize();
		const distance = -camera.position.z / vec2.z;
		mouse = mouse.copy(camera.position).add(vec2.multiplyScalar(distance));
	});
}

export function createScene(geo: string, settings: Settings): void {
	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(1, 1, 2);
	scene.add(directionalLight);

	type Geometry = { [key: string]: THREE.BufferGeometry };

	const geometry: Geometry = {
		plane: new THREE.PlaneGeometry(20, 20, 40, 40),
		sphere: new THREE.SphereGeometry(12, 40, 40),
		box: new THREE.BoxGeometry(16, 16, 16, 16, 16, 16),
		torus: new THREE.TorusGeometry(12, 3, 16, 96),
		'torus knot': new THREE.TorusKnotGeometry(12, 3, 96, 16)
	};
	const geometryMesh = new THREE.Mesh(geometry[geo], new THREE.MeshBasicMaterial());
	const verticePosition = geometryMesh.geometry.attributes.position;

	for (let i = 0; i < verticePosition.count; i++) {
		const vertex = new THREE.Vector3();
		vertex.fromBufferAttribute(verticePosition, i);

		const original = new THREE.Group();
		original.position.copy(vertex.clone().applyMatrix4(geometryMesh.matrixWorld));

		const particle = new Particle(original, settings);
		particle.mesh.position.copy(vertex);
		particleGeo = [...particleGeo, particle];

		original.add(particle.mesh);

		particleGeoGroup.add(original);
	}

	geometryMesh.geometry.dispose();

	scene.add(particleGeoGroup);

	function render() {
		composer.render();
	}

	function animate() {
		controls.update();

		particleGeoGroup.rotation.x += settings.rotationSpeed * 3;
		particleGeoGroup.rotation.y += settings.rotationSpeed * 2;
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
	scene.remove(scene.children[0]);
	scene.remove(scene.children[0]);
	particleGeo = [];
	particleGeoGroup = new THREE.Group();
	console.log(scene);
}
