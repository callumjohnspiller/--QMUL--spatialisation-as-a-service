import React, {useEffect, useRef, useState, useMemo} from "react";
import {useFrame} from "@react-three/fiber";
import * as THREE from 'three';
import {Html} from '@react-three/drei';


export function Box(props: any) {
    const ref = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);
    const [position, setPosition] = useState(props.position);
    const geometry = useMemo(() => new THREE.BoxGeometry(), []);
    const [boxColour, setBoxColour] = useState(Math.floor(Math.random()*16777215).toString(16));

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
            <meshBasicMaterial color={'#' + boxColour} wireframe={true} />
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
          <meshPhongMaterial attach="material" color={0x63ADF2} wireframe={true} opacity={0.8}/>
      </mesh>
    )
}

export function Label(props:any) {
    return (
      <Html
        as='div'
        center
        position={props.position}
      >
          <p style={{
              borderRadius: '25px',
              inlineSize: '150px',
              fontSize: 15,
              backgroundColor: 'papayawhip',
              textAlign: 'center',
              overflowWrap: 'break-word',
              hyphens: 'auto',
              padding: '5px'
          }}>
              {props.content}
          </p>
      </Html>
    )
}

export function InstrumentLabel(props:any) {
    return (
      <Html
        as='div'
        center
        position={props.position}
      >
          <p style={{
              fontSize: 15,
              textAlign: 'center',
              overflowWrap: 'break-word',
              hyphens: 'auto',
              padding: '5px'
          }}>
              {props.content}
          </p>
      </Html>
    )
}
