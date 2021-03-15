function test(str = '') {
  if (isHWStr(str)) {
    return true
  }
  let len = str.length
  let i = 0,
    j = len - 1
  index = 0

  while (i < j) {
    if (str[i] !== str[j]) {
      index = i
    }
    i++
    j--
  }
  const strArr = Array.from(str)
  strArr.splice(index, 1)
  return isHWStr(strArr.join(''))

  function isHWStr(str) {
    let result = str.split('').reverse().join('')
    return str === result
  }
}

console.log(test('yeccay'))
