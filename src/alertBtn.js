import { message } from "./message.js";

const alertBtn = document.createElement('button')
alertBtn.textContent = 'Click Me to Alert!'
alertBtn.addEventListener('click', () => alert(message))

export default alertBtn;