class App {
    static LEBAR_MAP = 982;
    static TINGGI_MAP = 450;
    constructor(){
        this.ox = 0;
        this.oy = 0;
        this.sox = 0;
        this.soy = 0;
        this.slale = 1;
        this.dragX = 0;
        this.dragY = 0;
        this.isGrabbing = false;

        const $ = (id) => document.getElementById(id);
        this.mapArea = $('map-area');
        this.mapContainer = $('map-container');
        this.canvas = $('lines-layer');
        this.ctx = this.canvas.getContext('2d');
        this.fit();
        this.apply();
        this.setup();
    }


    fit(){
        const width = this.mapArea.clientWidth;
        const height = this.mapArea.clientHeight;
        this.scale = Math.max(width/App.LEBAR_MAP, height/App.TINGGI_MAP);
        this.ox  = (width-App.LEBAR_MAP*this.scale)/2;
        this.oy = (height-App.TINGGI_MAP * this.scale)/2
    }

    apply(){
        this.mapContainer.style.transform = `translate(${this.ox}px, ${this.oy}px) scale(${this.scale})`
    }
    zoom(clientX, clientY, factor){
        const relative = this.mapArea.getBoundingClientRect();
        const mx = clientX - relative.left;
        const my = clientY -    relative.top;
        const px = (mx - this.ox) / this.scale;
        const py = (my - this.oy) /  this.scale;
        this.scale = Math.max(0.3, Math.min(15, factor*this.scale));
        this.ox = mx - px *this.scale;
        this.oy = my - py *this.scale;
        this.apply()
    }

    setup(){
        const self = this;
        document.addEventListener('wheel', function(e){
            e.preventDefault();
            if(e.button)return;
            self.zoom(e.clientX, e.clientY, e.deltaY <0 ? 1.15:0.85);
        }, {passive:false});

        document.addEventListener('keydown', function(e){
            if(!e.ctrlKey)return;
            const relative = self.mapArea.getBoundingClientRect();
            if(e.key == "+" || e.key == "="){
                e.preventDefault();
                self.zoom((relative.left + relative.width)/2, (relative.top + relative.height)/2, 1.15);
            }
            if(e.key == "-" || e.key == "_"){
                e.preventDefault();
                self.zoom((relative.left + relative.width)/2, (relative.top + relative.height)/2, 0.85);
            }
        });
        document.addEventListener('mousedown', function(e){
            if(e.button)return;
            self.sox = self.ox;
            self.soy = self.oy;
            self.dragX = e.clientX;
            self.dragY = e.clientY;
            self.isGrabbing = true;
        });
        document.addEventListener('mousemove', function(e){
            e.preventDefault()
            if(!self.isGrabbing)return;
            self.mapArea.classList.add('grabbing')
            self.ox = self.sox + (e.clientX-self.dragX );
            self.oy = self.soy + (  e.clientY-self.dragY);
            self.apply();
        })
        document.addEventListener('mouseup', function(e){
            self.isGrabbing = false;
            self.mapArea.classList.remove('grabbing')
        })
    }
}

window.onload = () => new App()