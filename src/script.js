import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Pane } from "tweakpane";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { toggleFullscreen } from "./utils";
import gsap from 'gsap'

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const textureLoader = new THREE.TextureLoader();

const corLâmpadaQuartoLigada = 0xff9000;
const corLâmpadaQuartoDesligada = 0x000000;

let loadingStatus = 3;

const PARAMS = {
    visible: false,
    checkVisible: () => {
        if (pointLightLampadaTeto.visible) {
            lampadaQuartoMaterial.color.setHex(corLâmpadaQuartoLigada);
        } else {
            lampadaQuartoMaterial.color.setHex(corLâmpadaQuartoDesligada);
        }
        if (PARAMS.visible) {
            directionalLightHelper.visible = true == directionalLight.visible;
            pointLightHelper.visible = true == pointLightLampadaTeto.visible;
            ledGabineteRectAreaLightHelper.visible =
                true == ledGabineteRectAreaLight.visible;
            ledMonitorRectAreaLightHelper.visible =
                true == ledMonitorRectAreaLight.visible;
            ledPowerPCRectAreaLightHelper.visible = true == ledPowerPCRectAreaLight.visible;
        }
    },
    visibleLightHelper: () => {
        if (PARAMS.visible) {
            directionalLightHelper.visible = true == directionalLight.visible;
            pointLightHelper.visible = true == pointLightLampadaTeto.visible;
            spotLightHelper.visible = true == spotLight.visible;
            ledGabineteRectAreaLightHelper.visible =
                true == ledGabineteRectAreaLight.visible;
            ledMonitorRectAreaLightHelper.visible =
                true == ledMonitorRectAreaLight.visible;
            ledPowerPCRectAreaLightHelper.visible = true == ledPowerPCRectAreaLight.visible;
        } else {
            directionalLightHelper.visible = false;
            pointLightHelper.visible = false;
            ledGabineteRectAreaLightHelper.visible = false;
            ledMonitorRectAreaLightHelper.visible = false;
            ledPowerPCRectAreaLightHelper.visible = false;
        }
    },
    download: () => {
        const link = document.createElement("a");
        link.download = "download.png";
        link.href = document.getElementById("myCanvas").toDataURL("image/png");
        link.click();
    },
};

const pane = new Pane();

pane
    .addButton({
        title: "Download",
    })
    .on("click", PARAMS.download);

pane
    .addButton({
        title: "Fullscreen",
    })
    .on("click", toggleFullscreen);

// Luz Ambiente
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
pane.addInput(ambientLight, "intensity", {
    label: "amb. level",
    min: 0,
    max: 1,
    step: 0.001,
});

pane
    .addInput(PARAMS, "visible", {
        label: "show helpers",
    })
    .on("change", (ev) => {
        PARAMS.visibleLightHelper();
    });

// LUZ DIRECIONAL (secundária para iluminar o ambiente - SOL)
const directionalLight = new THREE.DirectionalLight(0xffddca, 0.3);
directionalLight.position.set(5, 2.5, 0.5);
scene.add(directionalLight);
directionalLight.visible = true;
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1080;
directionalLight.shadow.mapSize.height = 1080;
directionalLight.shadow.camera.near = 4;
directionalLight.shadow.camera.far = 11;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.left = -2;

const directionalLightCameraHelper = new THREE.CameraHelper(
    directionalLight.shadow.camera
);
scene.add(directionalLightCameraHelper);
directionalLightCameraHelper.visible = false;

pane
    .addInput(directionalLight, "visible", {
        label: "Luz do Sol",
    })
    .on("change", (ev) => {
        PARAMS.checkVisible();
    });

// LAMPADA DO TETO
const pointLightLampadaTeto = new THREE.PointLight(0xff9000, 0.5);
pointLightLampadaTeto.position.set(-2, 3.5, 2);
scene.add(pointLightLampadaTeto);
pointLightLampadaTeto.visible = false;
pointLightLampadaTeto.castShadow = true;
pointLightLampadaTeto.shadow.mapSize.width = 1024;
pointLightLampadaTeto.shadow.mapSize.height = 1024;

pointLightLampadaTeto.shadow.camera.near = 0.1;
pointLightLampadaTeto.shadow.camera.far = 8;
pointLightLampadaTeto.shadow.radius = 5;

// Geometria da esfera da lâmpada do teto
const lampadaGeometry = new THREE.SphereGeometry(0.05, 16, 16);
const lampadaQuartoMaterial = new THREE.MeshPhongMaterial({ color: corLâmpadaQuartoDesligada });

