import React, {Component} from "react";
import * as THREE from "three";

let OrbitControls = require("react-cubeview/lib/OrbitControls")(THREE);

let renderer, scene, camera, controls;

// for interactive hovering
let mouse = new THREE.Vector2();
let raycaster;
let lastIntersectedObj = null;

class Container3d extends Component {
  constructor(props) {
    super(props);
    this.onHoverStart = this.onHoverStart.bind(this);
    this.onHoverEnd = this.onHoverEnd.bind(this);

    this.onError = this.onError.bind(this);
    this.onDocumentMouseMove = this.onDocumentMouseMove.bind(this);
    this.clearScene = this.clearScene.bind(this);

    this.threeCanvas = React.createRef();
  }

  componentDidMount() {
    if (this.props.relatedCanvas)
      this.relatedCanvas = this.props.relatedCanvas();

    if (this.props.onUpdateAngles)
      this.updateAngles = this.props.onUpdateAngles;

    this.init();
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    renderer = null;
    scene = null;
    camera = null;
    controls = null;
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  /**
   * Defines the angles - useful when using OrbitControls from react-cubeview
   * @param {number} phi
   * @param {number} theta
   */
  setAngles(phi, theta) {
    if (controls) {
      controls.setPolarAngle(phi);
      controls.setAzimuthalAngle(theta);
    }
  }

  getSize() {
    let {width, percentageWidth, aspect} = this.props;
    if (percentageWidth)
      width = window.innerWidth * parseFloat(percentageWidth) / 100;

    let height = width / aspect;

    return {
      width: width,
      height: height
    };
  }

  getScene() {
    return scene;
  }

  getCamera() {
    return camera;
  }

  getRenderer() {
    return renderer;
  }

  clearScene() {
    if (scene !== undefined)
      scene.traverse(function (object) {
        scene.remove(object);
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      });

    scene = new THREE.Scene();
    this.reloadScene();
  }

  updateDimensions() {
    //Get the proportions from screen
    let {
      width,
      percentageWidth,
      aspect,
      fitScreen,
      marginTop,
      marginBottom,
      height
    } = this.props;

    if (percentageWidth) {
      width = window.innerWidth * parseInt(percentageWidth, 10) / 100.0;
    }

    if (aspect) {
      height = width / aspect;
    }

    if (fitScreen) {
      height = window.innerHeight;
      if (marginTop) {
        height -= marginTop;
      }

      if (marginBottom) {
        height -= marginBottom;
      }
    }


    this.threeCanvas.current.height = height;

    renderer.setSize(width, height);

    camera.aspect = width / height;

    camera.updateProjectionMatrix();
  }

  init() {
    const {width, height} = this.getSize();

    this.threeCanvas.current.height = height;

    raycaster = new THREE.Raycaster();
    window.addEventListener("mousemove", this.onDocumentMouseMove, false);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 20, 20);
    renderer = new THREE.WebGLRenderer({
      canvas: this.threeCanvas.current,
      antialias: this.props.antialias ? this.props.antialias : true,
      alpha: true,
      opacity: 0.5
    });

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this._createScene();
    let _this = this;

    this._render = function () {
      requestAnimationFrame(_this._render);

      let {phi, theta} = _this.props;

      if (phi && theta && controls) {
        controls.setPolarAngle(phi);
        controls.setAzimuthalAngle(theta);
      }

      if (_this.props.update) {
        try {
          _this.props.update(scene, camera, renderer);
        } catch (error) {
          this.onError(error);
        }
      }

      // find intersections
      if (
        (_this.props.onHoverStart || _this.props.onHoverEnd) &&
        camera !== null
      ) {
        camera.updateMatrixWorld();

        raycaster.setFromCamera(mouse, camera);

        let intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
          if (lastIntersectedObj !== intersects[0].object) {
            if (lastIntersectedObj) {
              _this.onHoverEnd(lastIntersectedObj, scene, camera, renderer);
              lastIntersectedObj = intersects[0].object;
              _this.onHoverStart(lastIntersectedObj, scene, camera, renderer);
            } else {
              lastIntersectedObj = intersects[0].object;
              _this.onHoverStart(lastIntersectedObj, scene, camera, renderer);
            }
          }
        } else {
          if (lastIntersectedObj) {
            _this.onHoverEnd(lastIntersectedObj, scene, camera, renderer);
          }
          lastIntersectedObj = null;
        }
      }
      renderer.render(scene, camera);
    };

    this._render();
  }

  getIntersectedObject() {
    return lastIntersectedObj;
  }

  onHoverStart(object, scene, camera, renderer) {
    if (this.props)
      if (this.props.onHoverStart) {
        this.props.onHoverStart(object, scene, camera, renderer);
      }
  }

  onHoverEnd(object, scene, camera, renderer) {
    if (this.props)
      if (this.props.onHoverEnd) {
        this.props.onHoverEnd(object, scene, camera, renderer);
      }
  }

  onHover(object) {
    if (this.props)
      if (this.props.onHover) {
        this.props.onHover(object);
      }
  }

  reloadScene(newScene) {
    if (newScene) scene = newScene;
    else scene = new THREE.Scene();

    this._createScene()
    this.updateDimensions();
  }

  //Insert all 3D elements here
  _createScene() {
    const {
      addControls,
      addGrid,
      addLight,
      enableZoom,
      enableKeys,
      enablePan
    } = this.props;

    if (addGrid !== undefined ? addGrid : true) {
      let gridXZ = new THREE.GridHelper(20, 20);
      gridXZ.name = "grid";
      scene.add(gridXZ);

      let planeGeometry = new THREE.PlaneGeometry(20, 20);
      planeGeometry.rotateX(-Math.PI / 2);
      let planeMaterial = new THREE.ShadowMaterial({
        opacity: 0.4
      });
      let plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.receiveShadow = true;
      scene.add(plane);
    }

    if (addControls) {
      let rootDiv = this.threeCanvas.current;

      if (this.updateAngles) {
        controls = new OrbitControls(camera, rootDiv, this.updateAngles);
      } else {
        controls = new OrbitControls(camera, rootDiv);
      }

      controls.enablePan = enablePan !== undefined ? enablePan : true;
      controls.enableZoom = enableZoom !== undefined ? enableZoom : true;
      controls.enableKeys = enableKeys !== undefined ? enableKeys : true;
    }

    if (addLight !== undefined ? addLight : true) {
      scene.add(new THREE.AmbientLight(0x777));
      let light = new THREE.SpotLight(0xffffff, 1.0);
      light.position.set(50, 50, 50);
      light.castShadow = true;
      light.shadow = new THREE.SpotLightShadow(
        new THREE.PerspectiveCamera(70, 1, 10, 1000)
      );
      light.shadow.bias = -0.0001;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      scene.add(light);
    }

    if (this.props.setup) {
      try {
        this.props.setup(scene, camera, renderer);
      } catch (error) {
        this.onError(error);
      }
    }
  }

  onError(error) {
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  onDocumentMouseMove(event) {
    event.preventDefault();

    let rect = this.threeCanvas.current.getBoundingClientRect();

    mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  render() {
    return (
      <div>
        <canvas ref={this.threeCanvas}/>
      </div>
    );
  }
}

export default Container3d;
