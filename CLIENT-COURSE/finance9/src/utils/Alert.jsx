import { useEffect, useState } from "react"

const AlertError =({messages}) => {
    const [visible, setVisible] = useState(false);
    
    useEffect(() => {
        if( messages&& messages.length != 0){
            setVisible(true);
        }
    },[messages])
    // console.log(messages)
    if(!messages)return null
    return <div style={{backgroundColor:'red', color:'white', borderRadius:'9px', position:'relative'}}>
        <button onClick={() => setVisible(false)} style={{position:'absolute', right:'3px', top:"2px", fontWeight:"bold", }}>X</button>
        {
            messages.map((msg, i) => {
                return <div key={i}>{msg}</div>
            })
        }
    </div>
}

export default AlertError;