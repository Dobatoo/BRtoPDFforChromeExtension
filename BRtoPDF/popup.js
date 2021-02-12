let runButton = document.getElementById("runButton");
let extensionReloadButton = document.getElementById("extensionReloadButton");
let tabReloadButton = document.getElementById("tabReloadButton");

function onRunButtonClick(){
    runButton.disabled = true;
    chrome.runtime.sendMessage({message:"run_BRtoPDF"}, function(response){//to background.js start BRtoPDF
        //when BRtoPDF has done
        runButton.disabled = false;
    });
}

function onExtensionReloadButtonClick(){
    chrome.runtime.sendMessage({message:"reload_extension"}, function(response){//to background.js reload this extension
        runButton.disabled = false;
    });
}

function onTabReloadButtonClick(){
    chrome.runtime.sendMessage({message:"reload_tab"}, function(response){//to background.js reload the tab
    });
}

runButton.onclick = onRunButtonClick;
extensionReloadButton.onclick = onExtensionReloadButtonClick;
tabReloadButton.onclick = onTabReloadButtonClick;