import React from "react";
import {Canvas} from "@react-three/fiber";
import {OrbitControls, Stats} from '@react-three/drei';
import {Box} from './Objects';

interface SceneProps {
    spatialParams: any,
    fileLabels: string[]
}


function Scene(props: SceneProps) {
    return (
        <div style={{height: "100vh"}}>
            {
                (props.fileLabels && props.spatialParams) ?
                    <Canvas camera={{position: [0, 0, 2]}}>
                        <ambientLight intensity={0.5}/>
                        <pointLight position={[10, 10, 10]}/>
                        {
                            props.fileLabels.map((label, index) => {
                                return <Box name={label}
                                            position={[props.spatialParams[props.fileLabels[index]]["X"], props.spatialParams[props.fileLabels[index]]["Y"], props.spatialParams[props.fileLabels[index]]["X"]]}/>
                            })
                        }
                        <OrbitControls/>
                        <Stats/>
                    </Canvas>
                    : <></>
            }
        </div>
    );
}

export default Scene;