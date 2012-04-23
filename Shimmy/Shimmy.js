var _ = require('/lib/underscore');
var EventEmitter2 = require('/lib/EventEmitter2').EventEmitter2;
var osname = Ti.Platform.osname;
/*
 * Wrapper for Titanium UI components.  This wrapper provides a few pieces of critical
 * functionality, currently missing from Titanium UI objects:
 * - The ability to safely extend components with new members
 * - Rudimentary resource management and object lifecycle handling
 * Extended and modified from Shimmys in the Ti Community app
 */

Shimmy.prototype = new EventEmitter2();
Shimmy.prototype.constructor = Shimmy;


function Shimmy(tiElement) {
  this.proxy = tiElement;
}

//Wrappers for common Titanium view construction functions
Shimmy.prototype.add = function(tiChildView) {
  if('array' === typeof tiChildView) {
    for(var x = 0; x < tiChildView.length; x++){
      var v = tiChildView[x].proxy||tiChildView[x];
      this.proxy.add(v);
    }
  } else {
    var v = tiChildView.proxy||tiChildView;
    this.proxy.add(v);
  }
  return this;
};

Shimmy.prototype.remove = function(tiChildView) {
  var v = tiChildView.proxy||tiChildView;
  this.proxy.remove(v);
  return this;
};

Shimmy.prototype.open = function(args) {
  if (this.proxy.open) {
    this.proxy.open(args||{animated:false});
  }
  return this;
};

Shimmy.prototype.close = function(args) {
  if (this.proxy.close) {
    this.proxy.close(args||{animated:false});
  }
  return this;
};

Shimmy.prototype.animate = function(args,callback) {
  this.proxy.animate(args,callback||function(){});
  return this;
};

Shimmy.prototype.updateLayout = function(args, cb) {
  this.proxy.updateLayout(args);
  return this;
};

//Getter/Setter for the wrapped Titanium view proxy object
Shimmy.prototype.get = function(key) {
  return this.proxy[key];
};

Shimmy.prototype.set = function(key,value) {
  if ('object' === typeof key) this.proxy.updateLayout(key);
  this.proxy[key] = value;
  return this;
};

//Event Handling For Proxy Element Events
Shimmy.prototype.onProxy = function(event,callback) {
  switch (event) {
    case 'location':
      this.globalHandlers.location = callback;
      Ti.Geolocation.addEventListener('location', this.globalHandlers.location);
      break;
    case 'orientationchange':
      this.globalHandlers.orientationchange = callback;
      Ti.Gesture.addEventListener('orientationchange', this.globalHandlers.orientationchange);
      break;
    default:
      this.proxy.addEventListener(event,callback);
      break;
  }
};
Shimmy.prototype.emitProxy = function(event,data) {
  this.proxy.fireEvent(event,data||{});
};

//This should be overridden by any Shimmys which wish to execute custom
//clean up logic, to release their child components, etc.
Shimmy.prototype.onDestroy = function() {};

//Clean up resources used by this Shimmy
Shimmy.prototype.release = function() {
  //force cleanup on proxy
  this.proxy = null;

  //run custom cleanup logic
  this.onDestroy();
};


function ui(tiElement, args){
  var self;
  if ('object' === typeof tiElement) {
    self = tiElement;
  } else {
    self = (args && args.platform) ? Ti.UI[args.platform]['create'+tiElement](args||{}) : Ti.UI['create'+tiElement](args||{});
  }

  return new Shimmy(self);
}

ui.Button = function (params) {
  var self = ui('Window', params);
  return self;
};

ui.ButtonBar = function(params) {
  var self = ui('View', params);
  return self;
};

ui.CoverFlow = function(params) {
  var self = ui('CoverFlowView', params);
  return self;
};

ui.DashIcon = function(params) {
  var self = ui('DashboardItem', params);
  return self;
};

ui.DashBoard = function(params) {
  var self = ui('DashboardView', params);
  return self;
};

ui.EmailDialog = function(params) {
  var self = ui('EmailDialog', params);
  return self;
};

