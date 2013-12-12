var List = Backbone.Model.extend({
});

var Lists = Backbone.Collection.extend({
    modal: List,
    url: '/api/products'
});

var TableView = Backbone.View.extend({
    tagName: 'table',
    className: 'ui sortable table segment',
    template: _.template('<thead><tr><th>Id</th><th>Name</th><th>Grapes</th><th>Country</th><th>Region</th><th>Year</th><th>Notes</th><th>Action</th></tr></thead>' +
        '<tbody></tbody>' +
        '<tfoot><tr><th>&nbsp;</th><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></tfoot>'),
    initialize: function(){
        var _self = this;
        this.collection = new Lists();
        this.collection.on('reset', this.render, this);
        this.collection.fetch({reset: true});
    },
    render: function(){
        var _self = this;
        this.$el.html(this.template());
        console.log(this.collection.toJSON());
        _.each(this.collection.toJSON(), function(model){
            _self.addOne(model);
        });
        this.$el.tablesort();
        return this;
    },
    addOne: function(model){
        var tableViewRow = new TableViewRow({model:model});
        this.$el.find('tbody').append(tableViewRow.render().el);
    }
});

var TableViewRow = Backbone.View.extend({
    tagName: 'tr',
    template: _.template('<td class="disabled"><%= _id %></td><td><%= name %></td><td><%= grapes %></td><td><%= country %></td><td><%= region %></td><td><%= year %></td><td><%= notes %></td><td><div class="ui tiny buttons"><div class="ui teal button">Edit</div><div class="or"></div><div class="ui negative button">Delete</div></td>'),
    render: function(){
        this.$el.html(this.template(this.model));
        return this;
    }
});

$(function(){
    var tableView = new TableView();
    $('.wrapper').append(tableView.render().el);
});