import React, {useEffect, useRef, useState, useMemo} from "react";
import {useFrame} from "@react-three/fiber";
import * as THREE from 'three';
import {Html} from '@react-three/drei';
import { useGLTF } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


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
          <planeGeometry attach="geometry" args={[40, 40, 3, 3]} />
          <meshPhongMaterial attach="material" color="0x63ADF2" wireframe={false} opacity={0.8}/>
      </mesh>
    )
}

export function Head(props:any) {
    // @ts-ignore
  const GLTF = useGLTF('/scene.gltf', true, true, GLTFLoader )
  return (<primitive object={GLTF.scene} />)
}

export function Label(props:any) {
    const ref = useRef<THREE.Mesh>(null);
    return (
      <Html center position={props.position}>
          <p>{props.content}</p>
      </Html>
    )
}

useGLTF.preload(['/scene.gltf', '/scene.bin', '/textures/*'])
