



function Photoshop() {
    
    
    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putProperty(typeID("Prpr"), typeID("PbkO"));
    ref.putEnumerated(typeID("capp"), typeID("Ordn"), typeID("Trgt"));
    desc.putReference(typeID("null"), ref );
    
    var pdesc = new ActionDescriptor();
    pdesc.putEnumerated(typeID("performance"), typeID("performance"), typeID("accelerated"));    
    desc.putObject(typeID("T   "), typeID("PbkO"), pdesc );
    executeAction(typeID("setd"), desc, DialogModes.NO);
    
}

Photoshop.prototype.SetPanelVisibility = function(panelName, visible)
{
    try {
        var desc = new ActionDescriptor();
        var ref = new ActionReference(); 
        ref.putName( stringIDToTypeID( "classPanel" ), panelName ); 
        desc.putReference( charIDToTypeID( "null" ), ref ); 
        executeAction( stringIDToTypeID( visible ? "show" : "hide"), desc, DialogModes.NO );  
    }
    catch(ex)
    {
    }
        
 
}

Photoshop.prototype.SetLayersPanelVisibility = function(visible)
{
    this.SetPanelVisibility('panelid.static.layers', visible);    
}


Photoshop.prototype.GetActiveDocument = function(){

    return new Document(this, this.GetActiveDocumentId());        
    
};

Photoshop.prototype.GetActiveDocumentId = function(){

    try {        
        var documentReference = new ActionReference();
        documentReference.putProperty(typeID("Prpr"), typeID("DocI"));
        documentReference.putEnumerated(typeID("Dcmn"), typeID("Ordn"), typeID("Trgt"));
        var documentDescriptor = executeActionGet(documentReference);
        return documentDescriptor.getInteger(typeID("DocI"));    
    }
    catch(ex) {
        return -1;        
    }

};

Photoshop.prototype.SetActiveDocument = function(document) {
    
    this.SetActiveDocumentFromId(document.DocumentId);

};

Photoshop.prototype.SetActiveDocumentFromId = function(documentId) {
    
    var documentDescriptor = new ActionDescriptor();
    var documentReference = new ActionReference();
    documentReference.putIdentifier(typeID("Dcmn"), documentId);
    documentDescriptor.putReference(typeID("null"), documentReference);
    executeAction(typeID("slct"), documentDescriptor, DialogModes.NO);

};



Photoshop.prototype.GetRulerUnits = function() {
    return preferences.rulerUnits; 
};



Photoshop.prototype.SetRulerUnits = function (rulerUnits) {
    preferences.rulerUnits = rulerUnits;
};



Photoshop.prototype.GetTypeUnits = function () {
    return preferences.typeUnits;
};



Photoshop.prototype.SetTypeUnits = function (typeUnits) {
    preferences.typeUnits = typeUnits;
};