ui.Image = function(params) {
  var self = ui('ImageView',  _.extend({
    image:img,
    height:Ti.UI.SIZE,
    width:Ti.UI.SIZE
  },params||{}));

  return self;
};

ui.Label = function(params) {
  var self = ui('Label',_.extend({
    text:params.text,
    color:'#000',
    height:Ti.UI.SIZE,
    width:Ti.UI.SIZE,
    font: {
      fontFamily: (osname === 'android') ? 'Droid Sans' : 'Helvetica Neue',
      fontSize: 14
    }
  },params||{}));
  return self;
};

ui.NavGroup = function(params) {
  //Hard coded platform until Android and Mobile Web NavigationGroup shim is made
  params.platform = 'iPhone';
  params.window = params.window.proxy;
  var self = ui('NavigationGroup',params)

  self.open = function(win, params) {
    self.proxy.open(win.proxy,params);
  };
  return self;
};

ui.OptionDialog = function(params) {
  var self = ui('OptionDialog', params);
  return self;
};

ui.Picker = function(params) {
  var self = ui('Picker', params);
  return self;
};

ui.Row = function(params) {
  var self = ui('TableViewRow', params);
  return self;
};

ui.ScrollableView = function(params) {
  var self = ui('OptionDialog', params);
  return self;
};

ui.ScrollView = function(params) {
  var self = ui('ScrollView', params);
  return self;
};

ui.TabGroup = function(params) {
  var tabs = params.tabs;

  delete params.tabs;

  var self = ui('TabGroup', params);

  function next(i) {
    var tab = Ti.UI.createTab({
        icon:tabs[i].icon,
        title:tabs[i].title,
        window: tabs[i].window
    });
    self.proxy.addTab(tab);
    if (i < tabs.length -1) next(i+1);
  }
  next(0);

  return self;
};

ui.TableSection = function(params) {
  var self = ui('TableViewSection', params);
  return self;
};

ui.TextArea = function(params) {
  var self = ui('TextArea', params);
  return self;
};

ui.TextField = function(params) {
  var self = ui('TextField', params);
  return self;
};

ui.Toolbar = function(params) {
  var self = ui('Toolbar', params);
  return self;
};

ui.View = function(params) {
  var self = ui('View', params);
  return self;
};

ui.WebView = function(params) {
  var self = ui('WebView', params);
  return self;
};

ui.Window = function(params) {
  var self = ui('Window', params);
  return self;
};

