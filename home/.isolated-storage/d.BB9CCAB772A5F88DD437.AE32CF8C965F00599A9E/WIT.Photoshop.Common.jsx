function stopWatch(executeFunction)
{
    var current = new Date().getTime();
    executeFunction();    
    return new Date().getTime() - current;
}

function typeID(value) {
    if(value == null) return 0;
    if (value.length == 4) return charIDToTypeID(value);
    else return stringIDToTypeID(value);
}
function roundf(n) {
    var v = (n / 100.0).toFixed(4) * 100.0;
    return parseFloat(v);
}

function FixedSizeForBounds(bounds, width, height) {
    
    var halfWidth = width / 2.0;
    var halfHeight = height / 2.0;
    
    var x = Math.round((bounds.X + bounds.Width / 2.0) - halfWidth);
    var y = Math.round((bounds.Y + bounds.Height / 2.0) - halfHeight);
    
    return new Rectangle(x, y, width, height);
    
}

function FixUnit(value) {
    var result = value;
    
    if (RulerUnit == null || RulerUnit == "Pixel") result = value;
    else if (RulerUnit == "LDPI") result = value * (160.0 / 120.0);
    else if (RulerUnit == "MDPI") result = value * (160.0 / 160.0);
    else if (RulerUnit == "TVDPI") result = value * (160.0 / 213.0);
    else if (RulerUnit == "HDPI") result = value * (160.0 / 240.0);
    else if (RulerUnit == "XHDPI") result = value * (160.0 / 320.0);
    else if (RulerUnit == "XXHDPI") result = value * (160.0 / 480.0);
    else if (RulerUnit == "XXXHDPI") result = value * (160.0 / 640.0);

    result = roundf(result);

    if(DisplayOnlyIntegers == true) result = Math.floor(result);
    
    return result;
}

function ApplyRulerResolution(resolution)
{
    var rulerResolution = resolution;
    if (RulerUnit == "LDPI")		rulerResolution = 120.0;
    else if (RulerUnit == "MDPI")	rulerResolution = 160.0;
    else if (RulerUnit == "TVDPI")	rulerResolution = 213.0;
    else if (RulerUnit == "HDPI")	rulerResolution = 240.0;
    else if (RulerUnit == "XHDPI")	rulerResolution = 320.0;
    else if (RulerUnit == "XXHDPI") rulerResolution = 480.0;
    else if (RulerUnit == "XXXHDPI") rulerResolution = 640.0;
	
    return rulerResolution;
}

function FixTypeUnit(value, resolution) {
    var result = value;
    
    var sourceType = preferences.typeUnits;
    if(sourceType == TypeUnits.PIXELS) sourceType = "PX";
    else if(sourceType == TypeUnits.POINTS) sourceType = "PT";
    else if(sourceType == TypeUnits.MM) return roundf(value);

    var targetType = "";
	var rulerResolution = ApplyRulerResolution(resolution);

    //if(sourceType == TypeUnit) return roundf(value);

    if(sourceType == "PT") result = result / 72 * resolution; // resolution
    
    // convert to px
        
    if(TypeUnit == "PT") result = (result / rulerResolution) * 72;
    else if(TypeUnit == "SP") result = result * (160.0 / rulerResolution);   

    result = roundf(result);
    
    if(DisplayOnlyIntegers  == true) result = Math.floor(result);

    return result;
}

function Dump(descriptor) {

    var count = descriptor.count;
    $.writeln("==========================");
    for (var i = 0; i < count; i++) {
        var key = descriptor.getKey(i);
        $.writeln(typeIDToCharID(key) + "\t" + typeIDToStringID(key));
    }
    $.writeln("==========================");
}

var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
Math.uuid = function () {
    var uuid = [], i;
    var r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
            r = 0 | Math.random()*16;
            uuid[i] = CHARS[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
    }
    return uuid.join('');
};

Object.prototype.getType = function()
{
    if (this && this.constructor && this.constructor.toString) {
        var arr = this.constructor.toString().match(/function\s*(\w+)/);
        if (arr && arr.length == 2) return arr[1];
    }
    return undefined;
}