const lampadaQuartoMesh = new THREE.Mesh(
    lampadaGeometry,
    lampadaQuartoMaterial
);

lampadaQuartoMesh.position.copy(pointLightLampadaTeto.position);
scene.add(lampadaQuartoMesh);

const pointLightCameraHelper = new THREE.CameraHelper(
    pointLightLampadaTeto.shadow.camera
);
scene.add(pointLightCameraHelper);
pointLightCameraHelper.visible = false;

pane
    .addInput(pointLightLampadaTeto, "visible", {
        label: "Lâmpada do teto",
    })
    .on("change", (ev) => {
        PARAMS.checkVisible();
    });

// Led gabinete
const ledGabineteRectAreaLight = new THREE.RectAreaLight(0x4e00ff, 4, 1, 1);
for (let i = 0; i < 3; i++) {
    ledGabineteRectAreaLight.position.set(1.5, 0.7, 0);
    ledGabineteRectAreaLight.lookAt(new THREE.Vector3(1.5, 0.7, 0));
    scene.add(ledGabineteRectAreaLight);
}

ledGabineteRectAreaLight.visible = false;


// Led power do PC
const ledPowerPCRectAreaLight = new THREE.RectAreaLight(0xff0000, 50, 0.1, 0.1);
ledPowerPCRectAreaLight.position.set(1.7, 1.3, 0.76);
ledPowerPCRectAreaLight.lookAt(new THREE.Vector3(1.7, 1.3, 2));

scene.add(ledPowerPCRectAreaLight);

ledPowerPCRectAreaLight.visible = false;

// Geometria do botão de power do PC
const powerPCGeometry = new THREE.BoxGeometry(0.09, 0.09, 0.01);
const powerPCMaterial = new THREE.MeshPhongMaterial({ color: 0x0f0000 });

const powerPCMesh = new THREE.Mesh(powerPCGeometry, powerPCMaterial);

powerPCMesh.position.copy(ledPowerPCRectAreaLight.position);
scene.add(powerPCMesh);


// Led do monitor
const ledMonitorRectAreaLight = new THREE.RectAreaLight(0xfef0ff, 5, 1, 1);
for (let i = 0; i < 3; i++) {
    ledMonitorRectAreaLight.position.set(-0.5, 0.8, -0.449);
    ledMonitorRectAreaLight.lookAt(new THREE.Vector3(-0.5, 0.8, 1));
    scene.add(ledMonitorRectAreaLight);
}

ledMonitorRectAreaLight.visible = false;

/**
 * Helpers
 */

const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
    0.2
);
scene.add(directionalLightHelper);
directionalLightHelper.visible = false;

const pointLightHelper = new THREE.PointLightHelper(pointLightLampadaTeto, 0.2);
scene.add(pointLightHelper);
pointLightHelper.visible = false;

const ledGabineteRectAreaLightHelper = new RectAreaLightHelper(
    ledGabineteRectAreaLight
);
scene.add(ledGabineteRectAreaLightHelper);
ledGabineteRectAreaLightHelper.visible = false;

const ledPowerPCRectAreaLightHelper = new RectAreaLightHelper(
    ledPowerPCRectAreaLight
);
scene.add(ledPowerPCRectAreaLightHelper);
ledPowerPCRectAreaLightHelper.visible = false;

const ledMonitorRectAreaLightHelper = new RectAreaLightHelper(
    ledMonitorRectAreaLight
);
scene.add(ledMonitorRectAreaLightHelper);
ledMonitorRectAreaLightHelper.visible = false;
/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

// ---- Objects ---- //

// Chão
const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
ground.position.z = 3.5;
ground.position.x = -2.5;
ground.receiveShadow = true;
scene.add(ground);

// Textura do chão

const groundTexture = textureLoader.load("textures/chao.jpg");
groundTexture.minFilter = THREE.LinearFilter;
const groundScreenmaterial = new THREE.MeshBasicMaterial({
    map: groundTexture,
});
ground.material = groundScreenmaterial;

// Paredes
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeeee });
const wallHeight = 4;

const wall1Geometry = new THREE.BoxGeometry(10, wallHeight, 0.1);
const wall1 = new THREE.Mesh(wall1Geometry, wallMaterial);
wall1.position.z = -1.5;
wall1.position.x = -2.5;
wall1.receiveShadow = true;
scene.add(wall1);

