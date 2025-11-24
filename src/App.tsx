import { useRef, useState } from 'react';
import { game } from './game';

function App() {
  const canvasRef = useRef(null);
  const [started, setStarted] = useState(false);

  const handleGameover = () => {
    return "";
  }

  function startGame() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    game(canvas, handleGameover);
    setStarted(true);
  }

  return (
    <>
      {!started && (
        <div className="min-h-[250px] w-full lg:w-1/2 bg-white px-4 py-8 rounded-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center border-4 border-amber-400">
          <h1 className="text-5xl font-extrabold mb-4">Bitfire</h1>
          <p className="mb-4">Game where you pilot a small ship and tweak binary blocks by shooting them. Each shot flips the digit between 0 and 1. Your goal is to build the sequence that matches the decimal number shown for the level. Move, aim, and flip the blocks until you reach the correct value.
          </p>
          <button onClick={startGame} className="bg-green-800 hover:bg-green-900 cursor-pointer p-2 rounded-xl text-white">Start Game</button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="block bg-black h-screen w-screen"
      />
    </>
  );
}

export default App;