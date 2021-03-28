import React from 'react';
import {storiesOf} from '@storybook/react';
import * as THREE from 'three';
import Container3d from './../src';
import './style.css';

storiesOf('Demo', module)
    .add('with grid', () => (
        <div className="canvas-3d">
            <Container3d
                marginTop={30}
                aspect={16 / 9}
                percentageWidth={'100%'}
                fitScreen
                addControls={true}
                marginBottom={110}
            />
        </div>
    ))
    .add('without grid', () => (
        <div className="canvas-3d">
            <Container3d
                marginTop={30}
                aspect={16 / 9}
                percentageWidth={'100%'}
                fitScreen
                marginBottom={110}
                addGrid={false}
                addControls={true}
                setup={(s) => {
                    s.add(new THREE.Mesh(
                        new THREE.BoxGeometry(5, 5, 5),
                        new THREE.MeshBasicMaterial({color: 0x0088aa})
                    ));
                }}
            />
        </div>
    ))
    .add('zoom disabled', () => (
        <div className="canvas-3d">
            <Container3d
                marginTop={30}
                aspect={16 / 9}
                percentageWidth={'100%'}
                fitScreen
                marginBottom={110}
                enableZoom={false}
                setup={(s, c) => {
                    c.position.set(10, 10, 10);
                    c.lookAt(0, 0, 0);
                    s.add(new THREE.Mesh(
                        new THREE.BoxGeometry(5, 5, 5),
                        new THREE.MeshBasicMaterial({color: 0x0088aa})
                    ))
                }}
            />
        </div>
    ))
    .add('with Hover', () => (
        <div className="canvas-3d">
            <Container3d
                marginTop={30}
                aspect={16 / 9}
                percentageWidth={'100%'}
                fitScreen
                marginBottom={110}
                enableZoom={false}
                onHoverStart={(obj) => {
                    obj.userData.originalColor = obj.material.color;
                    obj.material.setValues({color: 0xf39c12});
                }}
                onHoverEnd={(obj) => {
                    if (obj.userData.originalColor)
                        obj.material.setValues({color: 0x0088aa});
                }}
                addGrid={false}
                addControls={true}
                setup={(s) => {
                    s.add(new THREE.Mesh(
                        new THREE.BoxGeometry(5, 5, 5),
                        new THREE.MeshBasicMaterial({color: 0x0088aa})
                    ));
                }}
            />
        </div>
    ))
