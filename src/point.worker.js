import * as ACTIONS from './actions';

const setTimeoutPromise = (cb, delay) =>
  new Promise((resolve) =>
    setTimeout(() => {
      resolve(cb());
    }, delay),
  );

class Point {
  constructor({ width, height }) {
    this.canvas = { width, height };
    this.initialize = this.initialize.bind(this);
    this.setInitialPosition = this.setInitialPosition.bind(this);
    this.updateDestination = this.updateDestination.bind(this);
    this.scheduleMove = this.scheduleMove.bind(this);
  }

  initialize() {
    this.setInitialPosition();
    this.updateDestination();
    this.scheduleMove();
  }

  dispatch(type, payload = null) {
    self.postMessage({ type, payload });
  }

  setInitialPosition() {
    this.color = `hsl(${Math.floor(Math.random() * 360)}, 80%, 40%)`;
    this.x = Math.floor(Math.random() * this.canvas.width);
    this.y = Math.floor(Math.random() * this.canvas.height);
    this.dispatch(ACTIONS.POINT_INITIAL_POSITION, {
      x: this.x,
      y: this.y,
      color: this.color,
    });
  }

  updateDestination() {
    const x = Math.floor(Math.random() * this.canvas.width);
    const y = Math.floor(Math.random() * this.canvas.height);
    this.dest = { x, y };
    this.dispatch(ACTIONS.POINT_NEW_DESTINATION, this.dest);
  }

  scheduleMove() {
    const delay = 1000 * (Math.floor(Math.random() * 5) + 5);
    setTimeoutPromise(() => {
      this.updateDestination();
    }, delay).then(this.scheduleMove);
  }
}

let point = null;

function handleMessage(e) {
  const action = e.data;
  switch (action.type) {
    case ACTIONS.INIT_POINT:
      point = new Point({
        width: action.payload.width,
        height: action.payload.height,
      });
      return point.initialize();
  }
}

self.addEventListener('message', handleMessage);
