# 链表

做链表处理类问题，大家要把握住一个中心思想——处理链表的本质，是处理链表结点之间的指针关系。

- 链表的处理：合并、删除等（删除操作画个记号，重点中的重点！）
- 链表的反转及其衍生题目
- 链表成环问题及其衍生题目

# 1. 链表的合并

真题描述：将两个有序链表合并为一个新的有序链表并返回。新链表是通过拼接给定的两个链表的所有结点组成的。

`输入：1->2->4, 1->3->4 输出：1->1->2->3->4->4`

```
const mergeTwoLists = function(l1, l2) {
  // 定义头结点，确保链表可以被访问到
  let head = new ListNode()
  // cur 这里就是咱们那根“针”
  let cur = head
  // “针”开始在 l1 和 l2 间穿梭了
  while(l1 && l2) {
      // 如果 l1 的结点值较小
      if(l1.val<=l2.val) {
          // 先串起 l1 的结点
          cur.next = l1
          // l1 指针向前一步
          l1 = l1.next
      } else {
          // l2 较小时，串起 l2 结点
          cur.next = l2
          // l2 向前一步
          l2 = l2.next
      }

      // “针”在串起一个结点后，也会往前一步
      cur = cur.next

  }

  // 处理链表不等长的情况
  cur.next = l1!==null?l1:l2
  // 返回起始结点
  return head.next
};
```

## 2. 链表去重

```
const deleteDuplicates = function (head) {
    // 设定 cur 指针，初始位置为链表第一个结点
    let cur = head
    // 遍历链表
    while (cur != null && cur.next != null) {
      // 若当前结点和它后面一个结点值相等（重复）
      if (cur.val === cur.next.val) {
        // 删除靠后的那个结点（去重）
        cur.next = cur.next.next
      } else {
        // 若不重复，继续遍历
        cur = cur.next
      }
    }
    return head
  }
```

## 3. 翻转链表

```
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
const reverseList = function(head) {
    // 初始化前驱结点为 null
    let pre = null;
    // 初始化目标结点为头结点
    let cur = head;
    // 只要目标结点不为 null，遍历就得继续
    while (cur !== null) {
        // 记录一下 next 结点
        let next = cur.next;
        // 反转指针
        cur.next = pre;
        // pre 往前走一步
        pre = cur;
        // cur往前走一步
        cur = next;
    }
    // 反转结束后，pre 就会变成新链表的头结点
    return pre
};
```
