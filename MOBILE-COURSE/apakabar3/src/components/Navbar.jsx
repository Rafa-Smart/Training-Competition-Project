const tabs = [
    {id:'home', title:'Home', 'icon':"❤️"},
    {id:'dicover', title:'Discover', 'icon':"❤️"},
    {id:'bookmark', title:'Bookmark', 'icon':"❤️"},
    {id:'settings', title:'Settings', 'icon':"❤️"},
]

const Navbar = (tab, setTab) => {
    return <div className='navbar' role='navigation' aria-label='main-navigation'>
        {
            tabs.map(({id, title, icon}) => {
                {/* tab nya ini yang lagi aktif atau  ada ya, diamibl dari app.jsx */}
                return <button className={`btn-nav ${tab == id ? 'active':""}`} key={index} onClick={(e) =>{e.preventDefault();setTab(tab)}}>{icon} <span className='btn-nav-title'>{title}</span></button>
            })
        }
    </div>
}

export default Navbar;