const wall2Geometry = new THREE.BoxGeometry(10, wallHeight, 0.1);
const wall2 = new THREE.Mesh(wall2Geometry, wallMaterial);
wall2.position.z = 8.5;
wall2.position.x = -2.5;
wall2.receiveShadow = true;
scene.add(wall2);

const wall3Geometry = new THREE.BoxGeometry(0.1, wallHeight, 10);
const wall3 = new THREE.Mesh(wall3Geometry, wallMaterial);
wall3.position.x = -7.5;
wall3.position.z = 3.5;
wall3.receiveShadow = true;
scene.add(wall3);

const wall4Geometry = new THREE.BoxGeometry(0.1, wallHeight, 10);
const wall4 = new THREE.Mesh(wall4Geometry, wallMaterial);
wall4.position.x = 2.5;
wall4.position.z = 3.5;
wall4.receiveShadow = true;
scene.add(wall4);

// Mesa
const mesaTopGeometry = new THREE.BoxGeometry(4, 0.2, 2);
const mesaTop = new THREE.Mesh(mesaTopGeometry, material);
mesaTop.position.y = -0.1;
scene.add(mesaTop);

const mesaLegGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
const mesaLeg1 = new THREE.Mesh(mesaLegGeometry, material);
mesaLeg1.position.set(-1.8, -1.1, -0.8);
scene.add(mesaLeg1);

const mesaLeg2 = new THREE.Mesh(mesaLegGeometry, material);
mesaLeg2.position.set(1.8, -1.1, -0.8);
scene.add(mesaLeg2);

const mesaLeg3 = new THREE.Mesh(mesaLegGeometry, material);
mesaLeg3.position.set(1.8, -1.1, 0.8);
scene.add(mesaLeg3);

const mesaLeg4 = new THREE.Mesh(mesaLegGeometry, material);
mesaLeg4.position.set(-1.8, -1.1, 0.8);
scene.add(mesaLeg4);

// Textura da mesa e das pernas da mesa
const mesaTexture = textureLoader.load("textures/mesa.jpg");
mesaTexture.minFilter = THREE.LinearFilter;
const mesaScreenmaterial = new THREE.MeshBasicMaterial({
    map: mesaTexture,
});
mesaTop.material = mesaScreenmaterial;
mesaLeg1.material = mesaScreenmaterial;
mesaLeg2.material = mesaScreenmaterial;
mesaLeg3.material = mesaScreenmaterial;
mesaLeg4.material = mesaScreenmaterial;

// Monitor
const monitorGeometry = new THREE.BoxGeometry(1.5, 1, 0.1);
const monitor = new THREE.Mesh(monitorGeometry, material);
monitor.position.set(-0.5, 0.8, -0.5);
scene.add(monitor);

const monitorBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

const monitorBaseGeometry = new THREE.BoxGeometry(0.05, 0.6, 0.1);
const monitorBase = new THREE.Mesh(monitorBaseGeometry, monitorBaseMaterial);
monitorBase.position.copy(monitor.position);
monitorBase.position.y = 0;
scene.add(monitorBase);

const retangleMonitorBaseGeometry = new THREE.BoxGeometry(0.3, 0.7, 0.1);
const retangleMonitorBase = new THREE.Mesh(
    retangleMonitorBaseGeometry,
    monitorBaseMaterial
);
retangleMonitorBase.position.copy(monitorBase.position);
retangleMonitorBase.position.y = 0;
retangleMonitorBase.position.x = -0.5;
retangleMonitorBase.rotation.z = Math.PI / 2;
scene.add(retangleMonitorBase);

// Computador
const gabineteGeometry = new THREE.BoxGeometry(0.6, 1.5, 1.5);
const materialLateral = new THREE.MeshBasicMaterial({ color: 0x000000 });
const gabinete = new THREE.Mesh(gabineteGeometry, materialLateral);
gabinete.position.set(1.5, 0.7, 0);
scene.add(gabinete);

// Add shadow to models
mesaTop.castShadow = true;
mesaLeg1.castShadow = true;
mesaLeg2.castShadow = true;
mesaLeg3.castShadow = true;
mesaLeg4.castShadow = true;
monitor.castShadow = true;
gabinete.castShadow = true;

mesaTop.receiveShadow = true;
mesaLeg1.receiveShadow = true;
mesaLeg2.receiveShadow = true;
mesaLeg3.receiveShadow = true;
mesaLeg4.receiveShadow = true;
monitor.receiveShadow = true;
gabinete.receiveShadow = true;

// Tela do monitor
const monitorTexture = textureLoader.load("textures/monitor_screen.png");
monitorTexture.minFilter = THREE.LinearFilter;

