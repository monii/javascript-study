# call/apply와 데코레이터, 포워딩
자바스크립트는 함수를 다룰 때 탁월한 유연성을 제공한다. 함수는 여기저기 전달도 가능하고, 객체로도 사용이 가능하다. 함수 간에 호출을 어떻게 포워딩 하는지, 함수를 어떻게 데코레이팅 하는지에 알아보자!

### 코드 변경 없이 캐싱 기능 추가하기
CPU를 많이 잡아먹지만 결과는 안정적인 함수 `slow(x)`가 있다고 가정해보자. 여기서 결과가 안정적인 것은 `x` 파라미터에 대한 결과값이 일정하다는 것이다.
`slow(x)`가 자주 호출된다면, 결과를 어딘가에 저장(캐싱)해 재연산에 걸리는 시간을 줄이고 싶을 것이다.
아래 코드에서 래퍼 함수를 만들어 캐싱 기능을 추가해보겠다.
```js
function slow(x) {
  // CPU 집약적인 작업이 여기에 올 수 있습니다.
  console.log(`slow(${x})을/를 호출함`);
  return x;
}

function cachingDecorator(func) {
  let cache = new Map();

  return function(x) {
    if (cache.has(x)) {    // cache에 해당 키가 있으면
      return cache.get(x); // 대응하는 값을 cache에서 읽어옵니다.
    }

    let result = func(x);  // 그렇지 않은 경우엔 func를 호출하고,

    cache.set(x, result);  // 그 결과를 캐싱(저장)합니다.
    return result;
  };
}

slow = cachingDecorator(slow);

console.log( slow(1) ); // slow(1)이 저장되었습니다.
console.log( "다시 호출: " + slow(1) ); // 동일한 결과

console.log( slow(2) ); // slow(2)가 저장되었습니다.
console.log( "다시 호출: " + slow(2) ); // 윗줄과 동일한 결과
```

위와 같이 `cachingDecorator`와 같이 인수로 받은 함수의 행동을 변경시켜주는 함수를 데코레이터라고 한다.
모든 함수를 대상으로 `cachingDecorator`를 호출할 수 있는데, 이때 반환되는 것은 캐싱 래퍼이다. 이를 구현만 하면 편하게 사용 가능하다.

다시 심플하게 정리하자면 `slow`라는 함수와는 별개의 독립된 래퍼 함수 데코레이터가 캐싱 기능을 추가해준 것으로 볼 수 있다.
사용의 이점은 아래와 같다.
* `cachingDecorator`를 재사용 할 수 있다. 원하는 함수 어디에도 `cachingDecorator`를 적용할 수 있다.
* 캐싱 로직이 분리되어 `slow`자체의 복잡성이 증가하지 않습니다.
* 필요하다면 여러 개의 데코레이터를 조합해서 사용할 수 있다.

### 'func.call'를 사용해 컨텍스트 지정하기
위에서 구현한 캐싱 데코레이터는 객체 메서드에 사용하기엔 적합하지 않다.
객체 메서드 `worker.slow()`가 있다고 가정하면 데코레이터 적용 후 제대로 동작하지 않을 것이다.
```js
let worker = {
  someMethod() {
    return 1;
  },

  slow(x) {
    // CPU 집약적인 작업이라 가정
    console.log(`slow(${x})을/를 호출함`);
    return x * this.someMethod(); // (*)
  }
};

// 이전과 동일한 코드
function cachingDecorator(func) {
  let cache = new Map();
  return function(x) {
    if (cache.has(x)) {
      return cache.get(x);
    }
    let result = func(x); // (**)
    cache.set(x, result);
    return result;
  };
}

console.log( worker.slow(1) ); // 기존 메서드는 잘 동작합니다.

worker.slow = cachingDecorator(worker.slow); // 캐싱 데코레이터 적용

console.log( worker.slow(2) ); // 에러 발생!, Error: Cannot read property 'someMethod' of undefined
```
위 코드는 `this.someMethod`에 접근 실패했기 때문에 발생했다.
원인은 `(**)`로 표시한 줄에서 래퍼가 기존 함수 `func(x)`를 호출하면 `this`가 `undefined`가 되기 때문이다.

이를 방지하기 위해선 `this`를 명시적으로 고정해 함수를 호출할 수 있게 해주는 특별한 내장 함수 메서드 `func.call`에 대해 알아보겠다~!
사용법은 아래와 같다.
```js
func.call(context, arg1, arg2, ...)
```
메서드를 호출하면 메서드의 첫 번째 인수가 this, 이어지는 인수가 `func`의 인수가 된 후, `func`이 호출된다.

아래 함수와 메서드를 호출하면 거의동일한 일이 발생하는데 `func.call`에선 `this`가 `obj`로 고정된다.
```js
func(1, 2, 3);
func.call(obj, 1, 2, 3)
```

