import { useEffect, useState } from "react";

export default AlertError = ({ messages }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (messages && messages.length > 0) {
      setVisible(true);
    }
  }, [visible, messages]);

  if (!visible) return null;

  return (
    <div
      style={{
        backgroundColor: rgba(231, 74, 6, 0.5),
        border: rgba(180, 3, 3, 0.5),
        color: "white",
      }}
    >
      <button onClick={() => setVisible(false)}>X</button>
      {messages.map((err, i) => {
        return <div key={i}>{err}</div>;
      })}
    </div>
  );
};
