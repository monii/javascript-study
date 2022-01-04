# 심볼형
자바스크립트는 객체 프로퍼티 키로 오직 **문자형과 심볼형**만을 허용.

## 심볼(symbol)
심볼은 **유일한 식별자**(unique identifier)를 만들고 싶을 때 사용

`Symbol()`을 사용해 심볼값을 만들 수 있다.
```javascript
let id = Symbol();      // id는 새로운 심볼
let id2 = Symbol("id")  // 심볼 이름이라 불리는 설명 추가 가능
```
* 설명이 동일한 심볼을 여러 개 만들어도 각 심볼값은 다르다.
  심볼에 붙이는 설명(심볼 이름)은 어떤 것에도 영향을 주지 않는 이름표 역할만 한다.
  ```javascript
  let id1 = Symbol("id");
  let id2 = Symbol("id");
  
  console.log(id1 == id2);
  ```
  <details>
    <summary>결과</summary>
    false
  </details>

> **심볼은 문자형으로 자동 형 변환되지 않는다.**
> 
> 자바스크립트에선 문자형으로의 암시적 형 변환이 비교적 자유롭게 일어나는 편이다.
> alert 함수가 거의 모든 값을 인자로 받을 수 있는 이유가 이 때문이죠.
> 그러나 심볼은 예외입니다.
> 
> ```javascript
> let id = Symbol("id");
> alert(id); // TypeError: Cannot convert a Symbol value to a string
> ```
> 
> 문자열과 심볼은 근본이 다르기 때문에 우연히라도 서로의 타입으로 변환돼선 안 됩니다.
> 자바스크립트에선 '언어 차원의 보호장치(language guard)'를 마련해 심볼형이 다른 형으로 변환되지 않게 막아줍니다.
> 
> 심볼을 반드시 출력해야한다면, `.toString()`메서드를 사용하거나 `symbol.description` 프로퍼티를 이용해 설명을 보여줄 수 있다.
> ```javascript
> let id = Symbol("id");
> alert(id.toString()); // Symbol(id)
> alert(id.description); // id
> ```

## '숨김' 프로퍼티
숨김 프로퍼티 : 외부 코드에서 접근이 불가능하고 값도 덮어쓸 수 없는 프로퍼티.

심볼을 이용하면 ‘숨김(hidden)’ 프로퍼티를 만들 수 있다.

서드파티 코드에서 가지고 온 `user`라는 객체가 여러 개 있고, `user`를 이용해 어떤 작업을 해야 하는 상황이라고 가정해 봅시다.
`user`에 심볼을 이용해 식별자를 붙여주도록 합시다.
```javascript
let user = { // 서드파티 코드에서 가져온 객체
  name: "John"
};

let id = Symbol("id");
user[id] = 1;

console.log( user[id] ); // 심볼을 키로 사용해 데이터에 접근할 수 있습니다.
```
<details>
    <summary>결과</summary>
    1
</details>

#### 문자열 "id"를 키로 사용해도 되는데 Symbol("id")을 사용한 이유??
`user`는 서드파티 코드에서 가지고 온 객체이므로 함부로 새로운 프로퍼티를 추가할 수 없다.
그런데 **심볼은 서드파티 코드에서 접근할 수 없기 때문에**, 심볼을 사용하면 서드파티 코드가 모르게 user에 식별자를 부여할 수 있다.

만약 서드파티 코드(`user`가 처음 만들어진 곳), 현재 작성 중인 스크립트, 제3의 스크립트가 각자 서로의 코드를 모른채 `user`를 식별해야한다면?
* 제3의 스크립트에선 아래와 같이 Symbol("id")을 이용해 전용 식별자를 만들어 사용 가능
    ```javascirpt
        let id = Symbol("id");
        user[id] = "제3 스크립트 id 값";
    ```
  * 심볼은 유일성이 보장되므로 우리가 만든 식별자와 제3의 스크립트에서 만든 식별자가 이름이 같더라도 충돌하지 않는다.
* 문자열 `id`를 사용해 식별자를 만들면 충돌이 발생할 수 있다.
    ```javascirpt
        let user = { name: "John" };
        user.id = "스크립트 id 값";
  
        // 만약 제3의 스크립트가 우리 스크립트와 동일하게 식별자를 만들었다면
        user.id = "제3 스크립트 id 값"
  
        // 의도치 않게 값이 덮어 쓰여서 우리가 만든 식별자는 무의미진다.
    ```

### Symbols in a literal
객체 리터럴 {...}을 사용해 객체를 만든 경우, 대괄호를 사용해 심볼형 키를 만들어야 한다.
* id: 123이라고 하면 문자열 "id"가 키가 된다.
```javascript
let id = Symbol("id");

let user = {
  name: "John",
  [id]: 123 // "id": 123은 안됨
};
```

### 심볼은 for...in에서 배제된다.
키가 심볼인 프로퍼티는 for..in 반복문에서 배제된다.
```javascript
let id = Symbol("id");
let user = {
  name: "John",
  age: 30,
  [id]: 123
};

for (let key in user) console.log(key);

// 심볼로 직접 접근하면 잘 작동합니다.
console.log( "직접 접근한 값: " + user[id] );
```
<details>
    <summary>결과</summary>
    name<br>
    age<br>
    직접 접근한 값: 123
</details>

* `Object.keys(user)`에서도 키가 심볼인 프로퍼티는 배제된다.
  * '심볼형 프로퍼티 숨기기(hiding symbolic property)'라 불리는 이런 원칙 덕분에 외부 스크립트나 라이브러리는 심볼형 키를 가진 프로퍼티에 접근하지 못합니다.
