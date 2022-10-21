let isDone: boolean = false;
// ES5：var isDone = false;

let count: number = 10;
// ES5：var count = 10;

let list: number[] = [1, 2, 3];
// ES5：var list = [1,2,3];

let list2: Array<number> = [1, 2, 3]; // Array<number>泛型语法
// ES5：var list = [1,2,3];

enum Direction {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  EAST = 'EAST',
  WEST = 'WEST',
}

let dir: Direction = Direction.EAST;

enum Enum {
  A,
  B,
  C,
  D,
}

let value: unknown;

value = true; // OK
value = 42; // OK
value = 'Hello World'; // OK
value = []; // OK
value = {}; // OK
value = Math.random; // OK
value = null; // OK
value = undefined; // OK
value = new TypeError(); // OK
value = Symbol('type'); // OK

let tupleType: [string, boolean | number, number?];
tupleType = ['Semlinker', 1];
tupleType = ['Semlinker', 1, 3];

// Never 类型

function error(message: string): never {
  throw Error();
}

function infiniteLoop(): never {
  while (true) {}
}

// 在 Typescript中，可以利用never类型的特性来实现全面性检查

type Foo = string | number;
// type Foo = string | number | Array<string>;

function controlFlowAnalysisWithNever(foo: Foo) {
  if (typeof foo === 'string') {
    // 这里 foo 被收窄为 string 类型
  } else if (typeof foo === 'number') {
    // 这里 foo 被收窄为 number 类型
  } else {
    // foo 在这里是 never
    const check: never = foo;
  }
}
