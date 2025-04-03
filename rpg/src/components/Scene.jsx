import { Canvas } from "@react-three/fiber";
import { Physics, usePlane, useSphere, useBox } from "@react-three/cannon";
import { useEffect, useState, useRef } from "react";
import { OrbitControls } from "@react-three/drei";

// Estado global de pontuação
function ScoreBoard({ score }) {
    return (
        <div style={{ position: "absolute", top: 10, left: 10, color: "white", fontSize: "20px" }}>
            Pontos: {score}
        </div>
    );
}

// Chão sólido
function Ground() {
    const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, -1, 0] }));
    return (
        <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="green" />
        </mesh>
    );
}

// Obstáculos
function Obstacle({ position }) {
    const [ref] = useBox(() => ({ position }));
    return (
        <mesh ref={ref} position={position}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="brown" />
        </mesh>
    );
}

// Moeda colecionável
function Coin({ position, onCollect }) {
    return (
        <mesh position={position} onClick={onCollect}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="yellow" />
        </mesh>
    );
}

// Inimigo que segue o jogador
function Enemy({ targetRef, speed, onCollide }) {
    const [ref, api] = useSphere(() => ({ mass: 1, position: [3, 1, 3] }));
    
    useEffect(() => {
        const interval = setInterval(() => {
            if (targetRef.current && ref.current) {
                const targetPos = targetRef.current.position;
                const enemyPos = ref.current.position;
                
                const direction = [
                    targetPos.x - enemyPos.x,
                    0,
                    targetPos.z - enemyPos.z,
                ];
                
                const length = Math.sqrt(direction[0] ** 2 + direction[2] ** 2);
                if (length > 0.1) {
                    direction[0] /= length;
                    direction[2] /= length;
                    api.velocity.set(direction[0] * speed, 0, direction[2] * speed);
                }
            }
        }, 100);
        return () => clearInterval(interval);
    }, [api, targetRef, speed]);

    useEffect(() => {
        const checkCollision = setInterval(() => {
            if (targetRef.current && ref.current) {
                const dx = targetRef.current.position.x - ref.current.position.x;
                const dz = targetRef.current.position.z - ref.current.position.z;
                if (Math.sqrt(dx * dx + dz * dz) < 0.6) {
                    onCollide();
                }
            }
        }, 100);
        return () => clearInterval(checkCollision);
    }, [targetRef, onCollide]);
    
    return (
        <mesh ref={ref}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="red" />
        </mesh>
    );
}

// Personagem
function Character({ addScore, playerRef }) {
    const [ref, api] = useSphere(() => ({ mass: 1, position: [0, 1, 0] }));
    playerRef.current = ref;

    const [velocity, setVelocity] = useState([0, 0, 0]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            let newVelocity = [velocity[0], velocity[1], velocity[2]];
            if (event.key === "ArrowUp") newVelocity = [0, velocity[1], -3];
            if (event.key === "ArrowDown") newVelocity = [0, velocity[1], 3];
            if (event.key === "ArrowLeft") newVelocity = [-3, velocity[1], 0];
            if (event.key === "ArrowRight") newVelocity = [3, velocity[1], 0];
            if (event.key === " " && velocity[1] === 0) newVelocity = [velocity[0], 6, velocity[2]];
            setVelocity(newVelocity);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [velocity]);

    useEffect(() => {
        api.velocity.set(...velocity);
    }, [velocity, api]);

    useEffect(() => {
        const interval = setInterval(() => {
            addScore(1);
        }, 1000);
        return () => clearInterval(interval);
    }, [addScore]);

    return (
        <mesh ref={ref}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="blue" />
        </mesh>
    );
}

// Cena principal
function Scene() {
    const [score, setScore] = useState(0);
    const playerRef = useRef(null);

    const handleCollision = () => {
        setScore((prev) => Math.max(0, prev - 20));
    };

    return (
        <>
            <ScoreBoard score={score} />
            <Canvas>
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} />
                <Physics>
                    <Ground />
                    <Character addScore={(points) => setScore((prev) => prev + points)} playerRef={playerRef} />
                    <Obstacle position={[2, 0, -2]} />
                    <Coin position={[1, 0.3, 1]} onCollect={() => setScore((prev) => prev + 10)} />
                    <Enemy targetRef={playerRef} speed={1.5} onCollide={handleCollision} />
                    <Enemy targetRef={playerRef} speed={2} onCollide={handleCollision} />
                </Physics>
                <OrbitControls />
            </Canvas>
        </>
    );
}

export default Scene;