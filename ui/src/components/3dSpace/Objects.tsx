import React, {useEffect, useRef, useState, useMemo} from "react";
import {useFrame} from "@react-three/fiber";
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei'

export function Box(props: any) {
    const ref = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);
    const [position, setPosition] = useState(props.position)
    const geometry = useMemo(() => new THREE.BoxGeometry(), [])


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
            onPointerDown={(e) => console.log('pointer down ' + e.object.position.y)}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            geometry={geometry}
        >
            <boxGeometry />
            <meshBasicMaterial color={"green"} wireframe={true} />
        </mesh>
    );
}

export function Head(props: any) {
    const group = useRef()
    const head = useGLTF('./prefabs/head/scene.gltf')
    head.asset.
    return (
        <group ref={group} {...props} dispose={null}>
            <mesh castShadow receiveShadow geometry={head.Curve007_1.geometry} material={materials['Material.001']} />
            <mesh castShadow receiveShadow geometry={nodes.Curve007_2.geometry} material={materials['Material.002']} />
        </group>
    )

}


useGLTF.preload('./prefabs/head/scene.gltf')
