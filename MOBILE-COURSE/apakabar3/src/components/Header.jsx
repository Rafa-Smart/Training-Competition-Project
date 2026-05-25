const Header = ({title, showback, onBack})=> {
    return <header>
        {
            showback ? (<><button className='btn-back' onClick={() => onBack()}>{'<-'}</button> <p style={{marginLeft:'4px'}}> Article Detail</p></>) :(<p>{title}</p>)
        }
    </header>
}

export default Header;