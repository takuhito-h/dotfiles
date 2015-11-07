//@include 'WIT.Photoshop.Parameter.jsx'

//@include 'WIT.Photoshop.Common.jsx'
//@include 'WIT.Photoshop.Application.jsx'
//@include 'WIT.Photoshop.Document.jsx'
//@include 'WIT.Photoshop.Processor.jsx'
//@include 'WIT.Photoshop.JSON.jsx'

var isMacOS = $.os.indexOf("Macintosh") == 0;
var isCS6 = new RegExp(/13\.\d+\.\d+/g).test(app.version);
var isCC =  new RegExp(/14\.\d+\.\d+/g).test(app.version) 


var duration = stopWatch(function()
{
    
    var scriptResult = {};
    var processors = new Processor();
    try
    {            
        if(Method != "Description")
        {
            var processorScriptFileName = new File($.fileName).path + "/WIT.Photoshop.Script." + Method + ".jsx";
            $.evalFile(processorScriptFileName);   

        }        
        scriptResult.Result = processors.Run(Method);
        scriptResult.Success = true;    
    }
    catch(ex)
    {
        if($.level == 1)
        {
            alert(ex);
        }
        scriptResult.Success = false;
        scriptResult.Exception = ex.toString();
    }

    // ===============================================================
    //  Write Result Message
    // ===============================================================
    var resultMessage = JSONstring.make(scriptResult);
    var resultFileDescriptor = new File(resultFilePath); 
	resultFileDescriptor.encoding = 'UTF-8';   
    resultFileDescriptor.open('w');
    if(resultMessage != null)  resultFileDescriptor.write(resultMessage);
    resultFileDescriptor.close();
    var notifyFile = new File(notifyFilePath);
    notifyFile.remove();
    
    if($.level == 1)
    {
        alert(resultMessage);
    }


});


