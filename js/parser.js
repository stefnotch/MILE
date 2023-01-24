import {singleChar, leftOne, leftOneChar, leftTwo, operators, 
        middleTwo, middleTwoChar} from "./constants.js"
import {isAlpha} from "./helper.js"

// Return 2 wide integer array
function functionPositionAndInputs(functionNameString) {
    if (singleChar.hasOwnProperty(functionNameString)){
        return [0, 0]; // Right and 0 arguments
    }
    if (
        leftOne.hasOwnProperty(functionNameString) ||
        leftOneChar.hasOwnProperty(functionNameString) ||
        operators.hasOwnProperty(functionNameString)
    ){
        return [0, 1]; // Right and 1 arguments
    }
    if (leftTwo.hasOwnProperty(functionNameString)){
        return [0, 2]; // Right and 2 arguments
    }
    if (operators.hasOwnProperty(functionNameString.slice(0, -1))){
        if (
            functionNameString.slice(-1) == "o" ||
            functionNameString.slice(-1) == "u"
        ){
            return [0, 2]; // Right and 2 arguments
        }
        if (functionNameString.slice(-1) == "b"){
            return [0, 3]; // Right and 3 arguments
        }
    }
    if (
        middleTwo.hasOwnProperty(functionNameString) ||
        middleTwoChar.hasOwnProperty(functionNameString)
    ){
        return [1, 2]; // Middle and 2 arguments
    }
    return [-1, -1];
}

export function parse(segmentString){
    let tokens              = [];
    let currentFuncStart    = -1;
    let currentGroupStart   = -1;
    let currentSubStart     = -1;
    let semicolSegments     = 0;
    let shownSegments       = 0;
    let isFunction          = [-1, -1];
    let currentChar         = "";

    for (let index = 0; index < segmentString.length; ++index){
        currentChar = segmentString[index];
        if (isAlpha(currentChar) && (shownSegments + semicolSegments == 0)){
            if (currentGroupStart == -1){ currentGroupStart = index; }
            if (currentFuncStart == -1){ 
                currentFuncStart = index; 
            } else {
                isFunction = functionPositionAndInputs(segmentString.substring(currentFuncStart, index + 1));
                if (isFunction[1] != -1){
                    if (currentGroupStart != currentFuncStart){
                        tokens.push([2, segmentString.substring(currentGroupStart, currentFuncStart)]);
                    }
                    if (index + 1 == segmentString.length){
                        tokens.push([0, segmentString.substring(currentFuncStart, index + 1), isFunction[0], isFunction[1]]);
                        currentGroupStart = -1;
                        continue;
                    }
                    if (!isAlpha(segmentString[index + 1])){
                        tokens.push([0, segmentString.substring(currentFuncStart, index + 1), isFunction[0], isFunction[1]]);
                        currentGroupStart = -1;
                    }
                }
            }
            continue;
        }
        switch (currentChar) {

        case " ":
            if ((currentGroupStart != -1) && (shownSegments + semicolSegments == 0)){
                tokens.push([2, segmentString.substring(currentGroupStart, index)]);
                currentGroupStart = -1;
            }
            currentFuncStart = -1;
            continue;
        case "(":
        case "[":
        case "{":
            if ((currentGroupStart != -1) && (shownSegments + semicolSegments == 0)){ 
                tokens.push([2, segmentString.substring(currentGroupStart, index)]);
                currentGroupStart = -1;
            }
            shownSegments++;
            if (currentSubStart == -1) { currentSubStart = index; }
            continue;
        case ")":
        case "]":
        case "}":
            if (shownSegments > 0){
                shownSegments--;
                if ((shownSegments == 0) && (shownSegments + semicolSegments == 0)){
                    tokens.push([1, segmentString.substring(currentSubStart, index + 1)]);
                    currentSubStart   = -1;
                    currentGroupStart = -1;
                }
            }
            continue;
        case ";":
            if (index + 1 < segmentString.length){
                if (segmentString[index + 1] == ";"){
                    if (semicolSegments == 1){
                        tokens.push([1, segmentString.substring(currentSubStart, index + 2)]);
                        currentSubStart   = -1;
                        currentGroupStart = -1;
                        --semicolSegments;
                        ++index;
                    } else if (semicolSegments > 0){
                        --semicolSegments;
                        ++index;
                    }
                }
                else {
                    if ((currentGroupStart != -1) && (shownSegments + semicolSegments == 0)){ 
                        tokens.push([2, segmentString.substring(currentGroupStart, index)]);
                        currentGroupStart = -1;
                    }
                    if (currentSubStart == -1) { currentSubStart = index; }
                    semicolSegments++;
                }
            }
            continue;
        default:
            isFunction = functionPositionAndInputs(currentChar);
            if ((isFunction[1] != -1) && (shownSegments + semicolSegments == 0)){
                if (currentGroupStart != -1){ 
                    tokens.push([2, segmentString.substring(currentGroupStart, index)]);
                }
                currentGroupStart = -1;
                tokens.push([0, segmentString.substring(index, index + 1), isFunction[0], isFunction[1]]);
            } else if ((currentGroupStart == -1) && (shownSegments + semicolSegments == 0)) {
                currentGroupStart = index;
            }
            continue;
        }
    }
    if (currentSubStart != -1){ 
        tokens.push([1, segmentString.substring(currentSubStart, segmentString.length)]);
    } else if (currentGroupStart != -1){ 
        tokens.push([2, segmentString.substring(currentGroupStart, segmentString.length)]);
    }

    return tokens;
}