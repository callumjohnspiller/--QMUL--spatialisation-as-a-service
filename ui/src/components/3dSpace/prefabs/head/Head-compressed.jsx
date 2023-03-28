/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.1.4 head-compressed.gltf
Author: JakeCarvey (https://sketchfab.com/JakeCarvey)
License: CC-BY-NC-4.0 (http://creativecommons.org/licenses/by-nc/4.0/)
Source: https://sketchfab.com/3d-models/crash-dummy-head-hollow-3bcc1e221d194ba49f8ebcea7459b853
Title: Crash Dummy Head Hollow
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function Head(props) {
  const { nodes, materials } = useGLTF('/head-compressed.gltf')
  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh geometry={nodes.defaultMaterial.geometry} material={materials.Head} />
          <mesh geometry={nodes.defaultMaterial_1.geometry} material={materials.Head} />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/head-compressed.gltf')
