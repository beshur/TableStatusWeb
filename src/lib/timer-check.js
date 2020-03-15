const CHECK_INTERVAL = 5000;

class TimerCheck {
  lastFired;
  timer;
  subscribers = [];

  constructor() {
    this.lastFired = Date.now();

    if (typeof window === 'object') {
      this.start()
    }
  }

  start() {
    this.timer = setInterval(() => {
      let now = Date.now();

      if (now - this.lastFired > CHECK_INTERVAL*2) {
        this.onWokeUp();
      }
      this.lastFired = now;
    }, CHECK_INTERVAL);
  }

  onWokeUp() {
    console.log('TimerCheck onWokeUp')
    this.subscribers.forEach(callback => callback());
  }

  isActive() {
    return this.status;
  }

  on(callback) {
    this.subscribers.push(callback);
  }
}

export default new TimerCheck()
