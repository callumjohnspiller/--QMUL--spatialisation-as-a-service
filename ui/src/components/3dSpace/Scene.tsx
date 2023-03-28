import React, {useRef} from "react";
import * as THREE from 'three';
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import { Stats, OrbitControls } from '@react-three/drei';
import {Box} from './Objects';


export default function Scene() {
    return (
        <div style={{ height: "100vh" }}>
            <Canvas camera={{ position: [0, 0, 2] }}>
                <ambientLight intensity={0.5}/>
                <pointLight position={[10, 10, 10]}/>
                <Box position={[-0.75, 0, 0]}/>
                <Box position={[0.75, 0, 0]}/>
                <OrbitControls/>
                <Stats/>
            </Canvas>
        </div>
    );
}