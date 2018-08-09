'use strict';
exports.__esModule = true;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require("vscode");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    console.log('Congratulations, your extension "px-to-vw" is now active!');
    var disposable = vscode.commands.registerCommand('extension.sayHello', function () {
        vscode.window.showInformationMessage('Hello World!');
    });
    var pxTransformVw = vscode.commands.registerTextEditorCommand('extension.pxToVw', function (textEditor, textEditorEdit) {
        var regexStr = "([0-9]*\\.?[0-9]+)px";
        selectionsTransForm(regexStr, function (match, value, unit) { return pxToVw(value) + "vw"; }, textEditor, textEditorEdit);
    });
    context.subscriptions.push(pxTransformVw);
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function pxToVw(px) {
    var _vw;
    var config = vscode.workspace.getConfiguration('px-to-vw'), maxDecimalsLength = config.get('number-of-decimals-digits'), ratio = config.get("px-per-vw");
    if (ratio === 0) {
        return 0;
    }
    _vw = px / ratio;
    if (_vw % 1 !== 0) {
        _vw = Number(_vw.toFixed(maxDecimalsLength));
    }
    return _vw;
}
function selectionsTransForm(regeexp, transformFn, textEditor, textEditorEdit) {
    var regexExpG = new RegExp(regeexp, "g");
    var selections = textEditor.selections;
    if (selections.length === 0 || selections.reduce(function (acc, val) { return acc || val.isEmpty; }), false) {
        return;
    }
    var numOcurrences = 0;
    selections.forEach(function (val, key) {
        for (var i = val.start.line; i <= val.end.line; i++) {
            var start = void 0;
            var end = void 0;
            start = (i === val.start.line) ? val.start.character : 0;
            end = (i === val.end.line) ? val.end.character : textEditor.document.lineAt(i).range.end.character;
            var text = textEditor.document.lineAt(i).text.slice(start, end);
            var matches = text.match(regexExpG);
            numOcurrences += matches ? matches.length : 0;
            if (numOcurrences == 0) {
                continue;
            } // No ocurrences, so it's worth continuing
            var regex = regexExpG;
            //
            var newText = text.replace(regex, transformFn);
            // Replace text in the text file
            var selectionTmp = new vscode.Selection(i, start, i, end);
            textEditorEdit.replace(selectionTmp, newText);
        }
    });
}
function deactivate() {
}
exports.deactivate = deactivate;
