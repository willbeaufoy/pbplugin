var Helloworld = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
  },

  onMenuItemCommand: function() {
    window.open("chrome://helloworld/content/hello.xul", "", "chrome");
  }
};

window.addEventListener("load", function(e) { Helloworld.onLoad(e); }, false); 