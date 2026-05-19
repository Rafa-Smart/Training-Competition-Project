export default function Offline() {
  return (
    <div className="offline">
      <p className="offline-msg">📡 No internet connection</p>
      <iframe src="/game.html" title="Offline Game" className="game-frame" />
    </div>
  );
}