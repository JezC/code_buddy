var CodeBuddy = {
  stack     : null,
  stackView : null,
  backbone  : {}
}

CodeBuddy.backbone.Address = Backbone.Model.extend({
  selected: function() {
    return CodeBuddy.stack.selectedAddress() == this
  },
});

CodeBuddy.backbone.Addresses = Backbone.Collection.extend({
  model:CodeBuddy.backbone.Address,
  
  bookmarked: function() {
    return this.select(function(address){
      return address.get('bookmarked');
    })
  }
})

CodeBuddy.backbone.Stack = Backbone.Model.extend({
  initialize: function() {
    _.bindAll(this, 'toggleBookmark', 'selectNextBookmark')
    this.bind('change:selected', this.selectionChanged);
    this.set({
      addresses: new CodeBuddy.backbone.Addresses(this.get('stack_frames')) 
    })
  },

  setSelection: function(newSelected) {
    if (newSelected >= 0 && newSelected < this.addresses().size()) {
      this.set({ selected: newSelected })
    }
  },
  
  selectPrevious: function() {
    this.setSelection(this.get('selected') - 1)
  },
  
  selectNext: function() {
    this.setSelection(this.get('selected') + 1)
  },

  addresses: function() {
    return this.get('addresses')
  },

  selectedAddress: function() {
    var selected = this.get('selected')
    return this.addresses().at(selected)
  },

  selectionChanged: function(x) {
    this.addresses().at(x.previousAttributes().selected).view.render()
    this.addresses().at(x.changedAttributes().selected).view.render()
    this.view.render()
  },

  toggleBookmark: function() {
    this.selectedAddress().set({bookmarked:!this.get('bookmarked')})
    this.selectedAddress().view.render();
  },

  selectNextBookmark: function() {
    var bookmarked = this.addresses().bookmarked();
    var length = bookmarked.length;
    var toSelect;
    if(length > 0) {
      var current = _.indexOf(bookmarked, this.selectedAddress())
      if(current > -1 && current < length - 1) {
        toSelect = bookmarked[current + 1]
      } else {
        toSelect = bookmarked[0]
      }
      return this.setSelection(toSelect.cid.substr(1)-1)
    }
  }
});

// ADDRESS VIEW - SELECTED ADDRESS IN BOLD
CodeBuddy.backbone.AddressView = Backbone.View.extend({
  tagName:  "li",

  template: _.template("<span class='container'><%= path %>:<%= line%><span class='overlay'></span></span>"),

  initialize: function() {
    this.model.view = this;
  },

  events: {
    click: "open",
    dblclick: "toggleBookmark"
  },
  
  open: function() {
    CodeBuddy.stack.set({selected: this.model.cid.substr(1)-1});
  },
  
  toggleBookmark: function() {
    this.open();
    CodeBuddy.stack.toggleBookmark();
  },

  render: function() {
    $(this.el).removeClass('selected bookmarked')
    
    var html = this.template(this.model.toJSON())

    $(this.el).html(html);
    if (this.model.selected()) {
      $(this.el).addClass('selected')
    }
    if (this.model.get('bookmarked')) {
      $(this.el).addClass('bookmarked')
    }
    return this;
  }
})

// STACK VIEW - LOGIC FOR ASSIGNING EACH ADDRESS VIEW TO EACH LI TAG
CodeBuddy.backbone.StackView = Backbone.View.extend({

  el: $("#stack"),

  initialize: function() {
    _.bindAll(this, 'selectNext', 'selectPrevious')
    this.model.view = this;
    this.model.get('addresses').each(this.addOneAddress);
  },
  
  selectPrevious: function() {
    this.model.selectPrevious();
    this.ensureVisibility();
    return false;
  },
  
  selectNext: function() {
    this.model.selectNext();
    this.ensureVisibility();
    return false;
  },
  
  ensureVisibility: function() {
    var offset = $(CodeBuddy.stack.selectedAddress().view.el).offset()
    var windowHeight = $(window).height()
    if (offset.top > windowHeight + $(window).scrollTop() - 10) {
      // scroll down
      $('html,body').animate({scrollTop: offset.top - 200}, 500);
    } else if (offset.top < $(window).scrollTop() + 100) {
      // scroll up
      $('html,body').animate({scrollTop: offset.top - 500}, 500);
    }
    return false
  },

  addOneAddress: function(address, index) {
    var view = new CodeBuddy.backbone.AddressView({model: address});
    this.$("#stack").append(view.render().el);
  },

  render: function() {
    $('#code').html(this.model.selectedAddress().get('code'))
  }
})

CodeBuddy.setKeyBindings = function(){
  $(document).bind('keydown', 'up',   CodeBuddy.stackView.selectPrevious)
  $(document).bind('keydown', 'down', CodeBuddy.stackView.selectNext)
  $(document).bind('keydown', 'a',    CodeBuddy.stack.toggleBookmark)
  $(document).bind('keydown', 's',    CodeBuddy.stack.selectNextBookmark)
}

CodeBuddy.setup = function(stackJson) {
  this.stack = new this.backbone.Stack(stackJson);
  this.stackView = new this.backbone.StackView({model: this.stack});
  this.stackView.render();
  this.setKeyBindings();
}