# 字符串

## 1. 字符串反转

```
function test(str = '') {
  // 翻转字符串
  let result = str.split('').reverse().join('')
  return result
}
```

## 2. 判断一个字符串是否是回文字符串

```
function test(str = ''){
  // 先反转字符串
  const reversedStr = str.split('').reverse().join('')
  // 判断反转前后是否相等
  return reversedStr === str
}

function test2(){
  // 也可以对比前后头尾字符，然后指针前移
  let len = str.length
  for (let i = 0; i < len/2; i++) {
    if (str[i] !== str[len - 1 - i]) {
      return false
    }
  }
  return true
}

function test3(){
  let len = str.length
  let i = 0,
    j = len - 1
  while (i < j) {
    if (str[i] !== str[j]) {
      return false
    }
    i++
    j--
  }
  return true
}
```

## 3. 回文字符串变形

真题描述：给定一个非空字符串 s，最多删除一个字符。判断是否能成为回文字符串。

```
输入: "aba"
输出: True
示例 2:
输入: "abca"
输出: True
解释: 你可以删除c字符。
注意: 字符串只包含从 a-z 的小写字母。字符串的最大长度是50000。

```

```
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

```
