import * as THREE from "three";
import React, { useRef, useState } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Box(props: ThreeElements["mesh"]) {
	const ref = useRef<THREE.Mesh>(null!);
	const [hovered, hover] = useState(false);
	const [clicked, click] = useState(false);
	useFrame((state, delta) => (ref.current.rotation.x));
	return (
		<mesh
			{...props}
			ref={ref}
			scale={clicked ? 1.5 : 1}
			onClick={(event) => click(!clicked)}
			onPointerOver={(event) => hover(true)}
			onPointerOut={(event) => hover(false)}>
			{/* eslint-disable-next-line react/no-unknown-property */}
			<boxGeometry args={[1, 1, 1]} />
			<meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
		</mesh>
	);
}

export default function Representation() {
	return (
		<Canvas>
			<ambientLight />
			{/* eslint-disable-next-line react/no-unknown-property */}
			<pointLight position={[10, 10, 10]} />
			<OrbitControls/>
			<Box position={[0, 0, 0]} />
		</Canvas>
	);
}