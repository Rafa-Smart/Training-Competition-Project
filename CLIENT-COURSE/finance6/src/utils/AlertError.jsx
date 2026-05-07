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
        backgroundColor: "rgb(183, 68, 36)",
        border: "red",
        color: "white",
      }}
    >
      <button onClick={() => setVisible(false)}>X</button>
      {messages.map((msg) => (
        <div>{msg}</div>
      ))}
    </div>
  );
};
