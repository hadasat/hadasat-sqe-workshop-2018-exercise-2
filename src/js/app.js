import $ from 'jquery';
import {parseCode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parameters = $('#varsValues').val();
        let parsedCode = parseCode(codeToParse,parameters);
        $('#parsedCode').html(print_lines(parsedCode));
        //document.getElementById('parsedCode').innerHTML =parsedCode;
    });
});


const print_lines =(lines)=>
{
    let string= '<p>';
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].color != undefined) {
            if (lines[i].color==='red')
                string+= '<span style="color: red; ">' + lines[i].line + '</span><br>';
            else
                string += '<span style="color: MediumSeaGreen; ">' + lines[i].line + '</span><br>';
        }else
            string += lines[i].line + '<br>';
    }
    return string + '</p>';
};

