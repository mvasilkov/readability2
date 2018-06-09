const resultSum = +document.querySelector('.result .sum .bar').dataset.sum

Array.prototype.slice.call(document.querySelectorAll('.sum .bar')).forEach(function (bar) {
    const sum = +bar.dataset.sum
    const line = document.createElement('div')
    line.className = 'line'
    line.style.width = `${sum / resultSum * 150}px`
    bar.appendChild(line)
})
