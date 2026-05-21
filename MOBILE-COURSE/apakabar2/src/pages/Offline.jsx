export default Offline = () => {
    return <div className="offline">
        <h2 className="offline-message">No Internet Connection</h2>
        <iframe src="../../public/game.html" className="ofline-game"></iframe>
    </div>
}