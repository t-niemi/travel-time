import { useRef, useEffect } from "react";

interface CanvasInterface {
  draw: (context: HTMLCanvasElement) => void;
  [k: string]: unknown;
}

const Canvas = ({ draw, ...rest }: CanvasInterface) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas instanceof HTMLCanvasElement) {
      draw(canvas);
    }
  }, [draw]);

  return <canvas ref={canvasRef} {...rest} />;
};

export default Canvas;
