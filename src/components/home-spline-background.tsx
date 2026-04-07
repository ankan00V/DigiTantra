import Spline from '@splinetool/react-spline/next';

const SCENE_URL = 'https://prod.spline.design/7kdIygTmCYJQiKpC/scene.splinecode';

export function HomeSplineBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-[-8%] scale-[1.08]">
        <Spline scene={SCENE_URL} className="h-full w-full" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_16%,rgba(4,7,20,0.08)_56%,rgba(4,7,20,0.24)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,7,20,0.38)_0%,rgba(4,7,20,0.08)_22%,rgba(4,7,20,0.12)_76%,rgba(4,7,20,0.7)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/55 via-background/12 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background via-background/64 to-transparent" />
    </div>
  );
}
