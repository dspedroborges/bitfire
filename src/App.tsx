import { useRef, useState } from 'react';
import { game } from './game';
import { BsPlayFill } from 'react-icons/bs';
import { soundEffects } from './soundPool';

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
      {/* <audio ref={fireSound} src="/sound_effects/fire.wav" /> */}
      {!started && (
        <div className="min-h-[250px] w-full lg:w-1/2 bg-white rounded-xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center border-4 border-amber-400">
          <h1 className="text-5xl font-extrabold mb-4 bg-amber-400 py-4 block w-full text-center orbitron">Bitfire</h1>

          <div className="p-4 inter">
            <p className="mb-4">Game where you pilot a small ship and tweak binary blocks by shooting them. Each shot flips the digit between 0 and 1. Your goal is to build the sequence that matches the decimal number shown for the level. Move, aim, and flip the blocks until you reach the correct value.
            </p>

            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left rtl:text-right text-body">
                <thead className="text-xs text-body uppercase bg-neutral-tertiary">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Key
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-neutral-primary border-b border-default">
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-body whitespace-nowrap"
                    >
                      <kbd className="px-2 py-1.5 text-xs font-semibold text-heading bg-neutral-tertiary border border-default-medium rounded-base">
                        A
                      </kbd>
                      <span className="mx-2">and</span>
                      <kbd className="px-2 py-1.5 text-xs font-semibold text-heading bg-neutral-tertiary border border-default-medium rounded-base">
                        D
                      </kbd>
                    </th>
                    <td className="px-6 py-4">To move the spaceship</td>
                  </tr>
                  <tr className="bg-neutral-primary border-b border-default">
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-body whitespace-nowrap"
                    >
                      <kbd className="px-2 py-1.5 text-xs font-semibold text-heading bg-neutral-tertiary border border-default-medium rounded-base">
                        J
                      </kbd>
                      <span className="mx-2">or</span>
                      <kbd className="px-2 py-1.5 text-xs font-semibold text-heading bg-neutral-tertiary border border-default-medium rounded-base">
                        Spacebar
                      </kbd>
                    </th>
                    <td className="px-6 py-4">
                      To shoot
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button onClick={() => {
              startGame();
              soundEffects.start.play();
            }} className="bg-gray-900 text-amber-400 border-4 border-amber-400 px-16 py-2 ouline-0 cursor-pointer hover:bg-gray-950 text-5xl block mt-4 rounded-xl mx-auto">
              <BsPlayFill />
            </button>
          </div>

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