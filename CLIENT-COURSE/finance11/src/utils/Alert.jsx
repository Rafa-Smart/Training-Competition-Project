import { useEffect, useState } from "react"

const AlertError = ({messages}) => {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if(messages && messages.length>=0){
            setVisible(true)
        }
    }, [messages])

    if(!visible)return null;

    return <div style={{borderColor:'red', color:"white"}}>
        {
            messages.map((message) =>  <div style={{color:'white'}}>{message}</div>)
        }
    </div>
}

export default AlertError