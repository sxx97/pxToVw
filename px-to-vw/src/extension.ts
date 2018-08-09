'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "px-to-vw" is now active!');

    
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        vscode.window.showInformationMessage('Hello World!');
    });

    let pxTransformVw = vscode.commands.registerTextEditorCommand('extension.pxToVw', (textEditor:vscode.TextEditor, textEditorEdit:vscode.TextEditorEdit) => {
        
        let regexStr:string = "([0-9]*\\.?[0-9]+)px";

        selectionsTransForm(regexStr, (match:any, value:any, unit:any) => `${pxToVw(value)}vw`, textEditor,textEditorEdit);
    });
    context.subscriptions.push(pxTransformVw);
    context.subscriptions.push(disposable);
}


function pxToVw (px:number):number {
    let _vw:number;
    const config = vscode.workspace.getConfiguration('px-to-vw'),
        maxDecimalsLength = config.get('number-of-decimals-digits') as number,
        ratio: number = config.get("px-per-vw") as number;
    if(ratio === 0) {
        return 0;
    }
    _vw = px / ratio;
    if(_vw % 1 !== 0) {
        _vw =  Number(_vw.toFixed(maxDecimalsLength));
    }
    return _vw;
}

function selectionsTransForm(regeexp:string,transformFn:any,textEditor:vscode.TextEditor,textEditorEdit:vscode.TextEditorEdit) {
    let regexExpG = new RegExp(regeexp, "g");
    const selections = textEditor.selections;
    if (selections.length === 0 || selections.reduce((acc, val) => acc || val.isEmpty), false) { return; }
    let numOcurrences:number = 0;
    selections.forEach((val,key) => {
        for (let i = val.start.line; i <= val.end.line; i++) {
            let start:number;
            let end:number;
                start = (i === val.start.line) ? val.start.character : 0;
                end = (i === val.end.line) ? val.end.character : textEditor.document.lineAt(i).range.end.character;
            
            let text = textEditor.document.lineAt(i).text.slice(start, end);
            const matches = text.match(regexExpG);
            numOcurrences += matches ? matches.length : 0;
            if (numOcurrences == 0) { continue; } // No ocurrences, so it's worth continuing
            const regex = regexExpG;
            //
            const newText = text.replace(regex, transformFn);
            // Replace text in the text file
            const selectionTmp = new vscode.Selection(i, start, i, end);
            textEditorEdit.replace(selectionTmp, newText);
        }
    });
}



export function deactivate() {
}