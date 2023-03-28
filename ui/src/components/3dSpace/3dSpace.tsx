import * as THREE from "three";
import React, { useRef, useState } from "react";
import { Canvas, useFrame, ThreeElements } from "@react-three/fiber";
import {Environment, Float, MeshReflectorMaterial, OrbitControls} from "@react-three/drei";

function Box(props: ThreeElements["mesh"]) {
	const ref = useRef<THREE.Mesh>(null!);
	useFrame((state, delta) => (ref.current.rotation.x));
	return (
		<mesh
			{...props}
			ref={ref}
			scale={1}>
			{/* eslint-disable-next-line react/no-unknown-property */}
			<boxGeometry args={[1, 1, 1]} />
			{/* eslint-disable-next-line react/no-unknown-property */}
			<meshStandardMaterial color={"red"} transparent={true} opacity={0.5}/>
		</mesh>
	);
}

function Sphere(props: ThreeElements["mesh"]) {
	return (
		<Float floatIntensity={15}>
			<mesh {...props}
			>
				<sphereGeometry />
				<meshBasicMaterial color={"hotpink"}  />
			</mesh>
		</Float>
	)
}

export default function Representation() {
	return (
		<div style={{ height: "100vh" }}>
			<Canvas dpr={[1, 1.5]} camera={{ fov: 70, position: [0, 5, 15] }}>
				<OrbitControls/>
				<color attach="background" args={['#191920']} />
				<fog attach="fog" args={['#191920', 0, 30]} />
				<group position={[0, -0.5, 0]}>
					<Box position={[5,5,5]}/>
					<mesh rotation={[-Math.PI / 2, 0, 0]}>
						<planeGeometry args={[50, 50]} />
						<MeshReflectorMaterial
							mirror={2}
							blur={[300, 100]}
							resolution={2048}
							mixBlur={1}
							mixStrength={50}
							roughness={1}
							depthScale={1.2}
							minDepthThreshold={0.4}
							maxDepthThreshold={1.4}
							color="#050505"
							metalness={0.5}
						/>
					</mesh>
				</group>
				<Environment preset="city" />
			</Canvas>
			<Canvas camera={{ position: [0, 0, 5] }}>
				<OrbitControls/>
				<ambientLight />
				{/* eslint-disable-next-line react/no-unknown-property */}
				<pointLight position={[10, 10, 10]} />
				<Sphere position={[2, 4, -8]} scale={0.9} />
				<Sphere position={[-2, 2, -8]} scale={0.8} />
			</Canvas>
		</div>
	);
}