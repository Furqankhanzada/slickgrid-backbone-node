window.App = {
    Views: {},
    Models: {},
    Collections: {}
};
var List = Backbone.Model.extend({
    urlRoot: '/api/products'
});

var Lists = Backbone.Collection.extend({
    modal: List,
    url: '/api/products'
});

var MenuView = Backbone.View.extend({
    template: _.template('<div class="ui menu"><a class="active add_product item"><i class="pencil icon"></i> Add Product</a><div class="right menu"><div class="item"><div class="ui icon input"><input type="text" placeholder="Search..."><i class="search link icon"></i></div></div></div></div>'),
    templateNew: _.template('<div class="ui fluid form new_product_segment segment"><div class="five fields"><div class="field"><input type="text" name="name" placeholder="Name"> </div> <div class="field"> <input type="text" name="grapes" placeholder="Grapes"></div><div class="field"> <input type="text" name="country" placeholder="Country"></div><div class="field"> <input type="text" name="region" placeholder="Region"></div><div class="field"> <input type="text" name="year" placeholder="Year"></div><div class="field" style="padding-left: 0; width: 99%;"> <textarea placeholder="Notes"></textarea></div></div><div class="ui blue submit save button">Save</div><div style="margin-left: 10px" class="ui blue cancel submit button">Cancel</div></div>'),
    render: function(){
        var _self = this;
        //this.$el.html(this.template());
        return this;
    },
    events: {
        'click .add_product': 'addNew',
        'click .cancel': 'cancel'
    },
    addNew: function(){
        var _self = this;
        if(!this.$el.next('.new_product_segment').length){
            //this.$el.after(this.templateNew());
            this.$el.next('.new_product_segment').find('.cancel').on('click', _self.cancel);
            this.$el.next('.new_product_segment').find('.save').on('click', _self.saveProduct);
        }
    },
    cancel: function(e){
        $(e.target).closest('.new_product_segment').remove();
    },
    saveProduct: function(e){
        console.log('saveProduct');
        var $newProductSegment = $(e.target).closest('.new_product_segment');
        App.Views.tableView.collection.create({
            name : $newProductSegment.find('input[name="name"]').val(),
            grapes : $newProductSegment.find('input[name="grapes"]').val(),
            country : $newProductSegment.find('input[name="country"]').val(),
            region : $newProductSegment.find('input[name="region"]').val(),
            year : $newProductSegment.find('input[name="year"]').val(),
            notes : $newProductSegment.find('textarea').val()
        },{wait: true});
    }
});

