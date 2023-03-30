import React, {useEffect, useRef, useState, useMemo} from "react";
import {useFrame} from "@react-three/fiber";
import * as THREE from 'three';
import {Html} from '@react-three/drei';
import { useGLTF } from '@react-three/drei'

export function Box(props: any) {
    const ref = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);
    const [position, setPosition] = useState(props.position);
    const geometry = useMemo(() => new THREE.BoxGeometry(), []);


    useEffect(() => {
        setPosition(props.position);
    }, [position]);

    useFrame((_, delta) => {
        if (hovered) {
            ref.current!.rotation.x += delta
            ref.current!.rotation.y += 0.5 * delta
        }
    })

    return (
        <mesh
            {...props}
            ref={ref}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            geometry={geometry}
        >
            <boxGeometry />
            <meshBasicMaterial color={"green"} wireframe={true} />
        </mesh>
    );
}

export function Plane(props: any) {
    const ref = useRef<THREE.Mesh>(null);
    return (
      <mesh
        {...props}
        ref={ref}
      >
          <planeBufferGeometry attach="geometry" args={[40, 40, 3, 3]} />
          <meshPhongMaterial attach="material" color="63ADF2" wireframe={false} opacity={0.8}/>
      </mesh>
    )
}

export function Head(props:any) {
    // @ts-ignore
  const { nodes, materials } = useGLTF('/scene.gltf')
    const ref = useRef<THREE.Mesh>(null);
    return (
      <group {...props} dispose={null}>
          <mesh castShadow={true} receiveShadow={true} geometry={nodes.Sketchfab_model.geometry} material={materials.head} material-envMapIntensity={0.8} />
      </group>
    )
}

export function Label(props:any) {
    const ref = useRef<THREE.Mesh>(null);
    return (
      <Html center position={props.position}>
          <p>{props.content}</p>
      </Html>
    )
}
