console.log("BRtoPDF ready")

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){//from background.js
    //message is get_image or get_page_amount
    if(request.message == "get_image"){
        let el;
        let image;
        let timeout = false;
        let getImage = setInterval(()=>{
            //wait until elements exists
            el = document.getElementsByTagName("canvas")[2]
            if(el != undefined){
                //wait until canvas contents exists
                image = el.toDataURL("image/jpeg");
                if(Boolean(image.split(",")[1]) || timeout){
                    clearInterval(getImage);
                    clearTimeout(timeoutTimer);
                    sendResponse(image);
                }
            }
        },100);
        let timeoutTimer = setTimeout(()=>{
            timeout = true;
        },10000);
        return true;
    }else if(request.message == "get_page_amount"){
        let pageAmount = getPageAmount();
        sendResponse(pageAmount);
    }
});

function getPageAmount(){
    //getElementById and read the last part of number
    let pagenum = parseInt(document.getElementsByClassName("page-chip")[0].innerHTML.split("/")[1]);
    console.log("pageamount:", pagenum);
    return pagenum;
}