var TableView = Backbone.View.extend({
    tagName: 'div',
    className: 'grid',
    id: 'grid',
    template: _.template('<thead><tr><th>Id</th><th>Name</th><th>Grapes</th><th>Country</th><th>Region</th><th>Year</th><th>Notes</th><th>Action</th></tr></thead>' +
        '<tbody></tbody>' +
        '<tfoot><tr><th>&nbsp;</th><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></tfoot>'),
    templateNew: _.template('<tr></tr><td class="disabled"><input type="text"></td><td><input type="text" name="name"></td><td><input type="text" name="grapes"></td><td><input type="text" name="country"></td><td><input type="text" name="region"></td><td><input type="text" name="year"></td><td><input type="text" name="notes"></td><td><div class="ui tiny buttons"><div class="ui teal button">Cancel</div><div class="or"></div><div class="ui negative button">Save</div></td>'),
    templateEdit: _.template('<td class="disabled"><%= _id %></td><td><%= name %></td><td><%= grapes %></td><td><%= country %></td><td><%= region %></td><td><%= year %></td><td><%= notes %></td><td><div class="ui tiny buttons"><div class="ui teal button">Edit</div><div class="or"></div><div class="ui negative button">Delete</div></td>'),
    initialize: function(){
        var _self = this;
        this.collection = new Lists();
        this.collection.on('reset', this.render, this);
        this.collection.on('add', this.render, this);
        this.collection.on('remove', this.render, this);
        this.collection.fetch({success: function(){
            function DummyLinkFormatter(row, cell, value, columnDef, dataContext) {
                return '<a href="#">' + value + '</a>';
            }

            var columnsSortable = [
                {id: "id", name: "Id", field: "id", width: 350, sortable: true},
                {id: "name", name: "Name", field: "name", width: 400, sortable: true, formatter: DummyLinkFormatter},
                {id: "grapes", name: "Grapes", field: "grapes", width: 200, sortable: true},
                {id: "country", name: "Country", field: "country", width: 200, sortable: true},
                {id: "region", name: "Region", field: "region", width: 200, sortable: true},
                {id: "year", name: "Year", field: "year", width: 150, sortable: true},
                {id: "notes", name: "notes", field: "notes", width: 600, sortable: true}
            ];

            var dataFull = [];
            _.each(_self.collection.toJSON(), function(model, i){
                dataFull[i] = {
                    id: model._id, // needed for DataView
                    name: model.name,
                    grapes: model.grapes,
                    country: model.country,
                    region: model.region,
                    year: model.year,
                    notes: model.notes
                };
            });


            var columns;
            var data;

            // Example 4: Row selection
            columns = columnsSortable.slice();
            data = dataFull.slice();
            console.log(dataFull)
            $("#grid").slickgrid({
                columns: columns,
                data: data,
                slickGridOptions: {
                    enableCellNavigation: true,
                    enableColumnReorder: true,
                    forceFitColumns: true,
                    rowHeight: 35
                },
                // handleCreate takes some extra options:
                sortCol: undefined,
                sortDir: true,
                handleCreate: function () {
                    var o = this.wrapperOptions;

                    // checkbox column: add it
                    var columns = o.columns.slice();
                    var checkboxSelector = new Slick.CheckboxSelectColumn({});
                    columns.unshift(checkboxSelector.getColumnDefinition());

                    // configure grid with client-side data view
                    var dataView = new Slick.Data.DataView();
                    var grid = new Slick.Grid(this.element, dataView,
                        columns, o.slickGridOptions);

                    // selection model
                    grid.setSelectionModel(new Slick.RowSelectionModel());
                    grid.registerPlugin(checkboxSelector);

                    // sorting
                    var sortCol = o.sortCol;
                    var sortDir = o.sortDir;
                    function comparer(a, b) {
                        var x = a[sortCol], y = b[sortCol];
                        return (x == y ? 0 : (x > y ? 1 : -1));
                    }
                    grid.onSort.subscribe(function (e, args) {
                        sortDir = args.sortAsc;
                        sortCol = args.sortCol.field;
                        dataView.sort(comparer, sortDir);
                        grid.invalidateAllRows();
                        grid.render();
                    });

                    // set the initial sorting to be shown in the header
                    if (sortCol) {
                        grid.setSortColumn(sortCol, sortDir);
                    }

                    // initialize the model after all the events have been hooked up
                    dataView.beginUpdate();
                    dataView.setItems(o.data);
                    dataView.endUpdate();

                    // if you don't want the items that are not visible (due to being filtered out
                    // or being on a different page) to stay selected, pass 'false' to the second arg
                    dataView.syncGridSelection(grid, true);

                    grid.resizeCanvas(); // XXX Why is this needed? A possible bug?
                    // If this is missing, the grid will have
                    // a horizontal scrollbar, and the vertical
                    // scrollbar cannot be moved. A column reorder
                    // action fixes the situation.

                }

            });

        },reset: true});
    },
    render: function(){
        var _self = this;
        this.$el.html(this.template());
        console.log(this.collection.toJSON());
        _.each(this.collection.toJSON(), function(model){
            _self.addOne(model);
        });
        return this;
    },
    events: {
        'click .delete': 'deleteProduct'
    },
    addNew: function(){
        this.$el.find('tbody').prepend(this.templateNew());
    },
    addOne: function(model){
        var tableViewRow = new TableViewRow({model:model});
        this.$el.find('tbody').append(tableViewRow.render().el);
    },
    deleteProduct: function(e){
        var id = $(e.target).closest('tr').find('td:first').text();
        var list = new List();
        list.id = id;
        list.destroy();
        var m = this.collection.where({ _id: id})[0];
        this.collection.remove(m);
    }
});

var TableViewRow = Backbone.View.extend({
    tagName: 'tr',
    template: _.template('<td class="disabled"><%= _id %></td><td><%= name %></td><td><%= grapes %></td><td><%= country %></td><td><%= region %></td><td><%= year %></td><td><%= notes %></td><td><div class="ui tiny buttons"><div class="ui teal button">Edit</div><div class="or"></div><div class="ui negative button delete">Delete</div></td>'),
    render: function(){
        this.$el.html(this.template(this.model));
        return this;
    }
});

$(function(){
    App.Views.tableView = new TableView();
    App.Views.menuView = new MenuView();
    var wrapper = $('.wrapper');
    wrapper.append(App.Views.menuView.render().el);
    wrapper.append(App.Views.tableView.render().el);
});
