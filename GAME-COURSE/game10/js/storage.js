export class Storage {
  save(pins, conns) {
    localStorage.setItem("pins", JSON.stringify(pins));
    localStorage.setItem("conns", JSON.stringify(conns));
  }

  load() {
    return {
      pins: JSON.parse(localStorage.getItem("pins") || "[]"),
      conns: JSON.parse(localStorage.getItem("conns") || "[]")
    };
  }
}