//------------------------------------------------
// Color Type
//------------------------------------------------
function Color(r, g, b) {
    this.R = r;
    this.G = g;
    this.B = b;
    this.A = 255.0;
    this.Hex = function() {
        return ("#" + componentToHex(this.R) + componentToHex(this.G) + componentToHex(this.B)).toUpperCase();
    };
    this.RGB = function() {
        return ("(" + Math.round(this.R) + "," + Math.round(this.G) + "," + Math.round(this.B) + ")");
    };
    this.toString = function() {
        
        if(typeof ColorType == "undefined") ColorType = "";
        
        if(ColorType == "RGB") return this.RGB();
        else if(ColorType == "HEX") return this.Hex();
        else return (this.Hex() + " / " + this.RGB());        
    };
    function componentToHex(c) {
        c = Math.round(c);
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
}

Color.prototype.ToDescriptor = function() {    
    var result = new ActionDescriptor();
    result.putDouble(typeID("Rd  "), this.R);
    result.putDouble(typeID("Grn "), this.G);
    result.putDouble(typeID("Bl  "), this.B);
    return result;    
};

Color.FromDescriptor = function (descriptor) {
    var r = descriptor.getDouble(typeID("Rd  "));
    var g = descriptor.getDouble(typeID("Grn "));
    var b = descriptor.getDouble(typeID("Bl  "));
    return new Color(r, g, b);
};

//------------------------------------------------
// Size Type start
//------------------------------------------------
function Size(width, height) {
    this.Width = width;
    this.Height = height;
}
Size.prototype.toString = function() {
    return this.Width + "," + this.Height;
};

Size.prototype.ToDescriptor = function () {

};
Size.FromDescriptor = function (descriptor, ratio) {
    if (ratio == null) ratio = 1;
    var width = descriptor.getUnitDoubleValue(typeID("Wdth")) * ratio;
    var height = descriptor.getUnitDoubleValue(typeID("Hght")) * ratio;
    return new Size(width, height);
};
//------------------------------------------------
// Rectangle Type start
//------------------------------------------------
var EmptyRectangle = new Rectangle(0, 0, 0, 0);
function Rectangle(x, y, width, height) {
    this.X = x;
    this.Y = y;
    this.Width = width;
    this.Height = height;

    this.Right = function () {
        return this.X + this.Width;
    };
    this.Bottom = function() {
        return this.Y + this.Height;
    };
    this.IsEmpty = function() {
        if (this.Width > 0) {
            return (this.Height <= 0);
        }
        return true;
    };
    this.Size = function() {
        return new Size(this.Width, this.Height);
    };
    this.IntersectsWith = function(rect) {
        return ((((rect.X < (this.X + this.Width)) && (this.X < (rect.X + rect.Width))) && (rect.Y < (this.Y + this.Height))) && (this.Y < (rect.Y + rect.Height)));
    };
    this.Contains = function(rect) {
        return ((((this.X <= rect.X) && ((rect.X + rect.Width) <= (this.X + this.Width))) && (this.Y <= rect.Y)) && ((rect.Y + rect.Height) <= (this.Y + this.Height)));
    };

}
Rectangle.prototype.toString = function() {
    return this.X + "," + this.Y + "," + this.Width + "," + this.Height;
};

Rectangle.prototype.Intersect = function(b) {

    var a = this;

    var x = Math.max(a.X, b.X);
    var num2 = Math.min((a.X + a.Width), (b.X + b.Width));
    var y = Math.max(a.Y, b.Y);
    var num4 = Math.min((a.Y + a.Height), (b.Y + b.Height));
    if ((num2 >= x) && (num4 >= y)) {
        return new Rectangle(x, y, num2 - x, num4 - y);
    }
    return EmptyRectangle;
};

Rectangle.prototype.Union = function(b) {
    var a = this;
    var x = Math.min(a.X, b.X);
    var num2 = Math.max((a.X + a.Width), (b.X + b.Width));
    var y = Math.min(a.Y, b.Y);
    var num4 = Math.max((a.Y + a.Height), (b.Y + b.Height));
    return new Rectangle(x, y, num2 - x, num4 - y);
};

Rectangle.prototype.ToDescriptor = function () {
    
    var result = new ActionDescriptor();
    result.putUnitDouble(typeID("Left"), typeID("#Pxl"), this.X);
    result.putUnitDouble(typeID("Top "), typeID("#Pxl"), this.Y);
    result.putUnitDouble(typeID("Rght"), typeID("#Pxl"), this.Right());
    result.putUnitDouble(typeID("Btom"), typeID("#Pxl"), this.Bottom());
    return result;
    
};
Rectangle.FromDescriptor = function (descriptor) {
    
    var boundsStringId = typeID("bounds");
    var rectangle = descriptor.getObjectValue(boundsStringId);
    var left = rectangle.getUnitDoubleValue(typeID("Left"));
    var top = rectangle.getUnitDoubleValue(typeID("Top "));
    var right = rectangle.getUnitDoubleValue(typeID("Rght"));
    var bottom = rectangle.getUnitDoubleValue(typeID("Btom"));
    return new Rectangle(left, top, (right - left), (bottom - top));
    
};
//------------------------------------------------
// Point Type start
//------------------------------------------------
function Point(x, y) {
    this.X = x;
    this.Y = y;
}

Point.prototype.toString = function() {
    return this.X + "," + this.Y;
};

Point.prototype.ToDescriptor = function (pointType) {
    if(pointType == null) pointType = typeID("#Pxl");
    var result = new ActionDescriptor();
    result.putUnitDouble(typeID("Hrzn"), pointType, this.X);
    result.putUnitDouble(typeID("Vrtc"), pointType, this.Y);
    return result;
};


//------------------------------------------------
// Dropshadow Type Start
//------------------------------------------------
function DropShadow() {
    this.Color = null;
    this.Distance = 0;
    this.Size = 0;
    this.Angle = 0;
	this.Opacity = 0;
}
DropShadow.prototype.toString = function() {       
    return "Shadow_" + this.Color.toString() + "_" + this.Distance + "px_" + this.Size + "px(" + Math.round(this.Angle) + "')";
};
DropShadow.FromDescriptor = function (dropShadow, globalLight) {
    
    var result = new DropShadow();
    if(globalLight == null) globalLight = 120;
    
    if(dropShadow.getBoolean(typeID("enabled")))
    {
        
        if(dropShadow.hasKey(typeID("Clr ")))
        {
            result.Color = Color.FromDescriptor(dropShadow.getObjectValue(typeID("Clr ")));
        }

        if(dropShadow.hasKey(typeID("Dstn")))
        {
            result.Distance = dropShadow.getDouble(typeID("Dstn"));
        }

        if(dropShadow.hasKey(typeID("blur")))
        {
            result.Size = dropShadow.getDouble(typeID("blur"));
        }            

        if(dropShadow.hasKey(typeID("Opct")))
        {
            result.Opacity = dropShadow.getDouble(typeID("Opct"));
        }            

        if(dropShadow.getBoolean(typeID("uglg")))
        {
            result.Angle = globalLight;
        }
        else
        {
            result.Angle = dropShadow.getDouble(typeID("lagl"));
        }
                       
        return result;
        
    }

    return null;
    
};