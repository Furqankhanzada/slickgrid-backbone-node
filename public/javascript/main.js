var List = Backbone.Model.extend({
});

var Lists = Backbone.Collection.extend({
    modal: List,
    url: '/api/lists'
});

var TableView = Backbone.View.extend({
    tagName: 'table',
    className: 'ui sortable table segment',
    template: _.template('<thead><tr><th>Title</th><th>Duration</th><th>%Complete</th><th>Start</th><th>Finish</th><th>Effort Driven</th></tr></thead>' +
        '<tbody></tbody>' +
        '<tfoot><tr><th>&nbsp;</th><th></th><th></th><th></th><th></th><th></th></tr></tfoot>'),
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
    template: _.template('<td><%= title %></td><td><%= duration %></td><td><%= complete %></td><td><%= start %></td><td><%= finish %></td><td><%= effort_driven %></td>'),
    render: function(){
        this.$el.html(this.template(this.model));
        return this;
    }
});

$(function(){
    var tableView = new TableView();
    $('.wrapper').append(tableView.render().el);
});