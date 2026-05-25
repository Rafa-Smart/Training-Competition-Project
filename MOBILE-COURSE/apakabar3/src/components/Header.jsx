const Header = (title, showback, onBack)=> {
    return <header>
        {
            showback ? (<button className='btn-back'>{'<-'}</button>) :(<h2>{title}</h2>)
        }
    </header>
}

export default Header;