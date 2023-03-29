import React from "react";
import {Canvas} from "@react-three/fiber";
import {OrbitControls, Stats} from '@react-three/drei';
import { Box } from './Objects';

interface SceneProps {
    spatialParams: any,
    fileLabels: string[]
}
function Scene(props: SceneProps) {
    return (
        <div style={{height: "100vh"}}>
            {
                (props.fileLabels && props.spatialParams) ?
                    <Canvas camera={{position: [0, 0, 3]}}>
                        <axesHelper args={[20]}/>
                        <axesHelper args={[-20]}/>
                        <ambientLight intensity={0.5}/>
                        <pointLight position={[10, 10, 10]}/>
                        {
                            props.fileLabels.map((label, index) => {
                                return <Box name={label}
                                            position={[
                                                props.spatialParams[props.fileLabels[index]]["Y"], //updown
                                                props.spatialParams[props.fileLabels[index]]["Z"], //
                                                props.spatialParams[props.fileLabels[index]]["X"]
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