
function preloadImages(array) {
    if (!preloadImages.list) {
        preloadImages.list = [];
    }
    var list = preloadImages.list;
    for (var i = 0; i < array.length; i++) {
        var img = new Image();
        img.onload = function () {
            var index = list.indexOf(this);
            if (index !== -1) {
                // remove image from the array once it's loaded
                // for memory consumption reasons
                list.splice(index, 1);
            }
        }
        list.push(img);
        img.src = array[i];
    }
}

// preloadImages(["https://cdnjs.cloudflare.com/ajax/libs/plupload/3.1.2/jquery.plupload.queue/img/throbber.gif"])


//secondEditor
let secondEditor;

function getEditorCode() {
    // Get the content
    code_ = secondEditor.getValue();
    console.log(code_);
    return code_;
}

async function compileEditorCode() {

    //logs span
    const compileLogs_e = document.getElementById('compileLogs');

    compileLogs_e.innerHTML = "";
    imgContainer = document.createElement('span')
    // imgContainer.innerHTML = `<img src="https://cdnjs.cloudflare.com/ajax/libs/plupload/3.1.2/jquery.plupload.queue/img/throbber.gif" alt="">&nbsp;Compiling`
    imgContainer.innerHTML = `<span class="loader"></span>&nbsp;Compiling`
    compileLogs_e.appendChild(imgContainer)

    let editorCode = getEditorCode();

    let response = await fetch("http://localhost:8003/compile-groovy", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: editorCode }),
    })
    data = await response.json()

    let outputLogs = ""

    let compilerLogs = data.output;
    if (compilerLogs.trim().length == 0) {
        outputLogs = '<span style="color:green;align:left">✔</span>&nbsp;No warnings were thrown';
    } else {
        outputLogs = `
<details>
    <summary>⚠️ Compiler output</summary>
    <p>${compilerLogs}</p>
</details>`
    }

    compileLogs_e.innerHTML = outputLogs
}

function drawCompileBar() {

    // Get all Ace editor containers
    editors_ = document.querySelectorAll('.ace_editor');

    //draw compileToolbar
    compileBar = document.createElement('div');
    compileBar.innerHTML = `

<style>
.compileBarAlertClass {
        background-color: #fcf8e3;
        color: #8a6d3b;
        padding: 10px 15px;
        border: 1px solid #faebcc;
        border-radius: 4px;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);
    }

    .compileBarContainer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .logs {
        flex: 1;
    }


    .buttons {
        grid-area: buttons;
    }

    .logs {
        grid-area: logs;
    }
    
    .loader {
        width: 1em;
        height: 1em;
        border-radius: 50%;
        display: inline-block;
        position: relative;
        border: 0.6em solid;
        border-color: rgba(255, 255, 255, 0.15)  #faebcc;
        box-sizing: border-box;
        animation: rotation 1s linear infinite;
        }

    @keyframes rotation {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    } 
</style>


<div class="compileBarAlertClass" id="compileBarAlertClass">
    <div class="compileBarContainer">
        <div class="logs" id="compileLogs">
            Click "compile" to check for errors
        </div>
        <div class="buttons"><button id="compileButton" onclick="compileEditorCode()">Compile <span style="color:#39FF14">▶</span></button></div>
    </div>
</div>

`

    let secondEditorSection;

    // Access the second editor (index 1, since it's zero-based)
    secondEditor = window.ace.edit(editors_[1]);

    console.log('secondEditor before categorization', secondEditor);


    if (editors_.length < 2) {

        console.log('Second editor does not exist');

        // Access the first editor (index 1, since it's zero-based)
        secondEditor = window.ace.edit(editors_[0]);
        // set target
        secondEditorSection = secondEditor.container.parentNode
        // secondEditorSection.insertBefore(compileBar, secondEditorSection);
        secondEditorSection.parentNode.insertBefore(compileBar, secondEditorSection);

    } else {
        console.log('going with Second editor ');

        // set target
        secondEditorSection = secondEditor.container.parentElement
        secondEditorSection.parentNode.insertBefore(compileBar, secondEditorSection);
    }

    console.log('bhaiyya here is your secondEditor', secondEditor);
    console.log('bhaiyya here is your secondEditorSection', secondEditorSection);

}


function checkForCodeEditor() {

    console.log('in checkForCodeEditor');
    const _compileBar = document.getElementById('compileBarAlertClass');

    if (_compileBar === null) {

        console.log('inside compilebar', _compileBar);
        //check if iworkflow
        editor_title = document.querySelector("#one > div.display-flex.flex-direction-row.width-fill-available.flex-direction-column-important.main-code-block-horizontal-div > div.main-code-block.display-flex.flex-direction-column.main-code-block-horizontal > div > div > code-editor > section > section > section.code-editor-header > div.left-nav-bar > div > span")

        if (editor_title !== null) {
            str = editor_title.innerHTML;
            search = /iworkflow|groovy/i; // Regular expression
            index = str.search(search);

            if (index !== -1) {
                console.log("Found valid code");
                // clearInterval(checkInterval); // Stop checking if you only want to run once
                drawCompileBar();
            } else {
                console.log("iWorkflow/groovy code not found");
            }
        }
    } else {
        console.log('CompileBar already exists - not drawing new one');

    }
}


// Check every 2 seconds
const checkInterval = setInterval(checkForCodeEditor, 2000);