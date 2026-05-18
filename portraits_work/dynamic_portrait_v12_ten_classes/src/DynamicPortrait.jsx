
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./DynamicPortrait.css";

export default function DynamicPortrait({
  backgroundSrc,
  cleanCutoutSrc,
  blinkSrc,
  classPreset = "hunter",
  width = 512,
  height = 768,
  particleColor = "255, 216, 120",
  glowIntensity = 0.55,
  animationSpeed = 1,
  floatAmount = 5,
  breathScale = 0.006,
  swayAmount = 0.75,
  blinkShakeAmount = 0.25,
  blinkMinDelay = 2600,
  blinkMaxDelay = 5200,
  blinkDuration = 220,
  eyeX = "44.60%",
  eyeY = "18.90%",
  eyeW = "13.60%",
  eyeH = "4.30%",
  leftChestX = "37.09%",
  leftChestY = "26.90%",
  leftChestW = "4.08%",
  leftChestH = "2.60%",
  rightChestX = "44.37%",
  rightChestY = "25.91%",
  rightChestW = "5.27%",
  rightChestH = "3.62%",
  chestOpacity = 0.72,
  chestBreathScaleX = 0.04,
  chestBreathScaleY = 0.022,
  chestJitter = 0.55,
  enableChestBreath = true,
  className = "",
}) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [blinkShake, setBlinkShake] = useState(false);
  const blinkTimerRef = useRef(null);
  const shakeTimerRef = useRef(null);

  const particles = useMemo(() => {
    return Array.from({ length: 26 }).map((_, index) => ({
      id: index,
      left: 8 + Math.random() * 84,
      top: 6 + Math.random() * 88,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 4,
      duration: 5 + Math.random() * 5,
      drift: -12 + Math.random() * 24,
      opacity: 0.25 + Math.random() * 0.55,
    }));
  }, []);

  useEffect(() => {
    let mounted = true;
    const scheduleBlink = () => {
      const delay = blinkMinDelay + Math.random() * (blinkMaxDelay - blinkMinDelay);
      blinkTimerRef.current = window.setTimeout(() => {
        if (!mounted) return;
        setIsBlinking(true);
        setBlinkShake(true);
        shakeTimerRef.current = window.setTimeout(() => {
          if (!mounted) return;
          setBlinkShake(false);
        }, 100);
        window.setTimeout(() => {
          if (!mounted) return;
          setIsBlinking(false);
          scheduleBlink();
        }, blinkDuration);
      }, delay / animationSpeed);
    };
    scheduleBlink();
    return () => {
      mounted = false;
      if (blinkTimerRef.current) window.clearTimeout(blinkTimerRef.current);
      if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
    };
  }, [animationSpeed, blinkDuration, blinkMaxDelay, blinkMinDelay]);

  const cssVars = {
    "--portrait-w": `${width}px`,
    "--portrait-h": `${height}px`,
    "--particle-rgb": particleColor,
    "--glow-intensity": glowIntensity,
    "--speed": animationSpeed,
    "--float-amount": `${floatAmount}px`,
    "--breath-scale": breathScale,
    "--sway-amount": `${swayAmount}px`,
    "--blink-shake": `${blinkShakeAmount}px`,
    "--eye-x": eyeX,
    "--eye-y": eyeY,
    "--eye-w": eyeW,
    "--eye-h": eyeH,
    "--left-chest-x": leftChestX,
    "--left-chest-y": leftChestY,
    "--left-chest-w": leftChestW,
    "--left-chest-h": leftChestH,
    "--right-chest-x": rightChestX,
    "--right-chest-y": rightChestY,
    "--right-chest-w": rightChestW,
    "--right-chest-h": rightChestH,
    "--chest-opacity": chestOpacity,
    "--chest-breath-scale-x": chestBreathScaleX,
    "--chest-breath-scale-y": chestBreathScaleY,
    "--chest-jitter": `${chestJitter}px`,
  };

  return (
    <div className={`dynamicPortrait dynamicPortrait--preset-${classPreset} ${className}`} style={cssVars} data-preset={classPreset}>
      <img className="dynamicPortrait__background" src={backgroundSrc} alt="background" />
      <div className="dynamicPortrait__magicPulse" />
      <div className="dynamicPortrait__particles" aria-hidden="true">
        {particles.map((p) => (
          <span key={p.id} style={{ left: `${p.left}%`, top: `${p.top}%`, width: `${p.size}px`, height: `${p.size * 2.2}px`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration / animationSpeed}s`, "--drift": `${p.drift}px`, opacity: p.opacity }} />
        ))}
      </div>
      <div className="dynamicPortrait__edgeGlow"><img src={cleanCutoutSrc} alt="" /></div>
      <div className="dynamicPortrait__glow" />
      <div className={`dynamicPortrait__characterRig ${blinkShake ? "is-shaking" : ""}`}>
        <img className="dynamicPortrait__base" src={cleanCutoutSrc} alt="character" />
        <div className={`dynamicPortrait__blinkEyes ${isBlinking ? "is-visible" : ""}`} aria-hidden="true"><img src={blinkSrc} alt="" /></div>
        {enableChestBreath && (
          <>
            <div className="dynamicPortrait__leftChestBreathLayer" aria-hidden="true"><img src={cleanCutoutSrc} alt="" /></div>
            <div className="dynamicPortrait__rightChestBreathLayer" aria-hidden="true"><img src={cleanCutoutSrc} alt="" /></div>
          </>
        )}
        <div className="dynamicPortrait__metalGlints" aria-hidden="true"><span className="glint g1" /><span className="glint g2" /><span className="glint g3" /></div>
      </div>

      <div className="dynamicPortrait__fx dynamicPortrait__fx--mage" aria-hidden="true"><span className="rune r1">✦</span><span className="rune r2">✧</span><span className="rune r3">✦</span><span className="orb o1" /><span className="orb o2" /><span className="arc a1" /><span className="arc a2" /></div>
      <div className="dynamicPortrait__fx dynamicPortrait__fx--priest" aria-hidden="true"><span className="cross c1">✚</span><span className="cross c2">✚</span><span className="cross c3">✚</span><span className="beam b1" /><span className="beam b2" /><span className="feather f1" /><span className="feather f2" /></div>
      <div className="dynamicPortrait__fx dynamicPortrait__fx--hunter" aria-hidden="true"><span className="wind w1" /><span className="wind w2" /><span className="wind w3" /><span className="wind w4" /><span className="leaf l1" /><span className="leaf l2" /><span className="leaf l3" /><span className="leaf l4" /><span className="seed sd1" /><span className="seed sd2" /></div>
      <div className="dynamicPortrait__fx dynamicPortrait__fx--monk" aria-hidden="true"><span className="chiRing cr1" /><span className="chiRing cr2" /><span className="chiRing cr3" /><span className="bead bd1" /><span className="bead bd2" /><span className="bead bd3" /><span className="sweep sw1" /><span className="sweep sw2" /></div>
      <div className="dynamicPortrait__fx dynamicPortrait__fx--assassin" aria-hidden="true"><span className="shadow s1" /><span className="shadow s2" /><span className="shadow s3" /><span className="shard sh1" /><span className="shard sh2" /><span className="shard sh3" /><span className="slash sl1" /><span className="slash sl2" /></div>
      <div className="dynamicPortrait__fx dynamicPortrait__fx--samurai" aria-hidden="true"><span className="petal p1" /><span className="petal p2" /><span className="petal p3" /><span className="petal p4" /><span className="blade bl1" /><span className="blade bl2" /><span className="sunPulse su1" /></div>
      <div className="dynamicPortrait__fx dynamicPortrait__fx--warrior" aria-hidden="true"><span className="ember e1" /><span className="ember e2" /><span className="ember e3" /><span className="ember e4" /><span className="dust d1" /><span className="dust d2" /><span className="dust d3" /><span className="flare fr1" /><span className="flare fr2" /></div>
      <div className="dynamicPortrait__fx dynamicPortrait__fx--shaman" aria-hidden="true"><span className="bolt bo1" /><span className="bolt bo2" /><span className="bolt bo3" /><span className="totem t1" /><span className="totem t2" /><span className="spirit sp1" /><span className="spirit sp2" /></div>
      <div className="dynamicPortrait__fx dynamicPortrait__fx--necromancer" aria-hidden="true"><span className="soul so1" /><span className="soul so2" /><span className="soul so3" /><span className="soul so4" /><span className="ash a1" /><span className="ash a2" /><span className="ash a3" /><span className="bone bn1">☠</span><span className="bone bn2">☠</span></div>
      <div className="dynamicPortrait__fx dynamicPortrait__fx--warlock" aria-hidden="true"><span className="fel ff1" /><span className="fel ff2" /><span className="fel ff3" /><span className="sigil sg1">✶</span><span className="sigil sg2">✶</span><span className="smoke sm1" /><span className="smoke sm2" /><span className="smoke sm3" /></div>
    </div>
  );
}
