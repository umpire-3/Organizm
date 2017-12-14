document.body.onload=main;

function $(e){
    return document.getElementById(e);
}

const MovementSpeed = 1000;

let socket,
    // controls = {
    //     'Rotation of cube speed': 0.02,
    //     'Sphere\'s jump speed': 0.04,
    //     'Camera\'s velocity': 5.0,
    //     'Mouse look speed': 0.002
    // },
    scene, camera, renderer,
    thisPlayer, orbitControls,
    keyboard, updateStats,
    players = new PlayersContainer(),
    feed = {
        pieces: [],
        group: new THREE.Group(),
        remove(index) {
            this.group.remove(this.pieces[index].THREE_Object);
            this.pieces.splice(index, 1);
        }
    },
    controls = {
        [Keys.VK_W]: new THREE.Vector3(),
        [Keys.VK_A]: new THREE.Vector3(),
        [Keys.VK_S]: new THREE.Vector3(),
        [Keys.VK_D]: new THREE.Vector3()
    };

function initPlayers({ thisPlayerData, otherPlayersData }) {
    for (let [ id, playerData ] of otherPlayersData) {
        players.set(id, new Player(playerData));
    }

    thisPlayer = new Player({
        controls: orbitControls,
        ...thisPlayerData
    });
    players.set(socket.id, thisPlayer);

    camera.position.addVectors(
        thisPlayer.position,
        new THREE.Vector3(100, 0, 0)
    );
}
function initFeed(feedData) {
    for (let pos of feedData) {
        let piece = new Feed(pos);
        feed.pieces.push(piece)
        feed.group.add(piece.THREE_Object);
    }
}
function initSocket() {
    socket = new io();

    socket.on('init', ({
        playersData,
        feedData
    }) => {
        initPlayers(playersData);
        initFeed(feedData);
    });

    socket.on('player joined', ({ id, playerData }) => {
        console.log(`Player with id - ${id} was connected`);
        players.set(id, new Player(playerData));
    });

    socket.on('player left', id => {
        console.log(`Player with id - ${id} was disconnected`);
        players.delete(id);
    });

    socket.on('update', params => {
        for (let [ id, playerData ] of params) {
            let player = players.get(id);

            if (player) {
                player.update(playerData);
            }
        }
    });

    socket.on('feed', ({ id, piece, delta }) => {
        feed.remove(piece);
        let player = players.get(id);
        if (player) {
            player.radius += delta;
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
    keyboard = new Keyboard();

    keyboard.on('press', Keys.VK_W, () => {
        let direction = camera.getWorldDirection();
        direction.setLength(MovementSpeed);
        controls[Keys.VK_W] = direction;
    });
    keyboard.on('press', Keys.VK_S, () => {
        let direction = camera.getWorldDirection();
        direction.setLength(MovementSpeed).negate();
        controls[Keys.VK_S] = direction;
    });
    keyboard.on('press', Keys.VK_A, () => {
        let direction = camera.getWorldDirection();
        controls[Keys.VK_A] = new THREE.Vector3()
            .crossVectors(
                camera.up,
                direction
            ).setLength(MovementSpeed);
    });
    keyboard.on('press', Keys.VK_D, () => {
        let direction = camera.getWorldDirection();
        controls[Keys.VK_D] = new THREE.Vector3()
            .crossVectors(
                direction,
                camera.up
            ).setLength(MovementSpeed);
    });
}
function initMouseLook() {
    orbitControls = new THREE.OrbitControls(camera);

    orbitControls.enableZoom = true;

    orbitControls.update();
}
function initRenderTarget(){
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
}
function initScene(groups) {
    scene = new THREE.Scene();
    for (let group of groups) {
        scene.add(group);
    }

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
}

function MainLoop(){
    requestAnimationFrame(MainLoop);

    updateStats();
    orbitControls.update();
    keyboard.process();

    let direction = new THREE.Vector3();
    for (let key of keyboard.getPressedKeys()) {
        direction.add(controls[key]);
    }
    if (direction.x != 0 || direction.y != 0 || direction.z != 0) {
        socket.emit('update', direction);
    }

    renderer.render(scene, camera);
}

function main() {
    // let gui = new dat.GUI();
    // gui.add(controls, 'Rotation of cube speed', 0, 0.5);
    // gui.add(controls, 'Sphere\'s jump speed', 0, 0.5);
    // gui.add(controls, 'Camera\'s velocity', 0, 5);
    // gui.add(controls, 'Mouse look speed', 0, 0.05);

    updateStats = initStats('Stats');
    initKeyboard();
    initRenderTarget();
    initScene([
        players.group,
        feed.group
    ]);
    initMouseLook();

    initSocket();

    MainLoop();
}
