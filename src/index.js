import * as ACTIONS from './actions';

class Canvas {
  constructor(config = {}) {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.config = config;

    this.initialize = this.initialize.bind(this);
    this.createPoint = this.createPoint.bind(this);
    this.draw = this.draw.bind(this);
  }

  initialize() {
    this.points = Array(this.config.points || 5)
      .fill(null)
      .map(this.createPoint);
    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let [i, point] of Object.entries(this.points)) {
      if (!point.pos.x || !point.pos.y || !point.dest.x || !point.dest.y)
        continue;

      const xDir = point.dest.x > point.pos.x ? 1 : -1;
      const yDir = point.dest.y > point.pos.y ? 1 : -1;
      const newX =
        point.pos.x + xDir * Math.min(1, Math.abs(point.dest.x - point.pos.x));
      const newY =
        point.pos.y + yDir * Math.min(1, Math.abs(point.dest.y - point.pos.y));

      point.pos.x = newX;
      point.pos.y = newY;

      ctx.beginPath();
      ctx.fillStyle = point.color;
      ctx.arc(newX, newY, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(this.draw);
  }

  createPoint() {
    const worker = new Worker('./point.worker.js');
    const pos = {};
    const dest = {};
    const dispatch = (type, payload = null) => {
      worker.postMessage({ type, payload });
    };

    const point = { worker, pos, dest, dispatch };

    const handleMessage = (e) => {
      const action = e.data;
      switch (action.type) {
        case ACTIONS.POINT_INITIAL_POSITION:
          point.pos.x = action.payload.x;
          point.pos.y = action.payload.y;
          point.color = action.payload.color;
          return;
        case ACTIONS.POINT_NEW_DESTINATION:
          point.dest.x = action.payload.x;
          point.dest.y = action.payload.y;
          return;
      }
    };

    worker.addEventListener('message', handleMessage);

    point.dispatch(ACTIONS.INIT_POINT, {
      width: this.canvas.width,
      height: this.canvas.height,
    });

    return point;
  }
}

const canvas = new Canvas({ points: 50 });
canvas.initialize();
