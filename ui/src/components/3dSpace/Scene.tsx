import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats, Text } from '@react-three/drei';
import { Box, Label, Plane } from './Objects';

interface SceneProps {
  spatialParams: any,
  fileLabels: string[]
}

function Scene(props: SceneProps) {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      {<Suspense>
        <Canvas camera={{ position: [2, 2, 10] }}>
          <axesHelper args={[20]} />
          <axesHelper args={[-20]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Plane position={[0, 0, -20]} />
          <Plane position={[0, 20, 0]} rotation={[Math.PI / 2, 0, 0]} />
          <Plane position={[0, -20, 0]} rotation={[Math.PI / -2, 0, 0]} />
          <Plane position={[20, 0, 0]} rotation={[Math.PI / 1, Math.PI / -2, 0]} />
          <Plane position={[-20, 0, 0]} rotation={[Math.PI / 1, Math.PI / 2, 0]} />
          <Text
            scale={[6, 6, 6]}
            color="black" // default
            position={[0, 0, -19.5]}
          >
            FORWARDS
          </Text>
          {
            props.fileLabels.map((label, index) => {
              return (
                <group>
                  <Box name={label} position={[
                    props.spatialParams[props.fileLabels[index]]['X'],
                    props.spatialParams[props.fileLabels[index]]['Y'],
                    props.spatialParams[props.fileLabels[index]]['Z']
                  ]} />
                  <Label position={[
                    props.spatialParams[props.fileLabels[index]]["X"],
                    props.spatialParams[props.fileLabels[index]]["Y"] -1,
                    props.spatialParams[props.fileLabels[index]]["Z"]
                  ]} content={label.replace(/_(.)*/gm, "")}>
                  </Label>
                </group>

              );
            })
          }
          <OrbitControls
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
            maxDistance={40}
            minDistance={5}
          />
          <Stats />
        </Canvas>
      </Suspense>
      }
    </div>
  );
}

export default Scene;