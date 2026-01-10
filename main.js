
class LottoBall extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const number = this.getAttribute('number');
    const color = this.getAttribute('color');

    const circle = document.createElement('div');
    circle.classList.add('lotto-number');
    circle.style.backgroundColor = color;
    circle.textContent = number;

    shadow.appendChild(circle);
  }
}

customElements.define('lotto-ball', LottoBall);


const generatorBtn = document.getElementById('generator-btn');
const lottoNumbersContainer = document.getElementById('lotto-numbers-container');

generatorBtn.addEventListener('click', () => {
  lottoNumbersContainer.innerHTML = '';
  const numbers = new Set();
  while(numbers.size < 6) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }

  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3'];

  Array.from(numbers).sort((a,b) => a-b).forEach((number, i) => {
    const lottoBall = document.createElement('lotto-ball');
    lottoBall.setAttribute('number', number);
    lottoBall.setAttribute('color', colors[i]);

    const ball = document.createElement("div");
    ball.classList.add("lotto-number");
    ball.style.backgroundColor = colors[i];
    ball.textContent = number;

    lottoNumbersContainer.appendChild(ball);
  });
});