ui.Table = function(args) {
  var self = ui('TableView', args);

  self.setDate = function(data) {
    self.proxy.setData(data);
  };

  /**
   * Pull to Refresh
   *

  function formatDate() {
    var date = new Date();
    var datestr = date.getMonth()+'/'+date.getDate()+'/'+date.getFullYear();
    if (date.getHours()>=12)
    {
      datestr+=' '+(date.getHours()==12 ? date.getHours() : date.getHours()-12)+':'+date.getMinutes()+' PM';
    }
    else
    {
      datestr+=' '+date.getHours()+':'+date.getMinutes()+' AM';
    }
    return datestr;
  }

  var border = Ti.UI.createView({
    backgroundColor:"#576c89",
    height:2,
    bottom:0
  });

  var tableHeader = Ti.UI.createView({
    backgroundColor:"#e2e7ed",
    width:320,
    height:60
  });

  // fake it til ya make it..  create a 2 pixel
  // bottom border
  tableHeader.add(border);

  var arrow = Ti.UI.createView({
    backgroundImage:"../images/whiteArrow.png",
    width:23,
    height:60,
    bottom:10,
    left:20
  });

  var statusLabel = Ti.UI.createLabel({
    text:"Pull to reload",
    left:55,
    width:200,
    bottom:30,
    height:"auto",
    color:"#576c89",
    textAlign:"center",
    font:{fontSize:13,fontWeight:"bold"},
    shadowColor:"#999",
    shadowOffset:{x:0,y:1}
  });

  var lastUpdatedLabel = Ti.UI.createLabel({
    text:"Last Updated: "+formatDate(),
    left:55,
    width:200,
    bottom:15,
    height:"auto",
    color:"#576c89",
    textAlign:"center",
    font:{fontSize:12},
    shadowColor:"#999",
    shadowOffset:{x:0,y:1}
  });

  var actInd = Titanium.UI.createActivityIndicator({
    left:20,
    bottom:13,
    width:30,
    height:30
  });

  tableHeader.add(arrow);
  tableHeader.add(statusLabel);
  tableHeader.add(lastUpdatedLabel);
  tableHeader.add(actInd);

  self.proxy.headerPullView = tableHeader;


  var pulling = false;
  var reloading = false;

  function beginReloading()
  {
    self.emit('reload');
    setTimeout(endReloading,2000);
  }

  function endReloading()
  {
    // simulate loading
    for (var c=lastRow;c<lastRow+10;c++)
    {
      self.proxy.appendRow({title:"Row "+c});
    }
    lastRow += 10;

    // when you're done, just reset
    self.proxy.setContentInsets({top:0},{animated:true});
    reloading = false;
    lastUpdatedLabel.text = "Last Updated: "+formatDate();
    statusLabel.text = "Pull down to refresh...";
    actInd.hide();
    arrow.show();
  }
    self.on('endReload', function(){
      endReloading();
    });

  self.proxy.addEventListener('scroll',function(e)
  {
    var offset = e.contentOffset.y;
    var height = e.size.height;
    var total = offset + height;
    var theEnd = e.contentSize.height;
    var distance = theEnd - total;

    if (offset < -65.0 && !pulling && !reloading)
    {
      var t = Ti.UI.create2DMatrix();
      t = t.rotate(-180);
      pulling = true;
      arrow.animate({transform:t,duration:180});
      statusLabel.text = "Release to refresh...";
    }
    else if((offset > -65.0 && offset < 0 ) && pulling && !reloading)
    {
      pulling = false;
      var t = Ti.UI.create2DMatrix();
      arrow.animate({transform:t,duration:180});
      statusLabel.text = "Pull down to refresh...";
    }

    // going down is the only time we dynamically load,
    // going up we can safely ignore -- note here that
    // the values will be negative so we do the opposite
    if ((distance < lastDistance) && self.proxy.data > 10)
    {
      // adjust the % of rows scrolled before we decide to start fetching
      var nearEnd = theEnd * 0.75;

      if (!updating && (total >= nearEnd))
      {
        beginUpdate();
      }
    }
    lastDistance = distance;
  });

  self.proxy.addEventListener('dragEnd', function()
  {
    if(pulling && !reloading)
    {
      reloading = true;
      pulling = false;
      arrow.hide();
      actInd.show();
      statusLabel.text = "Reloading...";
      self.proxy.setContentInsets({top:60},{animated:true});
      self.proxy.scrollToTop(-60,true);
      arrow.transform=Ti.UI.create2DMatrix();
      beginReloading();
    }
  });


  /**
   * Lazy Loader
   *

  var data = [];
  var lastRow = 10;

  var updating = false;
  var loadingRow = Ti.UI.createTableViewRow({title:"Loading..."});

  function beginUpdate()
  {
    updating = true;

    self.proxy.appendRow(loadingRow);

    // just mock out the reload
    setTimeout(endUpdate,2000);
  }

  function endUpdate()
  {
    updating = false;

    self.proxy.deleteRow(lastRow,{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.NONE});

    // simulate loading
    for (var c=lastRow;c<lastRow+10;c++)
    {
      self.proxy.appendRow({title:"Row "+(c+1)},{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.NONE});
    }
    lastRow += 10;

    // just scroll down a bit to the new rows to bring them into view
    self.proxy.scrollToIndex(lastRow-9,{animated:true,position:Ti.UI.iPhone.TableViewScrollPosition.BOTTOM});

  }

  var lastDistance = 0; // calculate location to determine direction
  */
  return self;
}


exports.UI = ui;


//adding to public interface
exports.Shimmy = Shimmy;