monitor.material = new THREE.MeshBasicMaterial({
    color: 0x000000
});

// Cama
const camaGeometry = new THREE.BoxGeometry(4, 1, 6);
const camaMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const cama = new THREE.Mesh(camaGeometry, camaMaterial);
cama.position.set(-5.4, -1.2, 1.5);
scene.add(cama);
cama.receiveShadow = true;
cama.castShadow = true;

const travesseioGeometry = new THREE.BoxGeometry(1, 0.3, 0.8);
const travesseioMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

const travesseio1 = new THREE.Mesh(travesseioGeometry, travesseioMaterial);
travesseio1.position.copy(cama.position);
travesseio1.position.y = -0.6;
travesseio1.position.x = -4.5;
travesseio1.position.z = -1;
scene.add(travesseio1);

const travesseio2 = new THREE.Mesh(travesseioGeometry, travesseioMaterial);
travesseio2.position.copy(cama.position);
travesseio2.position.y = -0.6;
travesseio2.position.x = -6.5;
travesseio2.position.z = -1;
scene.add(travesseio2);

// Textura da cama
const camaTextire = textureLoader.load("textures/cama.jpg");
camaTextire.minFilter = THREE.LinearFilter;
const camaScreenmaterial = new THREE.MeshBasicMaterial({
    map: camaTextire,
});

cama.material = camaScreenmaterial;

// Textura traveseiros
const traveseiroTexture = textureLoader.load("textures/traveseiro.jpg");
traveseiroTexture.minFilter = THREE.LinearFilter;
const traveseiroScreenmaterial = new THREE.MeshBasicMaterial({
    map: traveseiroTexture,
});

travesseio1.material = traveseiroScreenmaterial;
travesseio2.material = traveseiroScreenmaterial;

// Objetos importados
const gltfLoader = new GLTFLoader();

// Teclado
gltfLoader.load(
    "/models/Keyboard/scene.gltf",
    (gltf) => {
        console.log("success");
        console.log(gltf);
        const keyboard = gltf.scene.children[0];
        keyboard.scale.set(1, 1, 1);
        keyboard.position.x = -0.8;
        scene.add(keyboard);

        loadingStatus -= 1;

        if (loadingStatus === 0) {
            document.getElementById("loading").style.display = "none";
        }
    },
    (progress) => {
        console.log("progress");
        console.log(progress);
    },
    (error) => {
        console.log("error");
        console.log(error);
    }
);

// Mouse
gltfLoader.load(
    "/models/Mouse/scene.gltf",
    (gltf) => {
        console.log("success");
        console.log(gltf);
        const mouse = gltf.scene.children[0];
        mouse.scale.set(0.3, 0.3, 0.3);
        mouse.position.x = 0.7;
        mouse.position.y = 0.02;
        scene.add(mouse);

        loadingStatus -= 1;

        if (loadingStatus === 0) {
            document.getElementById("loading").style.display = "none";
        }
    },
    (progress) => {
        console.log("progress");
        console.log(progress);
    },
    (error) => {
        console.log("error");
        console.log(error);
    }
);

gltfLoader.load(
    "/models/Cadeira/scene.gltf",
    (gltf) => {
        console.log("success");
        console.log(gltf);
        const cadeira = gltf.scene.children[0];
        cadeira.scale.set(1.5, 1.5, 1.5);
        cadeira.position.x = -0.2;
        cadeira.position.y = -7.45;
        cadeira.position.z = 2.3;
        cadeira.rotation.z = Math.PI + 0.2;
        scene.add(cadeira);

        loadingStatus -= 1;

        if (loadingStatus === 0) {
            document.getElementById("loading").style.display = "none";
        }
    },
    (progress) => {
        console.log("progress");
        console.log(progress);
    },
    (error) => {
        console.log("error");
        console.log(error);
    }
);

// Lógica para ligar e desligar o PC e Monitor
pane
    .addInput(ledGabineteRectAreaLight, "visible", {
        label: "Ligar/Desligar PC",
    })
    .on("change", (ev) => {
        // Liga o led do monitor
        // Liga o led do pc
        // liga a luz do botão power do pc
        if (ev.value) {
            ligarPC()
        } else {
            desligarPC()
        }
    });

function ligarPC() {
    ledPowerPCRectAreaLight.visible = true;
    ledMonitorRectAreaLight.visible = true;
    ledGabineteRectAreaLight.visible = true;
    powerPCMaterial.color.setHex(0xff0000);
    monitor.material = new THREE.MeshBasicMaterial({
        map: monitorTexture,
    });;
}


