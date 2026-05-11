import { useEffect } from "react";

export default AlertError = ({ messages }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (messages && messages.length >= 0) {
      setVisible(true);
    }
  }, [messages]);
  if (!visible) return;
  return (
    <div style={{ backgroundColor: "red", color: "white" }}>
      <button
        style={{ position: "absolute", top: "4px", right: "2px" }}
        onClick={(e) => setVisible(false)}
      >
        X
      </button>
      {messages.map((e) => (
        <p>{e}</p>
      ))}
    </div>
  );
};
