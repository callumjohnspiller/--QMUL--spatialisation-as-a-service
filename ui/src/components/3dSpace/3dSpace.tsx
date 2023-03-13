import * as THREE from "three";
import React, { useRef, useState } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Box(props: ThreeElements["mesh"]) {
	const ref = useRef<THREE.Mesh>(null!);
	useFrame((state, delta) => (ref.current.rotation.x));
	return (
		<mesh
			{...props}
			ref={ref}
			scale={1}>
			{/* eslint-disable-next-line react/no-unknown-property */}
			<boxGeometry args={[20, 20, 20]} />
			{/* eslint-disable-next-line react/no-unknown-property */}
			<meshStandardMaterial color={"green"} transparent={true} opacity={0.3}/>
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