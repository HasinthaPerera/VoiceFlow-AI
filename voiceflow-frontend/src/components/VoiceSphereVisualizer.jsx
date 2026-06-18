import { useEffect, useRef } from 'react';

export default function VoiceSphereVisualizer({ isPlaying, analyserRef, speed = 1.0, pitch = 1.0 }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    let height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;

    const resizeHandler = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    window.addEventListener('resize', resizeHandler);

    let phase = 0;
    let particles = [];

    // Initialize decorative orbit particles
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 40; i++) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          distance: (55 + Math.random() * 45),
          speed: (0.01 + Math.random() * 0.02),
          size: Math.random() * 1.5 + 0.5,
          color: i % 2 === 0 ? 'rgba(99, 102, 241, 0.6)' : 'rgba(168, 85, 247, 0.6)'
        });
      }
    };
    initParticles();

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) * 0.22;

      // Draw dark background gradient inside the visualizer card area
      const radialGlow = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.2, centerX, centerY, baseRadius * 2);
      radialGlow.addColorStop(0, 'rgba(17, 12, 30, 0.15)');
      radialGlow.addColorStop(0.5, 'rgba(15, 10, 25, 0.05)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      phase += 0.05 * speed;

      let frequencyData = null;
      let bufferLength = 0;
      
      if (isPlaying && analyserRef && analyserRef.current) {
        const analyser = analyserRef.current;
        bufferLength = analyser.frequencyBinCount;
        frequencyData = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(frequencyData);
      }

      // --- Draw Orbiting Particles ---
      particles.forEach((p) => {
        p.angle += p.speed * (isPlaying ? 1.8 : 0.3);
        const radiusMultiplier = isPlaying ? (1 + Math.sin(phase * 0.2) * 0.1) : 1;
        
        let pX = centerX + Math.cos(p.angle) * p.distance * radiusMultiplier * (baseRadius / 65);
        let pY = centerY + Math.sin(p.angle) * p.distance * radiusMultiplier * (baseRadius / 65);

        ctx.beginPath();
        ctx.arc(pX, pY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        ctx.fill();
      });
      ctx.shadowBlur = 0; // Reset shadow

      // --- Draw Glowing Central Core ---
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, baseRadius * (isPlaying ? 1.05 + Math.sin(phase * 0.5) * 0.08 : 0.95)
      );
      
      // Core pulse styling
      if (isPlaying) {
        coreGradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
        coreGradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.2)');
        coreGradient.addColorStop(0.8, 'rgba(236, 72, 153, 0.05)');
        coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        coreGradient.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
        coreGradient.addColorStop(0.6, 'rgba(168, 85, 247, 0.05)');
        coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // --- Draw Morphing Wave Rings (3 overlaying rings) ---
      const rings = [
        { color: 'rgba(99, 102, 241, 0.75)', freqMult: 1.2, radiusOffset: 0, ampMult: 1.0 },   // Indigo Ring
        { color: 'rgba(168, 85, 247, 0.65)', freqMult: 1.5, radiusOffset: -12, ampMult: 0.8 }, // Purple Ring
        { color: 'rgba(236, 72, 153, 0.55)', freqMult: 2.1, radiusOffset: 12, ampMult: 0.6 }   // Pink Ring
      ];

      rings.forEach((ring, ringIdx) => {
        ctx.beginPath();
        ctx.lineWidth = isPlaying ? 2.5 : 1.2;
        ctx.strokeStyle = ring.color;
        ctx.shadowBlur = isPlaying ? 14 : 2;
        ctx.shadowColor = ring.color;

        const pointsCount = 100;
        
        for (let i = 0; i <= pointsCount; i++) {
          const theta = (i / pointsCount) * Math.PI * 2;
          
          let displacement = 0;
          if (isPlaying) {
            if (frequencyData) {
              // Map FFT frequency bins to points on the circle circumference
              const binIndex = Math.floor((i % (pointsCount / 2)) / (pointsCount / 2) * (bufferLength * 0.6));
              const amp = frequencyData[binIndex] / 255.0;
              displacement = amp * 45 * ring.ampMult;
            } else {
              // Procedural morphing using layered sin/cos waves
              const waveVal = Math.sin(theta * 6 * ring.freqMult + phase) * 
                              Math.cos(theta * 3 - phase * 0.7);
              displacement = waveVal * 16 * ring.ampMult * pitch;
            }
          }

          const currentRadius = baseRadius + ring.radiusOffset + displacement;
          const x = centerX + Math.cos(theta) * currentRadius;
          const y = centerY + Math.sin(theta) * currentRadius;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      });
      ctx.shadowBlur = 0; // Reset shadow for next draw operations

      // --- Draw Center Ring (Dotted/Tech-looking) ---
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.arc(centerX, centerY, baseRadius - 25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Inner micro circle
      ctx.beginPath();
      ctx.strokeStyle = isPlaying ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1.5;
      ctx.arc(centerX, centerY, baseRadius * 0.45, 0, Math.PI * 2);
      ctx.stroke();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', resizeHandler);
    };
  }, [isPlaying, analyserRef, speed, pitch]);

  return (
    <div className="w-full h-full relative min-h-[200px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full block max-w-full" />
    </div>
  );
}
