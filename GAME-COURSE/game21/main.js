class App {
    static LEBAR = 982;
    static TINGGI = 450;
      static Transports = {
    Train: { color: "#33E339", speed: 120, cost: 500, label: "Train" },
    Bus: { color: "#A83BE8", speed: 80, cost: 100, label: "Bus" },
    Airplane: { color: "#000000", speed: 800, cost: 1000, label: "Airplane" },
  };
    constructor(){
        this.ox = 0;
        this.oy = 0;
        this.sox =0;
        this.soy = 0;
        this.dragY = 0;
        this.dragX = 0;
        this.isGrab = false;
        this.scale = 1;
        this.routes = [];
        this.connectFrom = null;
        this.connectTo = null;
        this.connections = [];
        this.pins = []
        this.sortMode = 'fastest';
        this.posisiMap = {};
        this.selectedLine = null

        const  $ = (id) => document.getElementById(id);
        this.mapArea = $('map-area');
        this.mapContainer = $('map-container');
        this.canvas = $('lines-layer');
        this.ctx = this.canvas.getContext('2d');
        this.pinpointsLayer = $('pinpoints-layer');

        this.popAdd = $('popAdd');
        this.formAdd = $('formAdd');
        this.inputName = $('inputName');
        this.closeAdd = $('close-add');


        this.popConnect = $('popConnect');
        this.inputDistance = $('input-distance');
        this.inputMode = $('input-mode');
        this.closeConnect = $('close-connect');
        this.formConnect = $('formConnect')

        this.inputFrom = $('input-from')
        this.inputTo = $('input-to')
        this.btnSearch = $('btn-search')
        this.routeList = $('route-list');
        this.btnRoute = $('btn-route');
        this.panel = $('panel')
        this.load()
        this.fit();
        this.render()
        this.apply();
        this.setup()
    }
    save(){
        localStorage.setItem('pins', JSON.stringify(this.pins));
        localStorage.setItem('connections', JSON.stringify(this.connections))
    }
    load(){
        this.pins = JSON.parse(localStorage.getItem('pins'))||[]
        this.connections = JSON.parse(localStorage.getItem('connections'))||[]
    }
    cancelConnect(){
        this.connectFrom =null;
        this.connectTo = null;
        this.render()
    }
    deletePin(id){
        this.pins = this.pins.filter(pin => pin.id != id);
        this.connections = this.connections.filter(conn => conn.from != id || conn.to != id)
        this.save();
        this.render()
    }
    pinHtml(pin) {
        const connecting = this.connectFrom == pin.id ? 'connecting':'';
        return `
        <div class="pinpoint" data-id='${pin.id}' style='left:${pin.x}px;top:${pin.y}px;'>
            <div class="header-pinpoint ${connecting}">
                <span>${pin.name}</span>
                <img src="./assets/MdiTransitConnectionVariant.svg" alt="" class="btn btn-connect" data-id='${pin.id}'>
                <img src="./assets/MdiTrashCanOutline.svg" alt="" class="btn btn-delete" data-id='${pin.id}'>
            </div>
            <div>
                <img src="./assets/MaterialSymbolsLocationOn.svg" alt="" class="marker">
            </div>
        </div>
        `
    }

    renderPins(){
        let  html = '';
        this.pins.forEach((pin) => html+=this.pinHtml(pin));
        this.pinpointsLayer.innerHTML = html
    }
    render(){
        this.renderPins();
    }
    apply(){
        this.mapContainer.style.transform = `translate(${this.ox}px, ${this.oy}px) scale(${this.scale})`
    };
    fit(){
        const lebar = this.mapArea.clientWidth;
        const tinggi = this.mapArea.clientHeight;
        this.scale = Math.max(lebar/App.LEBAR,tinggi/App.TINGGI);
        this.ox = (lebar-App.LEBAR*this.scale)/2;
        this.oy = (tinggi-App.TINGGI*this.scale)/2
    };
    zoom(clientX, clientY, factor){
        const relative = this.mapArea.getBoundingClientRect();
        const mx = clientX-relative.left;
        const my = clientY-relative.top;
        const px = (mx - this.ox)/this.scale;
        const py = (my - this.oy)/this.scale;
        this.scale = Math.max(0.3, Math.min(15, factor* this.scale));
        this.ox = mx - px * this.scale;
        this.oy = my - py * this.scale; 
        this.apply()
    }
    toMap(e){
        const relative = this.mapArea.getBoundingClientRect();
        return {
            x:(e.clientX - relative.left - this.ox)/this.scale,
            y:(e.clientY - relative.top - this.oy)/this.scale
        }
    }

    addPin(pin){
        this.pins.push({
            id:Date(),
            name:pin.name,
            x:pin.x,
            y:pin.y
        });
        this.save();
        this.render();
    }
    startConnect(id){
        this.connectFrom = this.connectFrom == id ?id:null;
        this.render()
    };
    deleteLine(){
        this.connections = this.connections.filter(conn => conn.id != this.selectedLine );
        this.save()
        this.render();
    }

    offset(from, to, index, total){
        if(total<=1)return{x:0,y:0};
        const s = -(total - 1)* 3 + index*6;
        const dx = Math.abs(from.x + to.x);
        const dy = Math.abs(from.y + to.y);
        if(dx> dy){
            return {x:0,y:s}
        }else {
            return {x:s, y:0}
        }
    };
    findPin(id){
        return this.pins.find(pin => pin.id == id);
    }

    renderLines(){
        this.canvas.width = App.LEBAR;
        this.canvas.height = App.TINGGI;
        this.connections.forEach((conn) => {
            from = this.findPin(conn.from)
            to = this.findPin(conn.to);
            const transportasi = conn.transportasi;
            transportasi.forEach((tran, index) => {
                const off = this.offset(from, to, index, transportasi.length);
                const x1 = from.x + off.x;
                const x2 = to.x + off.x;
                const y1 = from.y + off.y;
                const y2 = to.y + off.y;

                if(this.selectedLine == conn.id){
                    this.ctx.shadowColor = 'rgb(188, 188, 38)';
                    this.ctx.shadowBlur = 6;
                    this.ctx.lineWidth = 5;
                }else {
                    this.ctx.shadowColor = 'transparent';
                    this.ctx.shadowBlur = 1;
                    this.ctx.lineWidth = 1;
                }this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.strokestyle = App.Transports[tran.mode].color;
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
                this.ctx.shadowColor = "transparent";
                this.ctx.font = '12px bold sans-serif';
                this.ctx.fillColor = App.Transports[tran.mode].color;
                this.ctx.textAlign = "center";
                this.ctx.fillText(tran.distance, (x1+x2)/2, (y1+y2)/2)
            })
        })
    }

    findClickedLine(e){
        const posisiMap = this.toMap(e);
        for(let i = 0; i <this.connections.length; i++){
            const transportasi = this.connections.transportasi;
            let from = this.findPin(this.connections[i].from)
            let to = this.findPin(this.connections[i].to)
            for(let j = 0; j <transportasi.length; j ++){
                this.ctx.beginPath();
                this.ctx.moveTo(from.x, from.y);
                this.ctx.lineTo(to.x, to.y);

                if(this.ctx.isPointInStroke(posisiMap.x, posisiMap.y)){
                    return this.connections[i].id
                }
            }
        }
        return null
    }

    submitConnect(distance, mode){
        let is;;
        this.connections.forEach(conn => {
            if(conn.from == this.connectFrom && conn.to == this.connectTo)is=conn
            if(conn.to == this.connectFrom && conn.from == this.connectTo)is=conn
        })
        if(conn){
            let i =false
            this.conn.transportasi.forEach(c => {
                if(c.mode == mode){
                    alert('udah ada. cari lagi!')
                    i = true
                }
                if(!i){
                    conn.transportasi.push({distance:distance, mode:mode})
                }
            })
        }else {
            this.connections.push({
                id:Date(),
                from:this.connectFrom,
                to:this.connectTo,
                transportasi:[{distance:distance, mode:mode}]
            })
        };

        this.cancelConnect();
        this.save();
        this.render()
    }

    findByName(name){
        return this.pins.find(pin => pin.name == name)
    }
    checkSearch(){
        this.pins.forEach((pin) => {
           let from = this.findByName(this.inputFrom)
           let to = this.findByName(this.inputTo)
        })
        this.btnSearch.disabled = !(to && from && from != to);
    }

    showRoute(){
        const sorted = this.routes.sort((a,b) => {
            if(this.sortMode == 'fastest'){
                return a.duration - b.duration
            }else {
                return a.cost-b.cost
            }
        }).slice(0,10);
        let html = '';
        this.sorted.forEach((data, index) => {
            
        })
    }

    pop(element, e){
        element.style.left = e.clientX +10+'px';
        element.style.top = e.clientY -10+'px';
        element.classList.remove('hidden')
    };
    hide(element){
        element.classList.add('hidden')
    }
    setup(){
        const self = this;
        document.addEventListener('wheel', function(e){ 
            e.preventDefault()
            if(!e.ctrlKey)return
            self.zoom(e.clientX, e.clientY, e.deltaY < 0?1.15:0.85)
        }, {passive:false});
        document.addEventListener('keydown', function(e){
            if(!e.ctrlKey)return
            const relative = self.mapArea.getBoundingClientRect();
            if(e.key == "+" || e.key == '='){
                e.preventDefault()
                self.zoom((relative.width + relative.left)/2, (relative.height + relative.top)/2, 1.15)
            }
            if(e.key == "-" || e.key == "_"){
                e.preventDefault();
                self.zoom((relative.width + relative.left)/2, (relative.height + relative.top)/2, 0.85)
            }
        });
        self.mapArea.addEventListener('mousedown', function(e){
            self.isGrab = true;
            self.mapArea.classList.add('grab');
            self.sox = self.ox;
            self.soy= self.oy;
            self.dragX = e.clientX;
            self.dragY = e.clientY;
        })
        document.addEventListener('mousemove', function(e){
            e.preventDefault();
            if(!self.isGrab)return;
            self.ox = self.sox + (e.clientX- self.dragX);
            self.oy = self.soy + (e.clientY - self.dragY);
            self.apply()
        })
        document.addEventListener('mouseup', function(e){
            self.isGrab = false;
            self.mapArea.classList.remove('grab')
        });
        self.mapArea.addEventListener('dblclick', function(e){
            if(e.target.closest('.pinpoint,.popup'))return
            e.preventDefault();
            self.posisiMap = self.toMap(e);
            self.inputName.value = '';
            self.inputName.focus();
            self.pop(self.popAdd, e);
        });

        self.formAdd.onsubmit=function(e){
            e.preventDefault();

            const name = self.inputName.value.trim();
            if(name){
                self.addPin({
                name:name,
                x:self.posisiMap.x,
                y:self.posisiMap.y
            });
            }
            self.hide(self.popAdd)
        };

        self.formConnect.onsubmit= function(e){
            e.preventDefault();
            const distance = self.inputDistance.value.trim();
            const mode = self.inputMode.value;
            if(mode&&distance){
                self.submitConnect(distance, mode);
                self.hide(self.popConnect)
            }
        }
        document.addEventListener('keydown', function(e){
            const input = e.target.closest('input,select');
            if(e.key =='Delete' && !input){
                self.deleteLine();
                return;
            }
            if(e.key == "Escape"){
                self.hide(self.popAdd);
                self.hide(self.popConnect);
                self.cancelConnect();
                self.selectedLine = null;
                self.render()
            }
        });
        document.addEventListener('click', function(e){
            if(self.connectFrom){
                self.cancelConnect();
                return
            }
            if(self.selectedLine){
                self.selectedLine = null;
                self.render();
                return
            }

            const id = self.findClickedLine(e);
            if(id){
                self.selectedLine = id;
                self.render()
            }
        });
        self.pinpointsLayer.addEventListener('click', function(e){
            e.stopPropagation();
            const buttonDelete = e.target.closest('.btn-delete');
            if(buttonDelete){
                self.deletePin(buttonDelete.dataset.id);
                return
            }
            const buttonConnect = e.target.closest('.btn-connect');
            if(buttonConnect){
                self.startConnect(buttonConnect.dataset.id);
                return
                
            };

            const pinpoint = e.target.closest('.pinpoint');
            if(pinpoint && self.connectFrom && pinpoint.dataset.id != self.connectFrom){
                self.inputDistance.value = '';
                self.inputMode.value ='';
                self.connectTo = pinpoint.dataset.id
                self.inputDistance.focus();
                self.pop(self.popConnect, e);
            }
        });
        self.closeAdd.onclick = () => self.popAdd.classList.add('hidden');
        self.closeConnect.onclick = () => self.popConnect.classList.add('hidden')
    }
}

window.onload = () => new App()