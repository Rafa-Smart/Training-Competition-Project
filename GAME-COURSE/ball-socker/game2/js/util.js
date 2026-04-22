function loadImage(path){
    const img = new Image();
    img.src = path;
    return img
}

const semuaGambar = []

function sudahSiap(){
    const semuaSiap = semuaGambar.every((data) => data.complete)
}