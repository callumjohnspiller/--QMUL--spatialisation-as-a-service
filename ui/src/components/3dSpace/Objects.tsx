import React, {useEffect, useRef, useState} from "react";
import {useFrame} from "@react-three/fiber";

export function Box(props: any) {
    const ref = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);
    const [position, setPosition] = useState(props.position)


    useEffect(() => {
    });

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
        >
            <boxGeometry />
            <meshBasicMaterial color={"green"} wireframe={true} />
        </mesh>
    );
}