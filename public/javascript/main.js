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
        this.$el.html(this.template());
        return this;
    },
    events: {
        'click .add_product': 'addNew',
        'click .cancel': 'cancel'
    },
    addNew: function(){
        var _self = this;
        if(!this.$el.next('.new_product_segment').length){
            this.$el.after(this.templateNew());
            this.$el.next('.new_product_segment').find('.cancel').on('click', _self.cancel);
            this.$el.next('.new_product_segment').find('.save').on('click', _self.saveProduct);
        }
    },
    cancel: function(e){
        $(e.target).closest('.new_product_segment').remove();
    },
    saveProduct: function(e){
        var $newProductSegment = $(e.target).closest('.new_product_segment');
        App.Views.tableView.collection.create({
            name : $newProductSegment.find('input[name="name"]').val(),
            grapes : $newProductSegment.find('input[name="grapes"]').val(),
            country : $newProductSegment.find('input[name="country"]').val(),
            region : $newProductSegment.find('input[name="region"]').val(),
            year : $newProductSegment.find('input[name="year"]').val(),
            notes : $newProductSegment.find('textarea').val()
        },{wait: true});
        $newProductSegment.remove();
    }
});

var TableView = Backbone.View.extend({
    initialize: function(){
        var _self = this;
        this.collection = new Lists();
        this.collection.on('reset', this.render, this);
        this.collection.on('add', this.resetOnSave, this);
        this.collection.fetch({success: function(){
            _self.dataView.setItems(_self.resetData());
        },reset: true});
    },
    render: function(){
        var _self = this;
        var columns = _self.columnsSortable().slice();
        var options = {
            enableCellNavigation: true,
            enableColumnReorder: true,
            multiColumnSort: true,
            forceFitColumns: true,
            rowHeight: 35,
            editable: true,
            enableAddRow: true,
            enableCellNavigation: true,
            asyncEditorLoading: false,
            autoEdit: false
        };

        _self.checkboxSelector = new Slick.CheckboxSelectColumn({
            cssClass: "slick-cell-checkboxsel"
        });
        columns.unshift(_self.checkboxSelector.getColumnDefinition());
        // Create the DataView.
        _self.dataView = new Slick.Data.DataView();
        _self.grid = new Slick.Grid('#grid', _self.dataView, columns, options);
        _self.grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
        _self.grid.registerPlugin(_self.checkboxSelector);
        // selection model
        _self.grid.setSelectionModel(new Slick.RowSelectionModel());
        _self.grid.registerPlugin(_self.checkboxSelector);

        _self.dataView.onRowCountChanged.subscribe(function (e, args) {
            _self.grid.updateRowCount();
            _self.grid.render();
            $('.delete').on('click', _self.deleteProduct);
        });

        //Updated code as per comment.
        _self.grid.onCellChange.subscribe(function (e,args) {
            var Product = new List({
                id: args.item.id, // needed for DataView
                name: args.item.name,
                grapes: args.item.grapes,
                country: args.item.country,
                region: args.item.region,
                year: args.item.year,
                notes: args.item.notes
            });
            Product.save();
        });

        _self.dataView.onRowsChanged.subscribe(function (e, args) {
            _self.grid.invalidateRows(args.rows);
            _self.grid.render();
            $('.delete').on('click', {self: _self}, _self.deleteProduct);
        });

        _self.grid.onSort.subscribe(function (e, args) {
            var cols = args.sortCols;
            _self.dataView.sort(function (dataRow1, dataRow2) {
                for (var i = 0, l = cols.length; i < l; i++) {
                    var field = cols[i].sortCol.field;
                    var sign = cols[i].sortAsc ? 1 : -1;
                    var value1 = dataRow1[field], value2 = dataRow2[field];
                    var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                    if (result != 0) {
                        return result;
                    }
                }
                return 0;
            });
        });

    },
    dummyLinkFormatter: function(row, cell, value, columnDef, dataContext){
        return '<a class="'+value.toLowerCase()+'" data-id="'+dataContext.id+'" data-row="'+row+'" href="#">' + value + '</a>';
    },
    columnsSortable: function(){
        var _self = this;
        var columnsSortable = [
            {id: "id", name: "Id", field: "id", width: 350, sortable: true},
            {id: "name", name: "Name", field: "name", width: 200, sortable: true, editor: Slick.Editors.Text, formatter: _self.dummyLinkFormatter},
            {id: "grapes", name: "Grapes", field: "grapes", width: 200, sortable: true, editor: Slick.Editors.Text},
            {id: "country", name: "Country", field: "country", width: 200, sortable: true, editor: Slick.Editors.Text},
            {id: "region", name: "Region", field: "region", width: 200, sortable: true, editor: Slick.Editors.Text},
            {id: "year", name: "Year", field: "year", width: 150, sortable: true, editor: Slick.Editors.Text},
            {id: "notes", name: "notes", field: "notes", width: 600, sortable: true, editor: Slick.Editors.LongText},
            {id: "delete", name: "Delete", field: "delete", width: 100, sortable: false, formatter: _self.dummyLinkFormatter}
        ];
        return columnsSortable;
    },
    resetData: function(){
        var dataFull = [];
        _.each(this.collection.toJSON(), function(model, i){
            dataFull[i] = {
                id: model._id, // needed for DataView
                name: model.name,
                grapes: model.grapes,
                country: model.country,
                region: model.region,
                year: model.year,
                notes: model.notes,
                delete: 'Delete'
            };
        });
        return dataFull;
    },
    resetOnSave: function(){
        this.dataView.setItems(this.resetData());
    },
    deleteProduct: function(e){
        e.preventDefault();
        var $ele = $(e.target);
        var id = $ele.attr('data-id');
        var list = new List();
        list.id = id;
        list.destroy();
        e.data.self.dataView.deleteItem(id);
    }
});

$(function(){
    App.Views.tableView = new TableView();
    App.Views.menuView = new MenuView();
    var wrapper = $('.wrapper');
    wrapper.append(App.Views.menuView.render().el);
    wrapper.append(App.Views.tableView.render());
});
