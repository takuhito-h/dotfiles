function Processor() 
{

    var photoshop = new Photoshop();
    this.Photoshop = photoshop;
    this.SelectedLayers  = null;
    this.SelectedLayersBounds = null;
    this.SelectionBounds = null;    

    this.IsSeparately = typeof IsSeparately !== 'undefined' ? IsSeparately : false;
    
    this.Run = function(targetProcessorName)
    {
        
        var processorName = targetProcessorName;
        if((processorName.substr(-9) == "Processor") == false) processorName += "Processor";
        if(this[processorName] == undefined)    throw (processorName + "Processor is undefined");


        var currentProcessor = new this[processorName]();
        var usingSelection = currentProcessor["UsingSelection"];
        

        if(currentProcessor["IsSeparately"])
        {
            this.IsSeparately = currentProcessor["IsSeparately"];
        }
                
        
        
        this.Document = photoshop.GetActiveDocument();                     
        
        // save ruler units        
        var originalRulerUnits = photoshop.GetRulerUnits(); 
        if(originalRulerUnits != Units.PIXELS) preferences.rulerUnits = Units.PIXELS;

        // save resolution

        
        
        this.SelectionBounds = this.Document.GetSelectionBounds();
        var exception = null;
        
        if(currentProcessor["BeginInitialize"]) 
        {
            try { currentProcessor.BeginInitialize(this); }
            catch(ex) { exception = ex; }
        }
    
        if(usingSelection) 
        {     
            this.SelectedLayers  = this.Document.GetSelectedLayers();;
            if ((this.SelectedLayers == null || this.SelectedLayers.length == 0))
            {
                if(currentProcessor["AcceptsNoneLayers"] != true)
                {
                    throw "Please select one or more layers.";
                }
            }                    
        }
    
        var result = {};
        


        this.Document.Resolution = this.Document.GetResolution();                
 
        if(usingSelection) 
        {
            photoshop.SetLayersPanelVisibility(false);
            try
            {
                this.SelectedLayersBounds = this.Document.GetLayersBounds(this.SelectedLayers, this.IsSeparately == false); 
            }
            catch(ex) { exception = ex; }
            
        }
    
        
        if(exception == null && currentProcessor["Initialize"]) 
        {
            try { currentProcessor.Initialize(this); }
            catch(ex) { exception = ex; }
        }
    
        if(exception == null && currentProcessor["Process"]) 
        {
            activeDocument.suspendHistory("Assistor " + targetProcessorName,  "executeMethod.apply(this)");
            function executeMethod() 
            {                
                try { result.Value = currentProcessor.Process(this); }
                catch(ex) { exception = ex; }                
            }
        }        
                
        if(exception == null && currentProcessor["Finalize"]) currentProcessor.Finalize(this);
        
        if(this.SelectionBounds != EmptyRectangle) this.Document.SetSelectionBounds(this.SelectionBounds, false);
        else this.Document.DeselectSelectionBounds();

        if(exception == null && currentProcessor["IgnoreDescription"] != true)
        {
            try
            {
                result.Description = this.Document.GetSelectedLayerDescriptions(this.SelectedLayers, this.SelectedLayersBounds, this.SelectionBounds);
            }
            catch(ex)
            {
                exception = ex;
            }
            
        }
        
 
             
        if(usingSelection)
        {
            photoshop.SetLayersPanelVisibility(true);
            this.Document.SetSelectedLayers (this.SelectedLayers);
        }


        // restore ruler units
        if(originalRulerUnits != Units.PIXELS) preferences.rulerUnits = originalRulerUnits;                

        if(currentProcessor["Finalize"]) 
        {
            try { currentProcessor.Finalize(this); }
            catch(ex) { exception = ex; }
        }
    

        if(exception != null) throw exception;
      
        return JSONstring.make(result);
        
    }
}
Processor.prototype.DescriptionProcessor = function(owner){}
Processor.prototype.DescriptionProcessor.prototype.UsingSelection = true;
Processor.prototype.DescriptionProcessor.prototype.Process = function(owner) {}

/*
    
Processor.prototype.TestProcessor = function(owner)
{
}
Processor.prototype.TestProcessor.prototype.UsingSelection = true;
Processor.prototype.TestProcessor.prototype.IgnoreDescription = true;
Processor.prototype.TestProcessor.prototype.Initialize = function(owner)
{
}
Processor.prototype.TestProcessor.prototype.Process = function(owner)
{
    var selectedLayers = owner.SelectedLayers;
    var selectedLayersBounds = owner.SelectedLayersBounds;
    var selectionBounds = owner.SelectionBounds;
    alert("DO!");
}
Processor.prototype.TestProcessor.prototype.Finalize = function(owner)
{
}





var processors = new Processor();
processors.Run("Test");

*/