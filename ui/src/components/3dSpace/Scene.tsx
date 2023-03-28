import React from "react";
import {Canvas, useLoader} from "@react-three/fiber";
import {OrbitControls, Stats} from '@react-three/drei';
import {Box, Head} from './Objects';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface SceneProps {
    spatialParams: any,
    fileLabels: string[]
}
function Scene(props: SceneProps) {

    const loader = new GLTFLoader();
    loader.load(
        './scene.gltf',
        (gltf) => {
            console.log('Loaded model:', gltf);
            // do something with the model
        },
        (error) => {
            console.log('Error loading model:', error);
        }
    );

    return (
        <div style={{height: "100vh"}}>
            {
                (props.fileLabels && props.spatialParams) ?
                    <Canvas camera={{position: [0, 0, 3]}}>
                        <ambientLight intensity={0.5}/>
                        <pointLight position={[10, 10, 10]}/>
                        <Head position={[0,0,0]}/>
                        {
                            props.fileLabels.map((label, index) => {
                                return <Box name={label}
                                            position={[
                                                props.spatialParams[props.fileLabels[index]]["X"],
                                                props.spatialParams[props.fileLabels[index]]["Y"],
                                                props.spatialParams[props.fileLabels[index]]["Z"]
                                            ]}/>
                            })
                        }
                        <OrbitControls
                            minAzimuthAngle={-Math.PI / 4}
                            maxAzimuthAngle={Math.PI / 4}
                            minPolarAngle={Math.PI / 6}
                            maxPolarAngle={Math.PI - Math.PI / 6}
                        />
                        <Stats/>
                    </Canvas>
                    : <></>
            }
        </div>
    );
}

export default Scene;