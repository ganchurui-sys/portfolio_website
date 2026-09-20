/* eslint-disable react/no-unknown-property */
"use client";

import { Environment, Lightformer, useGLTF, useTexture } from "@react-three/drei";
import { Canvas, extend, useFrame, useThree, type ThreeElement, type ThreeEvent } from "@react-three/fiber";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

import styles from "./PortfolioLanyard.module.css";
import projectLinkStyles from "./UrbanProjectLinks.module.css";

const CARD_MODEL = "/react-bits-lanyard-card.glb";
const CARD_TEXTURE = "/zhong-card-texture-v9.webp";
const CARD_ROLE = "Spatial Designer & Creative Technologist";
const LANYARD_TEXTURE = "/zhong-lanyard.png";
const CARD_FACE_SCALE = 1.42;
const CARD_FACE_PIVOT_Y = 0.97;
const CLICK_MOVE_THRESHOLD = 8;

extend({ MeshLineGeometry, MeshLineMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

type CardModel = GLTF & {
  nodes: {
    card: THREE.Mesh;
    clip: THREE.Mesh;
    clamp: THREE.Mesh;
  };
  materials: {
    base: THREE.MeshStandardMaterial;
    metal: THREE.MeshStandardMaterial;
  };
};

type LanyardRigidBody = RapierRigidBody & {
  lerped?: THREE.Vector3;
};

function PortfolioBand({
  isMobile,
  keyboardFocused,
}: {
  isMobile: boolean;
  keyboardFocused: boolean;
}) {
  const router = useRouter();
  const band = useRef<
    THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>
  >(null!);
  const fixed = useRef<RapierRigidBody>(null!);
  const jointOne = useRef<LanyardRigidBody>(null!);
  const jointTwo = useRef<LanyardRigidBody>(null!);
  const jointThree = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);
  const cardPresentation = useRef<THREE.Group>(null!);
  const hoverProgress = useRef(0);
  const reducedMotion = useRef(false);
  const pointerDownOrigin = useRef<{ x: number; y: number } | null>(null);
  const { nodes, materials } = useGLTF(CARD_MODEL) as unknown as CardModel;
  const { gl } = useThree();
  const cardTextureSource = useTexture(CARD_TEXTURE);
  const bandTextureSource = useTexture(LANYARD_TEXTURE);
  const [dragged, setDragged] = useState<false | THREE.Vector3>(false);
  const [hovered, setHovered] = useState(false);
  const [curve] = useState(() => {
    const nextCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
    ]);
    nextCurve.curveType = "chordal";
    return nextCurve;
  });
  const vectors = useMemo(
    () => ({
      point: new THREE.Vector3(),
      direction: new THREE.Vector3(),
      angularVelocity: new THREE.Vector3(),
      rotation: new THREE.Vector3(),
    }),
    [],
  );
  const cardMap = useMemo(() => {
    // Render the editable role as card typography, preserving the existing
    // portrait, front/back artwork, and the model's texture-atlas coordinates.
    const artwork = cardTextureSource.image as HTMLImageElement;
    const canvas = document.createElement("canvas");
    canvas.width = artwork.naturalWidth || artwork.width;
    canvas.height = artwork.naturalHeight || artwork.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to render the portfolio badge text.");

    context.drawImage(artwork, 0, 0);
    context.scale(canvas.width / 1678, canvas.height / 1677);
    context.fillStyle = "#f8f8f6";
    context.fillRect(70, 918, 696, 42);
    context.font = "700 25px Arial, Helvetica, sans-serif";
    context.textBaseline = "top";
    context.fillStyle = "#0e0f10";
    context.fillText(CARD_ROLE, 72, 923, 692);

    const nextTexture = new THREE.CanvasTexture(canvas);
    nextTexture.flipY = false;
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
    nextTexture.minFilter = THREE.LinearMipmapLinearFilter;
    nextTexture.magFilter = THREE.LinearFilter;
    nextTexture.generateMipmaps = true;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [cardTextureSource, gl]);

  useEffect(() => () => cardMap.dispose(), [cardMap]);
  const bandTexture = useMemo(() => {
    const nextTexture = bandTextureSource.clone();
    nextTexture.wrapS = THREE.RepeatWrapping;
    nextTexture.wrapT = THREE.RepeatWrapping;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [bandTextureSource]);

  const segmentProps: RigidBodyProps = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const getLerped = (body: LanyardRigidBody) => {
    if (!body.lerped) body.lerped = new THREE.Vector3().copy(body.translation());
    return body.lerped;
  };

  useRopeJoint(fixed, jointOne, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(jointOne, jointTwo, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(jointTwo, jointThree, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(jointThree, card, [
    [0, 0, 0],
    [0, 1.5, 0],
  ]);

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = dragged ? "grabbing" : "pointer";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [dragged, hovered]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => { reducedMotion.current = preference.matches; };
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useFrame((state, delta) => {
    const highlight = (hovered || keyboardFocused) && !dragged;
    const target = highlight && !reducedMotion.current ? 1 : 0;
    hoverProgress.current = reducedMotion.current
      ? 0
      : THREE.MathUtils.damp(hoverProgress.current, target, 10, delta);
    if (cardPresentation.current) {
      // Lift from the attachment point, keeping the badge connected to its strap.
      cardPresentation.current.scale.setScalar(1 + hoverProgress.current * 0.035);
      cardPresentation.current.rotation.x = -hoverProgress.current * 0.065;
    }

    if (dragged) {
      vectors.point.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      vectors.direction.copy(vectors.point).sub(state.camera.position).normalize();
      vectors.point.add(vectors.direction.multiplyScalar(state.camera.position.length()));
      [card, jointOne, jointTwo, jointThree, fixed].forEach((body) => body.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vectors.point.x - dragged.x,
        y: vectors.point.y - dragged.y,
        z: vectors.point.z - dragged.z,
      });
    }

    if (!fixed.current) return;

    [jointOne, jointTwo].forEach((body) => {
      const lerped = getLerped(body.current);
      const distance = Math.max(0.1, Math.min(1, lerped.distanceTo(body.current.translation())));
      lerped.lerp(body.current.translation(), delta * distance * 50);
    });

    curve.points[0].copy(jointThree.current.translation());
    curve.points[1].copy(getLerped(jointTwo.current));
    curve.points[2].copy(getLerped(jointOne.current));
    curve.points[3].copy(fixed.current.translation());
    band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));

    vectors.angularVelocity.copy(card.current.angvel());
    vectors.rotation.copy(card.current.rotation());
    card.current.setAngvel(
      {
        x: vectors.angularVelocity.x,
        y: vectors.angularVelocity.y - vectors.rotation.y * 0.25,
        z: vectors.angularVelocity.z,
      },
      true,
    );
  });

  return (
    <>
      <group position={[0, 5.45, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody ref={jointOne} {...segmentProps} position={[0.5, 0, 0]}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={jointTwo} {...segmentProps} position={[1, 0, 0]}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={jointThree} {...segmentProps} position={[1.5, 0, 0]}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          ref={card}
          {...segmentProps}
          position={[2, 0, 0]}
          type={dragged ? "kinematicPosition" : "dynamic"}
        >
          <CuboidCollider
            args={[0.8 * CARD_FACE_SCALE, 1.125 * CARD_FACE_SCALE, 0.01]}
            position={[0, -0.47, 0]}
          />
          <group ref={cardPresentation} position={[0, 1.5, 0]}>
            <group
              position={[0, -2.7, -0.05]}
              scale={2.25}
              onPointerOver={(event: ThreeEvent<PointerEvent>) => {
                if (event.nativeEvent.pointerType !== "touch") setHovered(true);
              }}
              onPointerOut={() => setHovered(false)}
              onPointerUp={(event: ThreeEvent<PointerEvent>) => {
                (event.target as Element).releasePointerCapture(event.pointerId);
                const origin = pointerDownOrigin.current;
                pointerDownOrigin.current = null;
                setDragged(false);

                if (
                  origin &&
                  Math.hypot(event.nativeEvent.clientX - origin.x, event.nativeEvent.clientY - origin.y) <
                    CLICK_MOVE_THRESHOLD
                ) {
                  router.push("/about");
                }
              }}
              onPointerDown={(event: ThreeEvent<PointerEvent>) => {
                event.stopPropagation();
                (event.target as Element).setPointerCapture(event.pointerId);
                pointerDownOrigin.current = {
                  x: event.nativeEvent.clientX,
                  y: event.nativeEvent.clientY,
                };
                setDragged(
                  new THREE.Vector3().copy(event.point).sub(
                    vectors.point.copy(card.current.translation()),
                  ),
                );
              }}
            >
              <mesh
                geometry={nodes.card.geometry}
                position={[0, CARD_FACE_PIVOT_Y * (1 - CARD_FACE_SCALE), 0]}
                scale={[CARD_FACE_SCALE, CARD_FACE_SCALE, 1]}
              >
                <meshPhysicalMaterial
                  map={cardMap}
                  map-anisotropy={16}
                  clearcoat={isMobile ? 0 : 1}
                  clearcoatRoughness={0.15}
                  roughness={0.9}
                  metalness={0.8}
                  emissive="white"
                  emissiveMap={cardMap}
                  emissiveIntensity={(hovered || keyboardFocused) && !dragged ? 0.12 : 0}
                />
              </mesh>
              <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
              <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
            </group>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          args={[{ resolution: new THREE.Vector2(1000, isMobile ? 2000 : 1000) }]}
          color="white"
          depthTest={false}
          map={bandTexture}
          repeat={[-4, 1]}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap={1}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}

export default function PortfolioLanyard() {
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={styles.wrapper}
      data-portfolio-lanyard
      aria-label={`Zhong — ${CARD_ROLE}。可拖拽的 3D 挂绳工牌，点击进入自我介绍页面`}
    >
      <Canvas
        camera={{ position: [0, 0, 24], fov: 20 }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={[0, -40, 0]} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <PortfolioBand isMobile={isMobile} keyboardFocused={keyboardFocused} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
      <div className={styles.entryHint}>
        <Link
          className={`${projectLinkStyles.link} ${styles.profileLink}`}
          href="/about"
          aria-label="进入 About Me，了解 Zhong"
          onFocus={(event) => setKeyboardFocused(event.currentTarget.matches(":focus-visible"))}
          onBlur={() => setKeyboardFocused(false)}
        >
          <span className={projectLinkStyles.title} lang="en">EXPLORE ABOUT ME</span>
          <span className={projectLinkStyles.arrow} aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  );
}

if (typeof window !== "undefined") {
  useGLTF.preload(CARD_MODEL);
  useTexture.preload(CARD_TEXTURE);
  useTexture.preload(LANYARD_TEXTURE);
}
