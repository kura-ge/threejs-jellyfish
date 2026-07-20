import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class ThreeJSContainer {
    private scene!: THREE.Scene;
    private light!: THREE.Light;
    private points1!: THREE.Points;
    private points2!: THREE.Points;

    constructor() {

    }

    // 画面部分の作成(表示する枠ごとに)*
    public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new THREE.Color(0x4169E1));//背景色を変える　深海っぽく深い青にする
        renderer.shadowMap.enabled = true; //シャドウマップを有効にする

        //カメラの設定
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        const orbitControls = new OrbitControls(camera, renderer.domElement);

        this.createScene();
        // 毎フレームのupdateを呼んで，render
        // reqestAnimationFrame により次フレームを呼ぶ
        const render: FrameRequestCallback = (_time) => {
            orbitControls.update();


            renderer.render(this.scene, camera);
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);

        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    }

    // シーンの作成(全体で1回)
    private createScene = () => {
        this.scene = new THREE.Scene();
        const kurage = new THREE.Group();

        //クラゲの傘
        const points: THREE.Vector2[] = [];

        const pointNum = 30;

        for (let i = 0; i < pointNum; i++) {

            const theta = Math.PI / 2 * i / (pointNum - 1);

            points.push(
                new THREE.Vector2(
                    Math.cos(theta) * 1.5,
                    Math.sin(theta) * 0.6 + 0.2
                )
            );
        }

        const geometry = new THREE.LatheGeometry(
            points,
            60
        );


        const material = new THREE.MeshPhysicalMaterial({
            color: 0x66ccff,
            emissive: 0x2288ff,
            emissiveIntensity: 5,
            transparent: true,
            opacity: 0.45,
            transmission: 1,
            roughness: 0,
            side: THREE.DoubleSide
        });

        const jellyHead = new THREE.Mesh(geometry, material);
        kurage.add(jellyHead);

        //触手
        for (let i = 0; i < 30; i++) {

            const length = 2 + Math.random() * 3;

            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0.5, 0),
                new THREE.Vector3(0, -length * 0.3, 0.2),
                new THREE.Vector3(0, -length * 0.7, -0.2),
                new THREE.Vector3(0, -length, 0)
            ]);

            const geometrys = new THREE.TubeGeometry(
                curve,
                30,
                0.03
            );

            const materials = new THREE.MeshPhongMaterial({
                color: 0x66ccff,
                emissive: 0x2288ff,
                emissiveIntensity: 3,
                transparent: true,
                opacity: 0.45
            });

            const tentacle = new THREE.Mesh(
                geometrys,
                materials
            );


            const angle = (i / 30) * Math.PI * 2;
            const r = 1.0;

            tentacle.position.x = Math.cos(angle) * r;
            tentacle.position.z = Math.sin(angle) * r;
            tentacle.position.y = -0.2;


            kurage.add(tentacle);
        }
        this.scene.add(kurage);
        //気泡
        const createParticles = () => {
            //ジオメトリの作成
            const geometry1 = new THREE.BufferGeometry();
            const geometry2 = new THREE.BufferGeometry();


            //テクスチャの設定
            const textureLoader = new THREE.TextureLoader();
            const texture1 = textureLoader.load('/image/mizu.png');
            const texture2 = textureLoader.load('/image/water.png');

            //マテリアルの作成
            //白い気泡
            const material1 = new THREE.PointsMaterial({
                size: 0.5,
                map: texture1,
                blending: THREE.AdditiveBlending,
                transparent: true,
                alphaTest: 0.5, //0.5以下の透明度を無視
            });
            const points1 = new THREE.Points(geometry1, material1);
            this.scene.add(points1);

            //青い泡
            const material2 = new THREE.PointsMaterial({
                size: 0.8,
                map: texture2,
                blending: THREE.AdditiveBlending,
                transparent: true,
                alphaTest: 0.5, //0.5以下の透明度を無視
            });
            const points2 = new THREE.Points(geometry2, material2);
            this.scene.add(points2);



            //  const particleNum = 11 * 11; // パーティクルの数
            const particleNum = 100;
            const positions1 = new Float32Array(particleNum * 3);
            const positions2 = new Float32Array(particleNum * 3);


            for (let i = 0; i <= particleNum * 3; i++) {


                positions1[i] = 10 * Math.random() - 5;
                positions2[i] = 10 * Math.random() - 5;

            }


            //3次元の座標データを入れる
            geometry1.setAttribute('position', new THREE.BufferAttribute(positions1, 3));
            geometry2.setAttribute('position', new THREE.BufferAttribute(positions2, 3));

            //THREE.Pointsの作成
            this.points1 = new THREE.Points(geometry1, material1);
            this.points2 = new THREE.Points(geometry2, material2);

            //シーンへの追加
            this.scene.add(this.points1, this.points2);

        }
        createParticles();


        //ライトの設定
        this.light = new THREE.DirectionalLight(0xffffff);
        const lvec = new THREE.Vector3(1, 1, 1).normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);

        // 毎フレームのupdateを呼んで，更新
        // reqestAnimationFrame により次フレームを呼ぶ
        const update: FrameRequestCallback = (time) => {
            const timeSec = time * 0.001;

            const allPoints = [this.points1, this.points2];
            allPoints.forEach((points) => {
                const geom = points.geometry as THREE.BufferGeometry;
                const positions = geom.getAttribute('position'); // 座標データ

                //位置の更新
                for (let i = 0; i < positions.count; ++i) {
                    const speed = 0.5;
                    const angle = timeSec * speed + i;

                    const x = Math.sin(angle) * 0.01;
                    const y = Math.cos(angle * 0.7) * 0.01;
                    const z = Math.cos(angle * 0.5) * 0.01;
                    positions.setX(i, positions.getX(i) + x);
                    positions.setY(i, positions.getY(i) + y);
                    positions.setZ(i, positions.getZ(i) + z);
                }

                positions.needsUpdate = true;
            });

            kurage.position.x = Math.sin(time * 0.0008) * 0.5;
            kurage.rotation.z = Math.sin(time * 0.001) * 0.1;
            kurage.position.y = Math.sin(time * 0.001) * 0.5;
            const s = 1 + Math.sin(time * 0.005) * 0.1;

            jellyHead.scale.set(s, 1 - (s - 1), s);

            requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }
}

window.addEventListener("DOMContentLoaded", init);

function init() {
    const container = new ThreeJSContainer();

    const viewport = container.createRendererDOM(640, 480, new THREE.Vector3(0, 5, 5));
    document.body.appendChild(viewport);
}
