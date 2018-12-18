import * as esprima from 'esprima';

var new_code ;
var variable_table;
let return_array;
let parameters_vector;



const parseCode = (codeToParse,parameters) => {
    parameters_vector = parameters;
    return_array = new Array();
    new_code = new Array();
    variable_table = new Array();
    if(parameters != undefined) {
        let code_in_lines = codeToParse.split('\n');
        //initiall all the lines in the code to be regular lines, later the if staetment lines will be signed
        for (let i = 0; i < code_in_lines.length; i++)
            new_code.push({line:code_in_lines[i],color:undefined,delete: false});
        let parseScript = esprima.parseScript(codeToParse,{loc: true});
        parse_start(parseScript);
        for (let i = 0; i < new_code.length; i++) {
            if (!new_code[i].delete)
                return_array.push({line:new_code[i].line ,color: new_code[i].color});
        }
    }
    return return_array;
};

const eval_params = (param_array) => {
    param_array.map (
        (x) => {
            let name = x.name;
            let value = undefined;
            variable_table.push({name:name,value:value,parameter:true});
        });
};

const operator_with_zero = (op,side) =>{
    if(side === 'l' && op ==='+')
        return true;
    else if(side === 'r' && (op ==='-' || op ==='+'))
        return true;
    return false;
};

const eval_array = (code)=>{
    let array_size = code.elements.length;
    let new_array = new Array(array_size);
    for(let i =0; i<array_size;i++){
        let element = eval_the_vars(code.elements[i]);
        new_array[i] = element;
    }
    return new_array;
}

const eval_binary = (value) =>{
    let left,operator,right;
    left = eval_the_vars(value.left);
    operator = value.operator;
    right = eval_the_vars(value.right);
    //delete the zero in equesion
    if(right === 0 && operator_with_zero(operator,'r'))
        return left;
    else if(left === 0 && operator_with_zero(operator,'l'))
        return right;
    return left + ' ' + operator + ' ' + right;
};

const eval_identifier = (value) =>{
    let var_name,new_value;
    var_name = value.name;
    new_value = variable_table.find((x) => x.name === var_name);
    if(new_value != undefined && !new_value.parameter)
        return new_value.value;
    else
        return var_name;
};

const eval_member = (value)=>{
    let var_name = value.object.name;
    let num_in_array =eval_the_vars(value.property);
    let variable = variable_table.find((x) => x.name === var_name);
    return variable.value[num_in_array];
}

const eval_the_vars = (value) =>{
    switch (value.type) {
    case 'BinaryExpression':
        return eval_binary(value);
    case 'Identifier':
        return eval_identifier(value);
    case 'Literal':
        return value.value;
    case  'ArrayExpression':
        return eval_array(value);
    case 'MemberExpression':
        return eval_member(value);


    }
};

const eval_variables = (param_array) => {
    param_array.map (
        (x) => {
            let location = x.loc.start.line - 1;
            let name = x.id.name;
            let value;
            if(x.init != undefined) {
                value = eval_the_vars(x.init);
                let start_arg = x.init.loc.start.column;
                let end_arg = x.init.loc.end.column;
                let start_line = new_code[location].line.substring(0, start_arg);
                let end_line = new_code[location].line.substring(end_arg);
                let new_line = start_line + value + end_line;
                new_code[location] = {line: new_line, color: undefined,delete:true};}
            else
                value = undefined;
            variable_table.push({name:name,value:value,parameter:false});
        });
};


const eval_function_decleration = (code) => {
    eval_params(code.params);
    parse_start(code.body);
};

const eval_block_statement = (statment_array) => {
    statment_array.map (
        (x) => {
            parse_start(x);
        }
    );

};

const eval_expression_statement = (code) =>{
    let location,var_name,value,item_index,new_line,start_exp,end_exp,start_line,end_line;
    switch (code.type) {
    case 'AssignmentExpression':
        location = code.loc.start.line - 1;
        value = eval_the_vars(code.right);
        start_exp = code.right.loc.start.column;
        var_name = code.left.name;
        end_exp = code.right.loc.end.column;
        start_line = new_code[location].line.substring(0,start_exp);
        end_line = new_code[location].line.substring(end_exp);
        new_line = start_line + value + end_line;
        item_index = variable_table.findIndex((x) => x.name === var_name);
        if(variable_table[item_index].parameter)
        {
            new_code[location] = {line:new_line,color:undefined,delete:false};
            variable_table[item_index] = {name:var_name,value:value,parameter:true};
        }
        else {
            new_code[location] = {line: new_line, color: undefined, delete: true};
            variable_table[item_index] = {name: var_name, value: value, parameter: false};
        }
        break;
    }};
const eval_color_condition = (test,line,location) =>{
    let parameter_object = eval( '(' + parameters_vector+ ')' );
    let values = Object.values(parameter_object);
    let keys = Object.keys(parameter_object);
    let to_eval = '';
    for(var i = 0; i < keys.length; i ++)
        to_eval +='var '+ keys[i] + '=' +values[i] + ';';
    let y = to_eval + test +';';
    let if_green = eval(y);
    if(if_green)
        new_code[location] = {line:line,color:'green'};
    else
        new_code[location] = {line:line,color:'red'};
};

const eval_condition = (code) => {
    let location = code.loc.start.line -1;
    let start_cond = code.test.loc.start.column;
    let end_cond = code.test.loc.end.column;
    let new_test = eval_the_vars(code.test);
    let start_line = new_code[location].line.substring(0,start_cond);
    let end_line = new_code[location].line.substring(end_cond);
    let new_line = start_line + new_test + end_line;
    //line in green or red
    if(code.type === 'WhileStatement'){
        eval_color_condition(new_test,new_line,location);
        parse_start(code.body);}
    else {
        let save_vars = [...variable_table];
        eval_color_condition(new_test,new_line,location);
        parse_start(code.consequent);
        variable_table = [...save_vars];
        parse_start(code.alternate);
        variable_table = [...save_vars];
    }
};


const eval_return_statement = (code) =>{
    let location = code.loc.start.line - 1;
    let start_value = code.argument.loc.start.column;
    let end_value = code.argument.loc.end.column;
    let new_return = eval_the_vars(code.argument);
    let start_line = new_code[location].line.substring(0,start_value);
    let end_line = new_code[location].line.substring(end_value);
    let new_line = start_line + new_return + end_line;
    new_code[location] = {line:new_line,color:undefined};
};

const parse_start = (code) => {
    if (code != undefined) {
        switch (code.type) {
        case 'Program' :
            code.body.map((x) => parse_start(x));
            break;
        case 'FunctionDeclaration' :
            eval_function_decleration(code);
            break;
        case 'BlockStatement' :
            eval_block_statement(code.body);
            break;
        default :
            parsed_vars(code);

        }
    }

};

const parsed_vars = (code) => {
    switch (code.type) {
    case 'VariableDeclaration' :
        eval_variables(code.declarations);
        break;
    case 'ExpressionStatement' :
        eval_expression_statement(code.expression);
        break;
    default :
        parse_loops(code);
        break;
    }
};

const parse_loops = (code) => {
    switch (code.type) {
    case 'WhileStatement' :
        eval_condition(code);
        break;
    case 'IfStatement' :
        eval_condition(code);
        break;
    case 'ReturnStatement' :
        eval_return_statement(code);
        break;
    }

};




export {parseCode};
