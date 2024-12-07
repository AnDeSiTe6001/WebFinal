let portal = null;

document.addEventListener('DOMContentLoaded', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    setupScene(scene);
    setupCameraControls(camera);
    animate(renderer, scene, camera);
    main();
});

function setupScene(scene) {
    // Create a ground plane
    const planeGeometry = new THREE.PlaneGeometry(500, 500);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2; // Rotate the plane to be horizontal
    scene.add(plane);
    // Create a cube
    const cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 5, 0);
    scene.add(cube);

    portal = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    portal.position.set(0, 0, -50);
    scene.add(portal);
}

function setupCameraControls(camera) {
    camera.position.set(0, 50, 100);

    // Event listener for keydown
    document.addEventListener('keydown', (event) => {
        const key = event.key;
        const step = 5; // Adjust this value to change the movement speed

        if (key === 'ArrowLeft') {
            camera.rotation.y += 0.1;
        } else if (key === 'ArrowRight') {
            camera.rotation.y -= 0.1;
        }
        if (key === 'ArrowUp') {
            camera.rotation.x += 0.1;
        }
        if (key === 'ArrowDown') {
            camera.rotation.x -= 0.1;
        }

        //movement wsad
        if (key === 'w') {
            camera.position.z -= step * Math.cos(camera.rotation.y);
            camera.position.x -= step * Math.sin(camera.rotation.y);
        } else if (key === 's') {
            camera.position.z += step * Math.cos(camera.rotation.y);
            camera.position.x += step * Math.sin(camera.rotation.y);
        } else if (key === 'a') {
            camera.position.z += step * Math.sin(camera.rotation.y);
            camera.position.x -= step * Math.cos(camera.rotation.y);
        } else if (key === 'd') {
            camera.position.z -= step * Math.sin(camera.rotation.y);
            camera.position.x += step * Math.cos(camera.rotation.y);
        }
    });
}

function animate(renderer, scene, camera) {
    // createOffAxisProjectionMatrix(camera, portal);

    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }
    render();
}

async function setupCamera() {
    const video = document.createElement('video');
    video.id = 'video';
    video.width = 640;
    video.height = 480;
    document.body.appendChild(video);

    const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function loadModel() {
    return await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );
}

async function detectFace(video, model) {
    const predictions = await model.estimateFaces({
        input: video,
        returnTensors: false,
        flipHorizontal: false
    });

    if (predictions.length > 0) {
        console.log(predictions);
    }

    requestAnimationFrame(() => detectFace(video, model));
}

function createOffAxisProjectionMatrix(camera, portal) {
    const portalHalfWidth = portal.scale.x / 2;
    const portalHalfHeight = portal.scale.y / 2;
    const portalPosition = new THREE.Vector3().copy(portal.position);
    portal.updateMatrixWorld();
    camera.updateMatrixWorld();
    camera.worldToLocal(portalPosition);

    let left = portalPosition.x - portalHalfWidth;
    let right = portalPosition.x + portalHalfWidth;
    let top = portalPosition.y + portalHalfHeight;
    let bottom = portalPosition.y - portalHalfHeight;

    const near = camera.near;
    const far = camera.far;
    const distance = Math.abs(portalPosition.z);
    const scale = near / distance;

    left *= scale;
    right *= scale;
    top *= scale;
    bottom *= scale;

    camera.projectionMatrix.makePerspective(left, right, top, bottom, near, far);
}

async function main() {
    const video = await setupCamera();
    video.play();

    const model = await loadModel();
    detectFace(video, model);
}