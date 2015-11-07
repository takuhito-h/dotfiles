Polygons = function(){}
Polygons.CreateCrossHairShape = function(x,y) 
{
    x -= 5; y -= 5;
    return [[5 + x,0 + y],
    [5 + x,5 + y],
    [0 + x,5 + y],
    [0 + x,6 + y],
    [5 + x,6 + y],
    [5 + x,11 + y],
    [6 + x,11 + y],
    [6 + x,6 + y],
    [11 + x,6 + y],
    [11 + x,5 + y],
    [6 + x,5 + y],
    [6 + x,0 + y], 
    [5 + x,0 + y]];
    
    
};
Polygons.CreateHorizontalLengthShape = function(x, y, length)
{        
    y -= 5;
    var rx = x + length - 1;        
    return [[1 + x,5 + y],
    [1 + x,0 + y],
    [0 + x,0 + y],
    [0 + x,11 + y],
    [1 + x,11 + y],
    [1 + x,6 + y],
    
    [0 + rx ,6 + y],
    [0 + rx ,11 + y],
    [1 + rx ,11 + y],
    [1 + rx ,0 + y],
    [0 + rx ,0 + y],
    [0 + rx ,5 + y],
    [1 + x,5 + y]];             
};

Polygons.CreateVerticalLengthShape = function(x, y, length)
{        
    
    var ry = y + length - 1;        
    
    return [[5 + x,1 + y],
    [0 + x,1 + y],
    [0 + x,0 + y],
    [11 + x,0 + y],
    [11 + x,1 + y],
    [6 + x,1 + y],
    
    [6 + x ,0 + ry],
    [11 + x ,0 + ry],
    [11 + x ,1 + ry],
    [0 + x ,1 + ry],
    [0 + x ,0 + ry],
    [5 + x ,0 + ry],
    [5 + x,1 + y]];             
};

Polygons.DrawRectangle = function(document, bounds, color, opacity)
{
    if(document.SetSelectionBounds(bounds).IsEmpty() == false)
    {
        document.CreateSolidColorLayer(color, opacity);
    }    
}
Polygons.DrawCrossHair = function(document, selectionBounds, x, y)
{
    
    if(document.CreatePolygonLayer(Foreground, Polygons.CreateCrossHairShape(x , y)))
    {        
        var text = FixUnit(x - selectionBounds.X) + "," + FixUnit(y - selectionBounds.Y);
        document.CreateTextLayer(x + 3, y, text, Foreground, FontFamily, FontSize,  IsBold, typeID("Left"), antiAlising);      
    }
}

Polygons.DrawLength = function(document, x, y, length, isHorizontal, color, fontFamily, fontSize, isBold, antiAlising)
{
 
    if(isHorizontal)
    {
        if(document.CreatePolygonLayer(color, Polygons.CreateHorizontalLengthShape(x , y + 6, length)))
        {
            document.CreateTextLayer(x + (length / 2), y + 6, FixUnit(length), color, fontFamily, fontSize, isBold, typeID("Cntr"), antiAlising);    
        }   
    }
    else
    {
        if(document.CreatePolygonLayer(color, Polygons.CreateVerticalLengthShape(x + 1, y, length)))
        {
            document.CreateTextLayer(x + 7, y + (length / 2) - 6, FixUnit(length), color, fontFamily, fontSize, isBold, typeID("Left"), antiAlising);    
        }      
    }
   
}
