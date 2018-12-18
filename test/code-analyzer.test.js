import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';
//programs
let program_one = 'function foo(x, y, z){\n' +
    '    let a = x + 1 + 0;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '        return x + y + z + c;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '        return x + y + z + c;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '        return x + y + z + c;\n' +
    '    }\n' +
    '}\n';

let program_while = 'function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    while (a < z) {\n' +
    '        c = a + b;\n' +
    '        z = c * 2;\n' +
    '    }\n' +
    '    return z+y;\n' +
    '}\n';
let program_return = 'function foo(x, y, z){\n' +
    '    let a = x * 0;\n' +
    '    return a;\n' +
    '}\n';

let program_array = 'function foo(x, y, z){\n' +
    'let b;' +
    'let a = [x,y];\n' +
    '    if(a[0] < 1)\n' +
    'return 1;\n' +
    'return 2;\n' +
    '}\n';
let input_vector = '{x:2,y:5,z:7}';
let parsed_p_if = parseCode(program_one,input_vector);
let parsed_p_empty = parseCode(program_one,undefined);
let parsed_p_while = parseCode(program_while,input_vector);
let parsed_p_return = parseCode(program_return,input_vector);
let parsed_p_array = parseCode(program_array,input_vector)
let void_p = parseCode('','');

describe('The if program', () => {
    it('check while state length code', () => {
        assert.equal(parsed_p_if.length,10
        );
    });
    it('check the function name stay the same', () => {
        assert.equal(parsed_p_if[0].line,
            'function foo(x, y, z){');
    });
    it('check red line', () => {
        assert.equal(parsed_p_if[1].color,
            'red'
        );
    });
    it('check green line', () => {
        assert.equal(parsed_p_if[3].color,
            'green'
        );
    });
});

describe('The while/empty program', () => {
    it('check empty array', () => {
        assert.equal(parsed_p_empty.length,
            0
        );
    });
});

describe('The while/empty program', () => {
    it('check while state length code', () => {
        assert.equal(parsed_p_while.length,
            7
        );
    });
    it('check while state color', () => {
        assert.equal(parsed_p_while[1].color,
            'green'
        );
    });
    it('check parameter assignment', () => {
        assert.equal(parsed_p_while[2].line,
            '        z = x + 1 + x + 1 + y * 2;'
        );
    });
});

describe('delete assignment lines for variables', () => {
    it('check delete unwanted line by line number', () => {
        assert.notEqual(parsed_p_while.length,
            15
        );
    });
    it('check assignment for variable line', () => {
        assert.notEqual(parsed_p_if[1].line,
            '    let a = x + 1;'
        );
    });
    it('check parameter assignment stay', () => {
        assert.equal(parsed_p_while[2].line,
            '        z = x + 1 + x + 1 + y * 2;'
        );
    });
});

describe('change the valuse of variables', () => {
    it('check assignment for variable line', () => {
        assert.equal(parsed_p_return[1].line,
            '    return x * 0;'
        );
    });
    it('check array replacement', () =>{
        assert.equal( parsed_p_array[1].line,
            '    if(x < 1)'
        );
    });
    it('check array replacement', () =>{
        assert.equal( void_p.line,
            undefined
        );
    });


});
