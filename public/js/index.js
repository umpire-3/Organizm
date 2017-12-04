document.body.onload=main;

function $(e){
    return document.getElementById(e);
}

var socket,
    controls = {
        'Rotation of cube speed': 0.02,
        'Sphere\'s jump speed': 0.04,
        'Camera\'s velocity': 5.0,
        'Mouse look speed': 0.002
    },
    scene, camera, renderer,
    player, orbitControls,
    keyboard, updateStats;

function initSocket() {
    socket = new io();

    socket.on('init', params => {
        player = new Player(orbitControls, params);
        scene.add(player.threeObject);
    });
    socket.on('update', params => {
        player.update(params);
    });
}
function initStats(containerId) {
    function statsInit(mode) {
        let stats = new Stats();
        stats.setMode(mode);
        with (stats.domElement.style) {
            position = 'relative';
            /*left = "0px";
             top = "0px";*/
        }
        $(containerId).appendChild(stats.domElement);
        return stats;
    }

    let fps = statsInit(0),
        ms = statsInit(1),
        mb = statsInit(2);
    function statsUpdate() {
        fps.update();
        ms.update();
        mb.update();
    }

    return statsUpdate;
}
function initKeyboard() {
    let keyboard = new Keyboard();

    keyboard.on('press', Keys.VK_W, () => {
        let direction = player.getCamDirection();
        socket.emit('move', direction.setLength(10));
    });
    keyboard.on('press', Keys.VK_S, () => {
        let direction = player.getCamDirection();
        socket.emit('move', direction.setLength(10).negate());
    });
    keyboard.on('press', Keys.VK_A, () => {
        let direction = player.getCamDirection();
        socket.emit('move', new THREE.Vector3()
            .crossVectors(
                camera.up,
                direction
            ).setLength(10)
        );
    });
    keyboard.on('press', Keys.VK_D, () => {
        let direction = player.getCamDirection();
        socket.emit('move', new THREE.Vector3()
            .crossVectors(
                direction,
                camera.up
            ).setLength(10)
        );
    });

    // OnKeyDown
    keyboard.on('down', Keys.VK_SPACE, () => {
        socket.emit('gravity')
    });
    keyboard.on('down', Keys.VK_Z, () => {
        socket.emit('disable')
    });
    keyboard.on('down', Keys.VK_L, () => {
        socket.emit('log')
    });

    return keyboard;
}
function initMouseLook() {
    orbitControls = new THREE.OrbitControls(camera);

    orbitControls.enableZoom = true;

    orbitControls.update();
}
function initRenderTarget(){
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
}
function initScene() {

    let spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-200, 200, -200);
    spotLight.castShadow = true;
    scene.add(spotLight);

    let light = new THREE.AmbientLight(0x0e0e0e);
    scene.add(light);

    let axes = new THREE.AxisHelper(20);
    scene.add(axes);

    let plGeo = new THREE.PlaneGeometry(400, 400),
        plMat = new THREE.MeshBasicMaterial({color: 0x0000b0, wireframe: true}),
        plane;
    let pos = [
        [ -200,    0,    0  ],
        [  200,    0,    0  ],
        [    0, -200,    0  ],
        [    0,  200,    0  ],
        [    0,    0, -200  ],
        [    0,    0,  200  ]
    ];
    let rot = [
        [     0    , Math.PI/2,    0    ],
        [     0    , Math.PI/2,    0    ],
        [ Math.PI/2,     0    ,    0    ],
        [ Math.PI/2,     0    ,    0    ],
        [     0    ,     0    , Math.PI ],
        [     0    ,     0    , Math.PI ]
    ];

    for(let i = 0; i < 6; i++){
        plane = new THREE.Mesh(plGeo, plMat);
        plane.position.set(pos[i][0], pos[i][1], pos[i][2]);
        plane.rotateX(rot[i][0]);
        plane.rotateY(rot[i][1]);
        plane.rotateZ(rot[i][2]);
        scene.add(plane);
    }


    camera.position.set(-200, 200, 200);
    camera.lookAt(scene.position);
}

function MainLoop(){
    requestAnimationFrame(MainLoop);

    updateStats();
    orbitControls.update();
    keyboard.process();

    renderer.render(scene, camera);
}

function main() {
    let gui = new dat.GUI();
    gui.add(controls, 'Rotation of cube speed', 0, 0.5);
    gui.add(controls, 'Sphere\'s jump speed', 0, 0.5);
    gui.add(controls, 'Camera\'s velocity', 0, 5);
    gui.add(controls, 'Mouse look speed', 0, 0.05);


    initSocket();
    updateStats = initStats('Stats');
    keyboard = initKeyboard();
    initRenderTarget();
    initScene();

    initMouseLook();

    MainLoop();
}