function desligarPC() {
    ledPowerPCRectAreaLight.visible = false;
    ledMonitorRectAreaLight.visible = false;
    ledGabineteRectAreaLight.visible = false;
    powerPCMaterial.color.setHex(0x0f0000);
    monitor.material = new THREE.MeshBasicMaterial({
        color: 0x000000
    });;
}



// --- OBJETOS COM ANIMAÇÃO --- //

// Livro
const bookTexture = textureLoader.load("textures/manifesto.jpg");
bookTexture.minFilter = THREE.LinearFilter;
const bookMeshMaterial = new THREE.MeshStandardMaterial({ map: bookTexture });

const bookGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.1);
const book = new THREE.Mesh(bookGeometry, bookMeshMaterial);
book.position.copy(mesaTop.position);
book.position.y = 0.25;
book.position.x = -1.5;
book.position.z = -0.9;
book.castShadow = true;
book.receiveShadow = true;
scene.add(book);


pane
    .addInput(pointLightLampadaTeto, "visible", {
        label: "Iniciar festa vermelha",
    })
    .on("change", (ev) => {
        if (ev.value) {
            ligarPC()
            iniciarFesta();
        } else {
            pararFesta();
        }
    });

// Animação do livro simulando ele voando e voltabdo para a mesa
const bookAnimation = gsap.timeline({ yoyo: true, repeat: -1 });
let lampadaPiscandoInterval = null;
function iniciarFesta() {
    reproduzirHino()
    bookAnimation.to(book.position, {
        duration: 1,
        y: 1,
        ease: "power1.inOut",
    });
    bookAnimation.to(book.position, {
        duration: 3,
        z: 2,
        ease: "power1.inOut",
    });

    // Fazer ele rodar em seu eixo y
    bookAnimation.to(book.rotation, {
        duration: 1,
        y: Math.PI * 2,
        ease: "power1.inOut",
    })

    if (!bookAnimation.isActive()) {
        bookAnimation.restart();
    }

    // Mudando textura das paredes e do monitor
    const sovieticTexture = textureLoader.load("textures/parede_uniao.jpg");
    const sovieticTextureMaterial = new THREE.MeshBasicMaterial({
        map: sovieticTexture,
    })
    sovieticTextureMaterial.minFilter = THREE.LinearFilter;

    const monitorSoviectTexture = textureLoader.load("textures/wallpaper_uniao.jpg");
    const monitorTextureMaterial = new THREE.MeshBasicMaterial({
        map: monitorSoviectTexture,
    })
    monitorTextureMaterial.minFilter = THREE.LinearFilter;

    monitor.material = monitorTextureMaterial

    wall1.material = sovieticTextureMaterial
    wall2.material = sovieticTextureMaterial
    wall3.material = sovieticTextureMaterial
    wall4.material = sovieticTextureMaterial

    lampadaPiscandoInterval = setInterval(mudarIntensidadeDaLampadaDoQuarto, 1000);

}

function mudarIntensidadeDaLampadaDoQuarto() {
    pointLightLampadaTeto.color.setHex(0xff0000);
    if (pointLightLampadaTeto.intensity === 0) {
        pointLightLampadaTeto.intensity = 0.5;
    } else {
        pointLightLampadaTeto.intensity = 0;
    }
}

function pararFesta() {
    clearInterval(lampadaPiscandoInterval);
    pauserHino()
    pointLightLampadaTeto.intensity = 1;
    pointLightLampadaTeto.color.setHex(0xff9000);
    book.position.x = -1.5;
    book.position.y = 0.25;
    book.position.z = -0.9;
    book.rotation.y = 0;

    if (bookAnimation.isActive()) {
        bookAnimation.clear();
    }

    // Mudando textura das paredes e do monitor
    wall1.material = wallMaterial
    wall2.material = wallMaterial
    wall3.material = wallMaterial
    wall4.material = wallMaterial

    desligarPC()
}

// Tocar hino da união soviética
async function reproduzirHino() {
    const audio = await document.getElementsByTagName('audio')[0]
    audio.volume = 1

    audio.play()
}

// Pausar hino da união soviética
async function pauserHino() {
    const audio = await document.getElementsByTagName('audio')[0]
    audio.pause()
}

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener("resize", () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
);
camera.position.x = 4;
camera.position.y = 4;
camera.position.z = 9;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    preserveDrawingBuffer: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// Enable Shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
