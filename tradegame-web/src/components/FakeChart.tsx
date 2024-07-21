"use client";
import { useRef, useEffect } from "react";

interface Candle {
  open: number;
  close: number;
  high: number;
  low: number;
}

export default function FakeChart(props: any) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // const GREEN = "#26A69A";
  // const RED = "#EF5350";
  const GREEN = "gray";
  const RED = "black";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let data: Candle[] = [];
    let currentValue = 0;
    const candleWidth = 5;
    const candleSpacing = 1;
    const maxChange = 5;
    const updateInterval = props.updateInterval ?? 100;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 400; // You can adjust this or make it dynamic
    };

    resizeCanvas();

    const numCandles = Math.floor(canvas.width / (candleWidth + candleSpacing));

    function addCandle() {
      let change = 0;
      for (let i = 0; i < 6; i++) {
        change += Math.random() * 2 - 1;
      }
      change /= 6;
      let nextValue = currentValue + change * maxChange;

      let newCandle: Candle = {
        open: currentValue,
        close: nextValue,
        high: Math.max(currentValue, nextValue),
        low: Math.min(currentValue, nextValue),
      };

      data.push(newCandle);

      if (data.length > numCandles) {
        data.shift(); // Remove the oldest candle if we exceed numCandles
      }

      currentValue = nextValue;
    }

    function drawCandlestickChart() {
      if (!canvas || !ctx) return;
      const canvasHeight = canvas.height;
      const canvasWidth = canvas.width;

      // Find min and max values for scaling
      const allValues = data.flatMap((candle) => [candle.high, candle.low]);
      const minValue = Math.min(...allValues);
      const maxValue = Math.max(...allValues);
      const valueRange = maxValue - minValue;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      data.forEach((candle, index) => {
        const x = index * (candleWidth + candleSpacing);

        // Scale values to fit canvas height
        const scaledOpen =
          ((candle.open - minValue) / valueRange) * canvasHeight;
        const scaledClose =
          ((candle.close - minValue) / valueRange) * canvasHeight;
        const scaledHigh =
          ((candle.high - minValue) / valueRange) * canvasHeight;
        const scaledLow = ((candle.low - minValue) / valueRange) * canvasHeight;

        // Draw the wick
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, canvasHeight - scaledHigh);
        ctx.lineTo(x + candleWidth / 2, canvasHeight - scaledLow);
        ctx.strokeStyle = candle.close > candle.open ? GREEN : RED;
        ctx.stroke();

        // Draw the body
        ctx.fillStyle = candle.close > candle.open ? GREEN : RED;
        ctx.fillRect(
          x,
          canvasHeight - Math.max(scaledOpen, scaledClose),
          candleWidth,
          Math.abs(scaledClose - scaledOpen)
        );
      });
    }

    function updateChart() {
      addCandle();
      drawCandlestickChart();
    }

    const intervalId = setInterval(updateChart, updateInterval);

    const handleResize = () => {
      resizeCanvas();
      const newNumCandles = Math.floor(
        canvas.width / (candleWidth + candleSpacing)
      );

      // Adjust data array if necessary
      if (newNumCandles < data.length) {
        data = data.slice(-newNumCandles);
      }

      drawCandlestickChart();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return <canvas ref={canvasRef} {...props} />;
}