* `Object.assign()`은 키가 심볼인 프로퍼티를 배제하지 않고 객체 내 모든 프로퍼티를 복사한다.
  ```javascript
  let id = Symbol("id");
  let user = {
    [id]: 123
  };
  let clone = Object.assign({}, user);
  console.log( clone[id] );
  ```
  <details>
    <summary>결과</summary>
    123
  </details>
  * 뭔가 모순이 있는 것 같아 보이지만, 이는 의도적으로 설계된 것입니다. 객체를 복사하거나 병합할 때, 대개 id 같은 심볼을 포함한 프로퍼티 전부를 사용하고 싶어 할 것이라는 생각에서 이렇게 설계되었습니다.

## 전역 심볼
심볼은 이름이 같더라도 모두 별개로 취급된다.
그런데 이름이 같은 심볼이 같은 개체를 가리키길 원하는 경우도 가끔 있다.

이 때, **전역 심볼 레지스트리**(global symbol registry)를 사용하면 된다.

전역 심볼 레지스트리 안에 심볼을 만들고 해당 심볼에 접근하면, 이름이 같은 경우 항상 동일한 심볼을 반환한다.

전역 심볼 레지스트리 안에 있는 심볼은 **전역 심볼**이라고 불린다.
애플리케이션에서 광범위하게 사용해야 하는 심볼이라면 전역 심볼을 사용하세요.

### `Symbol.for(key)` : 이름을 이용해 전역 심볼을 찾는다.
* 이름이 `key`인 심볼을 반환
* 조건에 맞는 심볼이 레지스트리에 없으면 새로운 심볼 `Symbol(key)`을 만들고 레지스트리 안에 저장

```javascript
// 전역 레지스트리에서 심볼을 읽습니다.
let id = Symbol.for("id"); // 심볼이 존재하지 않으면 새로운 심볼을 만듭니다.

// 동일한 이름을 이용해 심볼을 다시 읽습니다(좀 더 멀리 떨어진 코드에서도 가능합니다).
let idAgain = Symbol.for("id");

// 두 심볼은 같습니다.
console.log( id === idAgain );
```
<details>
    <summary>결과</summary>
    true
</details>

### `Symbol.keyFor` : 전역 심볼을 이용해 이름을 찾는다.
* 전역 심볼이 아닌 인자가 넘어오면 undefined 반환
* Symbol.for(key)`과 반대
```javascript
// 이름을 이용해 심볼을 찾음
let sym = Symbol.for("name");
let sym2 = Symbol.for("id");

// 심볼을 이용해 이름을 얻음
console.log( Symbol.keyFor(sym) );
console.log( Symbol.keyFor(sym2) );
```
<details>
    <summary>결과</summary>
    name<br>
    id
</details>

> 모든 심볼을 `description` 프로퍼티로 이름을 얻을 수 있다.
> ```javascript
> let globalSymbol = Symbol.for("name");
> let localSymbol = Symbol("name");
> 
> console.log( Symbol.keyFor(globalSymbol) );
> console.log( Symbol.keyFor(localSymbol) );
> 
> console.log( localSymbol.description );
> ```
> <details>
>   <summary>결과</summary>
>   name<br>
>   undefined<br>
>   name
> </details>

## 시스템 심볼
'시스템 심볼(system symbol)'은 자바스크립트 내부에서 사용되는 심볼.

시스템 심볼을 활용하면 객체를 미세 조정할 수 있다.

잘 알려진 심볼(![well-known symbols](https://tc39.es/ecma262/#sec-well-known-symbols)) > 명세서 내의 표에 존재.

객체가 어떻게 원시형으로 변환되는지 알기 위해선 Symbol.toPrimitive에 대해 알아야 하는데, 자세한 내용은 곧 다루도록 하겠습니다.

시스템 심볼 각각에 대한 내용은 연관되는 자바스크립트 기능을 학습하면서 알아보겠습니다.

# 요약
심볼의 주요 유스 케이스
1. 객체의 ‘숨김’ 프로퍼티 
   * 외부 스크립트나 라이브러리에 ‘속한’ 객체에 새로운 프로퍼티를 추가해 주고 싶다면 심볼을 만들고, 이를 프로퍼티 키로 사용하면 됩니다. 키가 심볼인 경우엔 for..in의 대상이 되지 않아서 의도치 않게 프로퍼티가 수정되는 것을 예방할 수 있습니다. 외부 스크립트나 라이브러리는 심볼 정보를 갖고 있지 않아서 프로퍼티에 직접 접근하는 것도 불가능합니다. 심볼형 키를 사용하면 프로퍼티가 우연히라도 사용되거나 덮어씌워 지는 걸 예방할 수 있습니다.
   * 이런 특징을 이용하면 원하는 것을 객체 안에 ‘은밀하게’ 숨길 수 있습니다. 외부 스크립트에선 우리가 숨긴 것을 절대 볼 수 없습니다.
2. 자바스크립트 내부에서 사용되는 시스템 심볼은 Symbol.*로 접근할 수 있습니다. 시스템 심볼을 이용하면 내장 메서드 등의 기본 동작을 입맛대로 변경할 수 있습니다.
   * `Symbol.iterator` : https://ko.javascript.info/iterable
   * `Symbol.toPrimitive` : https://ko.javascript.info/object-toprimitive

사실 심볼을 완전히 숨길 방법은 없습니다. 내장 메서드 Object.getOwnPropertySymbols(obj)를 사용하면 모든 심볼을 볼 수 있고, 메서드 Reflect.ownKeys(obj)는 심볼형 키를 포함한 객체의 모든 키를 반환해줍니다. 그런데 대부분의 라이브러리, 내장 함수 등은 이런 메서드를 사용하지 않습니다.
