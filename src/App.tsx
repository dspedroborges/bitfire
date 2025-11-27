import { useRef, useState } from 'react';
import { game } from './game';
import { BsArrowCounterclockwise, BsPlayFill } from 'react-icons/bs';
import { soundEffects } from './soundPool';
import { PRIMARY_COLOR } from './colors';
import { toast, Toaster } from 'sonner';

function App() {
  const canvasRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [playerStats, setPlayerStats] = useState({ points: 0, level: 0 });
  const savedPlayerStats = JSON.parse(String(localStorage.getItem("playerStats"))) ?? playerStats;

  const handleGameover = (points: number, level: number) => {
    toast.warning("Game over!");
    setShowGameOver(true);
    setPlayerStats({ points, level });
    console.log({ points, level });
    console.log(savedPlayerStats);
    if (level > savedPlayerStats.level || (level == savedPlayerStats.level && points > savedPlayerStats.points)) {
      console.log("So I save!");
      localStorage.setItem("playerStats", JSON.stringify({ points, level }));
    }
  }

  const handleMessage = (message: string) => {
    toast.info(message);
  }

  function startGame() {
    toast.info("The game has started");
    setShowGameOver(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    game(canvas, handleGameover, handleMessage);
    setStarted(true);
  }

  return (
    <div className="bg-linear-90 from-neutral-950 to-neutral-800 h-screen w-full">
      <Toaster />
      {/* <audio ref={fireSound} src="/sound_effects/fire.wav" /> */}
      {!started && (
        <div className="z-50 min-h-[250px] w-full lg:w-1/2 text-white rounded-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center border-4 bg-neutral-950" style={{ borderColor: PRIMARY_COLOR }}>
          <div style={{ backgroundColor: PRIMARY_COLOR }} className="mb-4 py-4 w-full flex items-center justify-center gap-2">
            <img src="/images/ship.png" className="w-16 block hover:rotate-12 transition-all" />
            <h1 className="text-white text-5xl font-extrabold text-center orbitron">Bitfire</h1>
          </div>

          <div className="p-4 inter">
            {(savedPlayerStats.points > 0 || savedPlayerStats.level > 0) &&
              <p className="mb-4">Hey, last time you were able to make {savedPlayerStats?.points} points and reach level {savedPlayerStats?.level}!</p>
            }
            <p className="mb-4">Game where you pilot a small ship and tweak binary blocks by shooting them. Each shot flips the digit between 0 and 1. Your goal is to build the sequence that matches the decimal number shown for the level. Move, aim, and flip the blocks until you reach the correct value.
            </p>

            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left rtl:text-right text-white">
                <thead className="text-xs text-white uppercase bg-neutral-800">
                  <tr>
                    <th scope="col" className="px-6 py-3">Key</th>
                    <th scope="col" className="px-6 py-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-neutral-900 border-b border-neutral-700">
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-white whitespace-nowrap"
                    >
                      <kbd className="px-2 py-1.5 text-xs font-semibold text-white bg-neutral-700 border border-neutral-600 rounded-base">
                        A
                      </kbd>
                      <span className="mx-2">and</span>
                      <kbd className="px-2 py-1.5 text-xs font-semibold text-white bg-neutral-700 border border-neutral-600 rounded-base">
                        D
                      </kbd>
                    </th>
                    <td className="px-6 py-4 text-white">To move the spaceship</td>
                  </tr>

                  <tr className="bg-neutral-900 border-b border-neutral-700">
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-white whitespace-nowrap"
                    >
                      <kbd className="px-2 py-1.5 text-xs font-semibold text-white bg-neutral-700 border border-neutral-600 rounded-base">
                        J
                      </kbd>
                      <span className="mx-2">or</span>
                      <kbd className="px-2 py-1.5 text-xs font-semibold text-white bg-neutral-700 border border-neutral-600 rounded-base">
                        Spacebar
                      </kbd>
                    </th>
                    <td className="px-6 py-4 text-white">To shoot</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }} onClick={() => {
              startGame();
              soundEffects.start.play();
            }} className="bg-neutral-950 border-4 px-16 py-2 ouline-0 cursor-pointer hover:bg-neutral-900 text-5xl block mt-4 rounded-xl mx-auto hover:scale-90">
              <BsPlayFill />
            </button>
          </div>

        </div>
      )}

      {
        showGameOver && (
          <div className="z-50 min-h-[250px] w-full lg:w-1/2 text-white rounded-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center border-4 bg-neutral-950" style={{ borderColor: PRIMARY_COLOR }}>
            <div style={{ backgroundColor: PRIMARY_COLOR }} className="mb-4 py-4 w-full flex items-center justify-center gap-2">
              <h1 className="text-white text-5xl font-extrabold text-center orbitron">Game over</h1>
            </div>

            <div className="p-4 inter">
              <p className="mb-4">Hey, that's ok. You were able to make {playerStats.points} points and reach level {playerStats.level}!</p>
              <button style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }} onClick={() => {
                startGame();
                soundEffects.start.play();
              }} className="bg-neutral-950 border-4 px-16 py-2 ouline-0 cursor-pointer hover:bg-neutral-900 text-5xl block mt-4 rounded-xl mx-auto hover:scale-90">
                <BsArrowCounterclockwise />
              </button>
            </div>

          </div>
        )
      }

      <canvas
        ref={canvasRef}
        className={`block bg-black h-screen w-screen ${!started && "opacity-0"}`}
      />
    </div>
  );
}

export default App;