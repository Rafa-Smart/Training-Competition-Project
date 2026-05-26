const Header = ({title, showback, onBack})=> {
    return <header>
        {
            showback ? (<><p className='btn-back' onClick={() => onBack()}>{'<<'}</p> <p style={{marginLeft:'15%', fontWeight:'bold',lineHeight:'30px'}}> Article Detail</p></>) :(<p style={{  fontWeight:'bold',lineHeight:'30px'}}>{title}</p>)
        }
    </header>
}

export default Header;