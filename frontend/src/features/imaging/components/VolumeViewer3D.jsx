import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const vertexShader = `
  varying vec3 vOrigin;
  varying vec3 vDirection;
  void main() {
    vOrigin = cameraPosition;
    vDirection = position - cameraPosition;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  precision highp sampler3D;

  uniform mat4 modelMatrix;
  uniform mat4 modelInverse;
  uniform sampler3D volumeTexture;
  uniform vec3 dimensions;
  uniform float threshold;
  uniform float opacity;
  uniform float steps;

  varying vec3 vOrigin;
  varying vec3 vDirection;

  vec2 hitBox(vec3 orig, vec3 dir) {
    vec3 box_min = vec3(-0.5);
    vec3 box_max = vec3(0.5);
    vec3 inv_dir = 1.0 / dir;
    vec3 tmin_tmp = (box_min - orig) * inv_dir;
    vec3 tmax_tmp = (box_max - orig) * inv_dir;
    vec3 tmin = min(tmin_tmp, tmax_tmp);
    vec3 tmax = max(tmin_tmp, tmax_tmp);
    float t0 = max(tmin.x, max(tmin.y, tmin.z));
    float t1 = min(tmax.x, min(tmax.y, tmax.z));
    return vec2(t0, t1);
  }

  void main() {
    vec3 rayDir = normalize(vDirection);
    vec3 ro = (modelInverse * vec4(cameraPosition, 1.0)).xyz;
    vec3 rd = normalize((modelInverse * vec4(rayDir, 0.0)).xyz);

    vec2 bounds = hitBox(ro, rd);
    if (bounds.x > bounds.y) discard;

    float t = max(bounds.x, 0.0);
    float tEnd = bounds.y;
    float stepSize = (tEnd - t) / steps;

    vec4 color = vec4(0.0);
    for (int i = 0; i < 256; i++) {
        if (float(i) >= steps || t > tEnd || color.a >= 0.95) break;
        
        vec3 pos = ro + rd * t;
        vec3 texCoord = pos + 0.5; // Map [-0.5, 0.5] to [0, 1]
        
        float val = texture(volumeTexture, texCoord).r;
        
        if (val > threshold) {
            float alpha = (val - threshold) * opacity * stepSize * 25.0; // Increased multiplier for brightness
            vec4 src = vec4(vec3(val), alpha);
            color.rgb += (1.0 - color.a) * src.rgb * src.a;
            color.a += (1.0 - color.a) * src.a;
        }
        
        t += stepSize;
    }

    if (color.a == 0.0) discard;
    gl_FragColor = color;
  }
`;

const VolumeMesh = ({ data, dims, threshold, opacity }) => {
    const meshRef = useRef();

    const texture = useMemo(() => {
        if (!data) return null;
        // dims is [z, y, x] from numpy
        const tex = new THREE.Data3DTexture(data, dims[2], dims[1], dims[0]);
        tex.format = THREE.RedFormat;
        tex.type = THREE.UnsignedByteType;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.unpackAlignment = 1;
        tex.needsUpdate = true;
        return tex;
    }, [data, dims]);

    const uniforms = useMemo(() => ({
        volumeTexture: { value: texture },
        dimensions: { value: new THREE.Vector3(dims[2], dims[1], dims[0]) },
        modelInverse: { value: new THREE.Matrix4() },
        threshold: { value: threshold },
        opacity: { value: opacity },
        steps: { value: 128.0 }
    }), [texture, dims]); // Stable uniforms only dependent on texture/dims

    // Update threshold/opacity uniforms when state changes
    useEffect(() => {
        if (uniforms) {
            uniforms.threshold.value = threshold;
            uniforms.opacity.value = opacity;
        }
    }, [threshold, opacity, uniforms]);

    useFrame((state) => {
        if (meshRef.current) {
            uniforms.modelInverse.value.copy(meshRef.current.matrixWorld).invert();
        }
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[1, 1, 1]} />
            <shaderMaterial
                transparent
                side={THREE.BackSide}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
};

export default function VolumeViewer3D({ studyId }) {
    const [volumeData, setVolumeData] = useState(null);
    const [dims, setDims] = useState([1, 1, 1]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [threshold, setThreshold] = useState(0.2);
    const [opacity, setOpacity] = useState(1.0);

    useEffect(() => {
        if (!studyId) return;

        const fetchVolume = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://127.0.0.1:8000/api/imaging/volume-data/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Token ${token}` }),
                    },
                    body: JSON.stringify({ file_id: studyId, target_size: 128 }),
                });

                if (!response.ok) throw new Error('Failed to fetch volume data');
                const result = await response.json();

                if (result.success) {
                    const binaryString = atob(result.data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    setVolumeData(bytes);
                    setDims(result.dimensions);
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVolume();
    }, [studyId]);

    if (!studyId) return <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Select a study to view 3D Volume</div>;
    if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Loading 3D Volume...</div>;
    if (error) return <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>Error: {error}</div>;

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000' }}>
            <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px', pointerEvents: 'auto' }}>
                <div style={{ marginBottom: '5px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Density Threshold</label><br />
                    <input type="range" min="0" max="1" step="0.01" value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))} />
                </div>
                <div>
                    <label style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Opacity</label><br />
                    <input type="range" min="0.1" max="5" step="0.1" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} />
                </div>
            </div>
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 2]} />
                <OrbitControls />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                {volumeData && <VolumeMesh data={volumeData} dims={dims} threshold={threshold} opacity={opacity} />}
            </Canvas>
        </div >
    );
}
