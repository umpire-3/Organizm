document.body.onload=main;

function $(e){
    return document.getElementById(e);
}

var connection,
    controls = {
        'Rotation of cube speed': 0.02,
        'Sphere\'s jump speed': 0.04,
        'Camera\'s velocity': 5.0,
        'Mouse look speed': 0.002
    },
    scene, camera, renderer,
    balls, ballsAmount,
    processKeyboard, updateStats;

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
    let keys = new Array(256).fill(false);

    function processKeyboard() {
        if (keys[87]) { // w
            camera.position.addScaledVector(camera.getWorldDirection(), controls['Camera\'s velocity']);
        }
        if (keys[65]) { // a
            camera.position.addScaledVector(new THREE.Vector3().crossVectors(camera.up, camera.getWorldDirection()), controls['Camera\'s velocity']);
        }
        if (keys[83]) { // s
            camera.position.addScaledVector(camera.getWorldDirection().negate(), controls['Camera\'s velocity']);
        }
        if (keys[68]) { // d
            camera.position.addScaledVector(new THREE.Vector3().crossVectors(camera.getWorldDirection(), camera.up), controls['Camera\'s velocity']);
        }
    }

    document.addEventListener('keydown', e => {
        //console.log(e.keyCode);

        if (e.keyCode == 32) { // space
            connection.send('gravity');
        }
        if (e.keyCode == 90) { // z
            connection.send('disable');
        }
        if (e.keyCode == 76) { // l
            connection.send('log');
        }

        keys[e.keyCode] = true;
        return false;
    });

    document.addEventListener('keyup', e => {
        keys[e.keyCode] = false;
        return false;
    });

    return processKeyboard;
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
    processKeyboard();

    renderer.render(scene, camera);
}

function main() {
    connection = new MassageHandler(
        new WebSocket('ws://' + document.location.host + document.location.pathname)
    );
    
    connection.use('callback', data => {
        console.log(data);
    });
    connection.use('init', data => {
        console.log('length = ' + data.length);
        ballsAmount = data.length;
        balls = new Array();
        for(let i = 0; i < ballsAmount; i++){
            balls[i] = new Ball(parseFloat(data[i]), new THREE.Vector3(), parseInt(Math.random()*16777215));
            balls[i].add();
        }
    });
    connection.use('update', data => {
        for (let [i, ball] of balls.entries()) {
            ball.Mesh.position.set(data[i][0], data[i][1], data[i][2]);
        }
    });

    let gui = new dat.GUI();
    gui.add(controls, 'Rotation of cube speed', 0, 0.5);
    gui.add(controls, 'Sphere\'s jump speed', 0, 0.5);
    gui.add(controls, 'Camera\'s velocity', 0, 5);
    gui.add(controls, 'Mouse look speed', 0, 0.05);

    updateStats = initStats('Stats');
    processKeyboard = initKeyboard();
    initMouseLook();
    initRenderTarget();
    initScene();

    MainLoop();

    return 0;
}
