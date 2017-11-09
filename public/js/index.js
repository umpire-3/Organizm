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
    balls, ballsAmount,
    keyboard, updateStats;

function initSocket() {
    socket = new io();
    
    socket.on('callback', data => {
        console.log(data);
    });
    socket.on('init', data => {
        console.log(data, '\nlength = ' + data.length);
        ballsAmount = data.length;
        balls = new Array();
        for(let i = 0; i < ballsAmount; i++){
            balls[i] = new Ball(parseFloat(data[i]), new THREE.Vector3(), parseInt(Math.random()*16777215));
            balls[i].add();
        }
    });
    socket.on('update', data => {
        for (let [i, ball] of balls.entries()) {
            ball.Mesh.position.set(data[i][0], data[i][1], data[i][2]);
        }
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

    // WhileKeyPressed
    keyboard.on('press', 87, () => { // w
        camera.position.addScaledVector(camera.getWorldDirection(), controls['Camera\'s velocity']);
    });
    keyboard.on('press', 65, () => { // a
        camera.position.addScaledVector(new THREE.Vector3().crossVectors(camera.up, camera.getWorldDirection()), controls['Camera\'s velocity']);
    });
    keyboard.on('press', 83, () => { // s
        camera.position.addScaledVector(camera.getWorldDirection().negate(), controls['Camera\'s velocity']);
    });
    keyboard.on('press', 68, () => { // d
        camera.position.addScaledVector(new THREE.Vector3().crossVectors(camera.getWorldDirection(), camera.up), controls['Camera\'s velocity']);
    });

    // OnKeyDown
    keyboard.on('down', 32, () => { // space
        socket.emit('gravity')
    });
    keyboard.on('down', 90, () => { // z
        socket.emit('disable')
    });
    keyboard.on('down', 76, () => { // l
        socket.emit('log')
    });

    return keyboard;
}
function initMouseLook() {
    let startX, startY,
        rot = new THREE.Matrix4();

    function dragStop() {
        document.onmousemove = null;
        document.onmouseup = null;
        return false;
    }

    function mouselook(e) {
        dx = (startX - e.clientX) * controls['Mouse look speed'];
        dy = (startY - e.clientY) * controls['Mouse look speed'];
        startX = e.clientX;
        startY = e.clientY;
        rot.makeRotationAxis(camera.up, dx);
        camera.lookAt(new THREE.Vector3().addVectors(camera.position, camera.getWorldDirection().transformDirection(rot)));
        rot.makeRotationAxis(new THREE.Vector3().crossVectors(camera.getWorldDirection(), camera.up), dy);
        camera.lookAt(new THREE.Vector3().addVectors(camera.position, camera.getWorldDirection().transformDirection(rot)));
        return false;

    }

    function dragStart(e) {
        startX = e.clientX;
        startY = e.clientY;
        document.onmousemove = mouselook;
        document.onmouseup = dragStop;
        return false;
    }

    document.onmousedown = dragStart;
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
    console.log(pos);
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
    initMouseLook();
    initRenderTarget();
    initScene();

    MainLoop();

    return 0;
}
