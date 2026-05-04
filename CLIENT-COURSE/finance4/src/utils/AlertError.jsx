import { useEffect, useState } from "react";

export default AlertError = ({ messages }) => {

    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if(messages && messages.length > 0){
            setVisible(true);
        }
    }, [messages])

    if(!visible)return null;

  return (
    <>
      <div
        style={{
          border: "red",
          backgroundColor: "rgb(232, 96, 96)",
          color: "white",
        }}
      >
    <button onClick={() => setVisible(false)}></button>

        {messages.map((msg) => (
          <div>{msg}</div>
        ))}

      </div>
    </>
  );
};
