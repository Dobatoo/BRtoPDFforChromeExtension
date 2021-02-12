//load jsPDF
let el = document.createElement("script");
el.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.2.0/jspdf.umd.min.js";
document.head.appendChild(el);

//initialize extension
chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function (){
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {hostEquals: 'bookroll.let.media.kyoto-u.ac.jp'},
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

//main
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){//from popup.js

    let pageAmount = undefined;
    let imgList = undefined;
    let currentPageNum = undefined;
    let targetURL = undefined;

    if(message.message == "run_BRtoPDF"){//when run BRtoPDF button pushed
        chrome.tabs.query( { active:true, currentWindow:true }, function(tabs){
            currentPageNum = 0;
            targetURL = tabs[0].url;

            //get page amount
            chrome.tabs.sendMessage(tabs[0].id, {message:"get_page_amount"}, function(responsenum){//to contents.js
                pageAmount =　responsenum;
                imgList = new Array(pageAmount);
                //set url to the first page
                toNextPage(targetURL, currentPageNum , tabs[0].id);
            });

            //get image
            chrome.tabs.onUpdated.addListener(function updated(tabId, changeInfo, tab){
                if(tabId == tabs[0].id & changeInfo.status == "complete"){
                    chrome.tabs.sendMessage(tabs[0].id, {message:"get_image"}, function(response){//to contents.js
                        //image loading here
                        let im = new Image();
                        im.src = response;
                        im.onload = function(){
                            //progress
                            console.log("Progress: " + (currentPageNum + 1) + "/" + pageAmount);
                            if(currentPageNum < pageAmount){
                                imgList[currentPageNum] = im;
                            }
                            if(currentPageNum < pageAmount - 1){
                                currentPageNum++;
                                toNextPage(targetURL, currentPageNum , tabs[0].id);
                            }else{//(currentPageNum >= pageAmount - 1)
                                imgListtoPDF(imgList);
                                //erase all data
                                delete pageAmount;
                                delete imgList;
                                delete currentPageNum;
                                delete targetURL;
                                chrome.tabs.onUpdated.removeListener(updated);
                                sendResponse("BRtoPDF done!");
                            }
                        }
                    });
                }
            });
        });
    }else if(message.message == "reload_extension"){//when reload extension button pushed
        sendResponse("Extension Reloaded!");
        chrome.runtime.reload();
    }else if(message.message == "reload_tab"){//when reload tab button pushed
        chrome.tabs.query( { active:true, currentWindow:true }, function(tabs){
            chrome.tabs.reload(tabs[0].id, {},()=>{//to the tab
                sendResponse("Tab Reloaded!");
            });
        });
    }
    return true;
});

function toNextPage(currentURL,currentPageNum , targetTabId){
    let nextURL = currentURL.split("/");
    nextURL[6] = currentPageNum + 1;
    nextURL = nextURL.join("/");
    chrome.tabs.update(targetTabId, {url: nextURL}, (t)=>{
    });
}

function imgListtoPDF(imgList){
    let pdf=undefined;
    for(let i = 0; i < imgList.length; i++){
        let im = imgList[i]
        let o;//orientation
        if (im.width <= im.height){
            o = 'p';
        }else{
            o = 'l';
        }

        if(i == 0){
            pdf = new jspdf.jsPDF( o, 'px', [im.width, im.height])
        }else{
            pdf.addPage([im.width, im.height], o);
        }

        pdf.addImage(im, 'JPEG', 0, 0, im.width, im.height);
    }

    pdf.save("download_from_BR.pdf");

    console.log("BRtoPDf done. Downloaded?");
}