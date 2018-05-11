const needleSum = +document.querySelector('.needle .sum .bar').dataset.sum

document.querySelectorAll('.sum .bar').forEach(bar => {
    const sum = +bar.dataset.sum
    const line = document.createElement('div')
    line.className = 'line'
    line.style.width = `${sum / needleSum * 150}px`
    bar.appendChild(line)
})