아래는 다른 예시다
```js
function sayHi() {
  alert(this.name);
}

let user = { name: "John" };
let admin = { name: "Admin" };

// call을 사용해 원하는 객체가 'this'가 되도록 합니다.
sayHi.call( user ); // this = John
sayHi.call( admin ); // this = Admin
```
예시 2
```js
function say(phrase) {
  console.log(this.name + ': ' + phrase);
}

let user = { name: "John" };

// this엔 user가 고정되고, "Hello"는 메서드의 첫 번째 인수가 됩니다.
say.call( user, "Hello" ); // John: Hello
```


위의 케이스를 응용해 래퍼 안에서 `call`을 사용하면 에러가 발생하지 않는다.
```js
let worker = {
  someMethod() {
    return 1;
  },

  slow(x) {
    console.log(`slow(${x})을/를 호출함`);
    return x * this.someMethod(); // (*)
  }
};

function cachingDecorator(func) {
  let cache = new Map();
  return function(x) {
    if (cache.has(x)) {
      return cache.get(x);
    }
    let result = func.call(this, x); // 이젠 'this'가 제대로 전달됩니다.
    cache.set(x, result);
    return result;
  };
}

worker.slow = cachingDecorator(worker.slow); // 캐싱 데코레이터 적용

console.log( worker.slow(2) ); // 제대로 동작합니다.
console.log( worker.slow(2) ); // 제대로 동작합니다. 다만, 원본 함수가 호출되지 않고 캐시 된 값이 출력됩니다.
```
위의 과정을 풀어서 설명하자면
1. 데코레이터를 적용한 후에 `worker.slow`는 래퍼 `function(x) { ... }`가 된다.
2. `worker.slow(2)`를 실행하면 래퍼는 `2`를 인수로 받고, `this=worker`가 된다.(점 앞의 객체!!!)
3. 결과가 캐시되지 않은 상황이라면 `func.call(this, x)에서 현재 `this` (`=worker`)와 인수(`=2`)를 원본 메서드에 전달한다.

### 여러 인수 전달하기
`cachingDecorator`를 좀 더 다채롭게 해보자
아래의 코드를 보자
```js
let worker = {
  slow(min, max) {
    return min + max; // CPU를 아주 많이 쓰는 작업이라고 가정
  }
};

// 동일한 인수를 전달했을 때 호출 결과를 기억할 수 있어야 합니다.
worker.slow = cachingDecorator(worker.slow);
```
네이티브 `맵`은 단일 키만 받는걸 상기하고 해결방법은 여러가지다.
1. 복수 키를 지원하는 맵과 유사한 자료구조 구현하기
2. 중첩 맵을 사용하기. `(max, result)` 쌍 저장은 `cache.set(min)`으로 `result`는 `cache.get(min).get(max)`을 사용해 얻는다.
3. 두 값을 하나로 합치기 `맵`의 키 구성으로 문자열 `"min,max"`를 사용한다. 해싱해서 유연성을 높인다.

세 번째 방법만으로 충분하니 아래를 보자.
추가적으로 `func.call(this, x)`를 `func.call(this, ...arguments)`로 교체해, 래퍼 함수로 감싼 함수가 호출될 때 복수 인수 넘길 수 있도록 한다.
```js
let worker = {
  slow(min, max) {
    alert(`slow(${min},${max})을/를 호출함`);
    return min + max;
  }
};

function cachingDecorator(func, hash) {
  let cache = new Map();
  return function() {
    let key = hash(arguments); // (*)
    if (cache.has(key)) {
      return cache.get(key);
    }

    let result = func.apply(this, arguments); // (**) 여기서 뭔가 바뀜 -> apply

    cache.set(key, result);
    return result;
  };
}

function hash(args) {
  return args[0] + ',' + args[1];
}

worker.slow = cachingDecorator(worker.slow, hash);

console.log( worker.slow(3, 5) ); // 제대로 동작합니다.
console.log( "다시 호출: " + worker.slow(3, 5) ); // 동일한 결과 출력(캐시된 결과)
```

`apply`는 `func`의 `this`를 `context`로 고정해주고, 유사 배열 객체인 `arguments`를 인수로 사용할 수 있게 해준다.
`call`과 `apply`의 문법적 차이는 `call`이 보굿 인수를 따로따로 받는 대신 `apply`는 인수를 유사 배열 객체로 받는다는 점이다.

심플하게 `call(context, ...args) === apply(context, args)` 처럼 보면 된다.
정확하게는 args가 유사배열이나 아니냐의 차이가 있긴 하다.

대부분의 자바스크립트 엔진에서는 `apply`를 최적화하니까 apply를 쓰자.

이렇게 컨텍스트와 함께 인수 전체를 다른 함수에 전달하는 것을 콜 포워딩(call forwarding)이라 한다.

### 데코레이터와 함수 프로퍼티
함수 또는 메서드를 데코레이터로 감싸 대체하는 것은 대체적으로 안전하다.
그런데 원본 함수에 `func.calledCount` 등의 프로퍼티가 있으면 데코레이터를 적용한 함수에선 프로퍼티를 사용할 수 없으므로 안전하지 않다. 
함수에 프로퍼티가 있는 경우엔 데코레이터 사용에 주의해야 한다. 가능한 방법이 있긴 한데 차후 `Proxy`챕터에서 다룬다.

