const tabs = [
    {id:'home', title:'Home', 'icon':"❤️"},
    {id:'discover', title:'Discover', 'icon':"❤️"},
    {id:'bookmark', title:'Bookmark', 'icon':"❤️"},
    {id:'settings', title:'Settings', 'icon':"❤️"},
]

const Navbar = ({tab, setTab}) => {
    return <nav  role='navigation' aria-label='main-navigation'>
        {
            tabs.map(({id, title, icon}) => {
                {/* tab nya ini yang lagi aktif atau  ada ya, diamibl dari app.jsx */}
                return <button className={`btn-nav ${tab == id ? 'active':""}`} key={id} onClick={(e) =>{e.preventDefault();setTab(id)}}>{icon} <span className='btn-nav-title'>{title}</span></button>
            })
        }
    </nav>
}

export default Navbar;