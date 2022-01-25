describe("pow", function() {

    before(() => console.log("테스트를 시작합니다 - 테스트가 시작되기 전"));
    after(() => console.log("테스트를 종료합니다 - 테스트가 종료된 후"));

    beforeEach(() => console.log("단일 테스트를 시작합니다 - 각 테스트 시작 전"));
    afterEach(() => console.log("단일 테스트를 종료합니다 - 각 테스트 종료 후"));

    it("주어진 숫자의 n 제곱", function() {
        // 에러 발생한다면 첫 assert에서 종료함(it 내에서)
        assert.equal(pow(3, 4), 81);
        assert.equal(pow(2, 3), 8);
    });

    // 별 연관이 없다면 분리
    it("3을 네 번 곱하면 81입니다.", function() {
        assert.equal(pow(3, 4), 81);
    });

    // describe 내에 describe가 올 수 있음
    describe("x를 세 번 곱한다.", function() {

        // for문을 이용해 it 여러개 테스트
        function makeTest(x) {
            let expected = x * x * x;
            it(`${x}을/를 세 번 곱하면 ${expected}입니다.`, function () {
                assert.equal(pow(x, 3), expected);
            });
        }

        for (let x = 1; x <= 5; x++) {
            makeTest(x);
        }
    });

    // 예외 케이스도 고려
    it("n이 음수일 때 결과는 NaN입니다.", function() {
        assert.isNaN(pow(2, -1));
    });

    it("n이 정수가 아닐 때 결과는 NaN입니다.", function() {
        assert.isNaN(pow(2, 1.5));
    });

    /**
     * 다양한 assertion
     * assert.equal(value1, value2) – value1과 value2의 동등성을 확인합니다(value1 == value2).
       assert.strictEqual(value1, value2) – value1과 value2의 일치성을 확인합니다(value1 === value2).
       assert.notEqual, assert.notStrictEqual – 비 동등성, 비 일치성을 확인합니다.
       assert.isTrue(value) – value가 true인지 확인합니다(value === true).
       assert.isFalse(value) – value가 false인지 확인합니다(value === false).
     */
});
