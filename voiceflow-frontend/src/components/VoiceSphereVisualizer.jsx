import { useEffect, useRef } from 'react';

export default function VoiceSphereVisualizer({ isPlaying, analyserRef, speed = 1.0, pitch = 1.0 }) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null });
  const clicksRef = useRef([]);
  const positionRef = useRef({ x: 0, y: 0 }); // for smooth interpolation of magnetic center

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

    // Mouse listeners
    const mouseMoveHandler = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) * window.devicePixelRatio;
      mouseRef.current.y = (e.clientY - rect.top) * window.devicePixelRatio;
    };

    const mouseLeaveHandler = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    const clickHandler = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) * window.devicePixelRatio;
      const clickY = (e.clientY - rect.top) * window.devicePixelRatio;
      clicksRef.current.push({
        x: clickX,
        y: clickY,
        radius: 5,
        maxRadius: Math.min(width, height) * 0.45,
        opacity: 0.9,
        color: Math.random() > 0.5 ? 'rgba(168, 85, 247, 0.7)' : 'rgba(99, 102, 241, 0.7)'
      });
    };

    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('mouseleave', mouseLeaveHandler);
    canvas.addEventListener('click', clickHandler);

    let phase = 0;
    let particles = [];

    // Initialize decorative orbit particles
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 45; i++) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          distance: (45 + Math.random() * 45),
          speed: (0.008 + Math.random() * 0.015),
          size: Math.random() * 1.8 + 0.6,
          color: i % 3 === 0 
            ? 'rgba(99, 102, 241, 0.65)' 
            : i % 3 === 1 
              ? 'rgba(168, 85, 247, 0.65)' 
              : 'rgba(236, 72, 153, 0.55)'
        });
      }
    };
    initParticles();

    // Smooth starting positions
    positionRef.current = { x: width / 2, y: height / 2 };

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);

      const targetCenterX = width / 2;
      const targetCenterY = height / 2;

      // Magnetic parallax cursor pull
      let currentCenterX = targetCenterX;
      let currentCenterY = targetCenterY;

      if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
        const dx = mouseRef.current.x - targetCenterX;
        const dy = mouseRef.current.y - targetCenterY;
        // Restrict pull to a small range (15% of offset)
        currentCenterX += dx * 0.15;
        currentCenterY += dy * 0.15;
      }

      // Smooth interpolation for current center coordinates
      positionRef.current.x += (currentCenterX - positionRef.current.x) * 0.12;
      positionRef.current.y += (currentCenterY - positionRef.current.y) * 0.12;

      const centerX = positionRef.current.x;
      const centerY = positionRef.current.y;
      const baseRadius = Math.min(width, height) * 0.22;

      // Draw dark background gradient inside the canvas card
      const radialGlow = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.1, centerX, centerY, baseRadius * 2);
      radialGlow.addColorStop(0, 'rgba(15, 10, 25, 0.2)');
      radialGlow.addColorStop(0.5, 'rgba(10, 6, 18, 0.05)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      phase += 0.04 * speed;

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
        p.angle += p.speed * (isPlaying ? 1.6 : 0.4);
        const radiusMultiplier = isPlaying ? (1 + Math.sin(phase * 0.15 + p.angle) * 0.08) : 1;
        
        let pX = centerX + Math.cos(p.angle) * p.distance * radiusMultiplier * (baseRadius / 60);
        let pY = centerY + Math.sin(p.angle) * p.distance * radiusMultiplier * (baseRadius / 60);

        ctx.beginPath();
        ctx.arc(pX, pY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = isPlaying ? 6 : 2;
        ctx.shadowColor = p.color;
        ctx.fill();
      });
      ctx.shadowBlur = 0; // Reset shadow

      // --- Draw Siri/Apple-Intelligence Fluid Gradient Lava Core ---
      // Overlapping glowing orbs rotating and scaling around center
      const coreOrbs = [
        { angle: phase * 0.6, dist: baseRadius * 0.15, size: baseRadius * 1.5, color: 'rgba(99, 102, 241, 0.45)' },   // Indigo
        { angle: phase * -0.9 + 2, dist: baseRadius * 0.18, size: baseRadius * 1.6, color: 'rgba(168, 85, 247, 0.45)' }, // Purple
        { angle: phase * 0.75 - 1, dist: baseRadius * 0.12, size: baseRadius * 1.4, color: 'rgba(236, 72, 153, 0.38)' }  // Pink
      ];

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      
      coreOrbs.forEach(orb => {
        const oX = centerX + Math.cos(orb.angle) * orb.dist;
        const oY = centerY + Math.sin(orb.angle) * orb.dist;
        
        const sizeScale = isPlaying ? (1 + Math.sin(phase * 1.5) * 0.08) : 1;
        const coreGradient = ctx.createRadialGradient(oX, oY, 0, oX, oY, orb.size * sizeScale);
        
        coreGradient.addColorStop(0, orb.color);
        coreGradient.addColorStop(0.3, orb.color.replace('0.45', '0.2').replace('0.38', '0.18'));
        coreGradient.addColorStop(0.7, orb.color.replace('0.45', '0.04').replace('0.38', '0.03'));
        coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(oX, oY, orb.size * sizeScale, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();
      });
      
      ctx.restore(); // reset blend mode

      // --- Draw Morphing Wave Rings ---
      const rings = [
        { color: 'rgba(99, 102, 241, 0.8)', freqMult: 1.0, radiusOffset: 0, ampMult: 1.0 },   // Indigo
        { color: 'rgba(168, 85, 247, 0.75)', freqMult: 1.4, radiusOffset: -10, ampMult: 0.8 }, // Purple
        { color: 'rgba(236, 72, 153, 0.65)', freqMult: 2.0, radiusOffset: 10, ampMult: 0.6 }   // Pink
      ];

      rings.forEach((ring) => {
        ctx.beginPath();
        ctx.lineWidth = isPlaying ? 3 : 1.5;
        ctx.strokeStyle = ring.color;
        ctx.shadowBlur = isPlaying ? 16 : 4;
        ctx.shadowColor = ring.color;

        const pointsCount = 120;
        
        for (let i = 0; i <= pointsCount; i++) {
          const theta = (i / pointsCount) * Math.PI * 2;
          
          let displacement = 0;
          if (isPlaying) {
            if (frequencyData) {
              const binIndex = Math.floor((i % (pointsCount / 2)) / (pointsCount / 2) * (bufferLength * 0.5));
              const amp = frequencyData[binIndex] / 255.0;
              displacement = amp * 48 * ring.ampMult;
            } else {
              // Advanced noise using layered sinusoids
              const waveVal = Math.sin(theta * 5 * ring.freqMult + phase * 1.5) * 
                              Math.cos(theta * 3 - phase * 0.8) +
                              Math.sin(theta * 10 + phase * 2) * 0.25;
              displacement = waveVal * 18 * ring.ampMult * pitch;
            }
          } else {
            // Idle breathing animation
            displacement = Math.sin(theta * 4 + phase) * 2;
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
      ctx.shadowBlur = 0; // Reset shadow

      // --- Draw Center Ring (Dotted Tech-ring) ---
      const dottedRadius = baseRadius - 20;
      if (dottedRadius > 0) {
        ctx.beginPath();
        ctx.strokeStyle = isPlaying ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.07)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.arc(centerX, centerY, dottedRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash
      }

      // Inner thin ring
      const innerRadius = baseRadius * 0.5;
      if (innerRadius > 0) {
        ctx.beginPath();
        ctx.strokeStyle = isPlaying ? 'rgba(99, 102, 241, 0.35)' : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1.2;
        ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // --- Draw click shockwave ripples ---
      clicksRef.current.forEach((click, idx) => {
        click.radius += (click.maxRadius - click.radius) * 0.08;
        click.opacity -= 0.025;

        if (click.opacity <= 0) {
          clicksRef.current.splice(idx, 1);
        } else {
          ctx.beginPath();
          ctx.strokeStyle = click.color.replace('0.7', click.opacity.toFixed(2));
          ctx.lineWidth = 2.5;
          ctx.arc(click.x, click.y, click.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', resizeHandler);
      canvas.removeEventListener('mousemove', mouseMoveHandler);
      canvas.removeEventListener('mouseleave', mouseLeaveHandler);
      canvas.removeEventListener('click', clickHandler);
    };
  }, [isPlaying, analyserRef, speed, pitch]);

  return (
    <div className="w-full h-full relative min-h-[200px] flex items-center justify-center cursor-pointer select-none">
      <canvas ref={canvasRef} className="w-full h-full block max-w-full" />
    </div>
  );
}
