# 数组

## 1. 数组招下标，善于用 map，空间换时间

真题描述：给定一个整数数组 nums 和一个目标值 target， 请你在该数组中找出和为目标值的那 两个 整数，并返回他们的数组下标。

```
// 给定 nums = [2, 7, 11, 15], target = 9
// 因为 nums[0] + nums[1] = 2 + 7 = 9 所以返回 [0, 1]

function test(nums, target) {
  if (Object.prototype.toString.call(nums) !== '[object Array]') {
    throw new Error('Type is not an array')
  }
  if (nums.length < 2) {
    return target
  }
  let mob = new Map()
  for (let i = 0, len = nums.length; i < len; i++) {
    if (mob.get(target - nums[i]) !== undefined) {
      return [mob.get(target - nums[i]), i]
    }
    mob.set(nums[i], i)
  }
}

console.log(test([2, 7, 11, 15], 9))

```

## 2. 合并两个有序数组

真题描述：给你两个有序整数数组 nums1 和 nums2，请你将 nums2 合并到 nums1 中，使 nums1 成为一个有序数组。

说明: 初始化 nums1 和 nums2 的元素数量分别为 m 和 n 。 你可以假设 nums1 有足够的空间（空间大小大于或等于 m + n）来保存 nums2 中的元素。

```
输入:
nums1 = [1,2,3,0,0,0], m = 3
nums2 = [2,5,6], n = 3
输出: [1,2,2,3,5,6]
```

```
/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
const merge = function(nums1, m, nums2, n) {
    // 初始化两个指针的指向，初始化 nums1 尾部索引k
    let i = m - 1, j = n - 1, k = m + n - 1
    // 当两个数组都没遍历完时，指针同步移动
    while(i >= 0 && j >= 0) {
        // 取较大的值，从末尾往前填补
        if(nums1[i] >= nums2[j]) {
            nums1[k] = nums1[i]
            i--
            k--
        } else {
            nums1[k] = nums2[j]
            j--
            k--
        }
    }

    // nums2 留下的情况，特殊处理一下
    while(j>=0) {
        nums1[k] = nums2[j]
        k--
        j--
    }
};
```

## 3. 三数求和问题

双指针法能处理的问题多到你想不到。不信来瞅瞅两数求和它儿子——三数求和问题！
俗话说，青出于蓝而胜于蓝，三数求和虽然和两数求和只差了一个字，但是思路却完全不同。

```
真题描述：给你一个包含 n 个整数的数组 nums，判断 nums 中是否存在三个元素 a，b，c ，使得 a + b + c = 0 ？请你找出所有满足条件且不重复的三元组。

注意：答案中不可以包含重复的三元组。

给定数组 nums = [-1, 0, 1, 2, -1, -4]， 满足要求的三元组集合为： [ [-1, 0, 1], [-1, -1, 2] ]

```

#### 思路分析:

三数之和延续两数之和的思路，我们可以把求和问题变成求差问题——固定其中一个数，在剩下的数中寻找是否有两个数和这个固定数相加是等于 0 的。

虽然乍一看似乎还是需要三层循环才能解决的样子，不过现在我们有了双指针法，定位效率将会被大大提升，从此告别过度循环~

（这里大家相信已经能察觉出来双指针法的使用场景了，一方面，它可以做到空间换时间；另一方面，它也可以帮我们降低问题的复杂度。）

双指针法用在涉及求和、比大小类的数组题目里时，大前提往往是：该数组必须有序。否则双指针根本无法帮助我们缩小定位的范围，压根没有意义。因此这道题的第一步是将数组排序：

```
function test(nums) {
  // 用于存放结果数组
  let res = []
  // 给 nums 排序
  nums = nums.sort((a, b) => {
    return a - b
  })
  // 缓存数组长度
  const len = nums.length
  // 注意我们遍历到倒数第三个数就足够了，因为左右指针会遍历后面两个数
  for (let i = 0; i < len - 2; i++) {
    // 左指针 j
    let j = i + 1
    // 右指针k
    let k = len - 1
    // 如果遇到重复的数字，则跳过
    if (i > 0 && nums[i] === nums[i - 1]) {
      continue
    }
    while (j < k) {
      // 三数之和小于0，左指针前进
      if (nums[i] + nums[j] + nums[k] < 0) {
        j++
        // 处理左指针元素重复的情况
        while (j < k && nums[j] === nums[j - 1]) {
          j++
        }
      } else if (nums[i] + nums[j] + nums[k] > 0) {
        // 三数之和大于0，右指针后退
        k--

        // 处理右指针元素重复的情况
        while (j < k && nums[k] === nums[k + 1]) {
          k--
        }
      } else {
        // 得到目标数字组合，推入结果数组
        res.push([nums[i], nums[j], nums[k]])

        // 左右指针一起前进
        j++
        k--

        // 若左指针元素重复，跳过
        while (j < k && nums[j] === nums[j - 1]) {
          j++
        }

        // 若右指针元素重复，跳过
        while (j < k && nums[k] === nums[k + 1]) {
          k--
        }
      }
    }
  }

  // 返回结果数组
  return res
}

console.log(test([-1, 0, 1, 2, -1, -4]))
```
