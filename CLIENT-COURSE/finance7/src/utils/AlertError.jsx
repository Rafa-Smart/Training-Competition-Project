import { useEffect, useState } from "react";

export default AlertError = ({ messages }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (messages && messages.length >= 0) {
      setVisible(true);
    }
  }, [messages]);

  return (
    <div style={{ backgroundColor: "red", color: "white" }}>
      <button onClick={(e) => setVisible(false)}></button>
      {messages.map((msg) => (
        <>{msg}</>
      ))}
    </div>
  );
};
